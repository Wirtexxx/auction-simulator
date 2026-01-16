# Система Real-Time Аукционов - Документация

## Обзор функционала

Система реализует real-time аукционы с раундовой логикой, где:
- Пользователи делают **одну ставку на весь аукцион**
- Ставка **моментально замораживает баланс**
- Победители раунда определяются по **топ-N ставкам** (где N = `gifts_per_round`)
- Проигравшим средства **полностью возвращаются**
- Логика работает в **real-time через WebSocket**
- Система **устойчива к рестартам сервера**

## Архитектура

```
┌─────────────┐
│   Client    │ (WebSocket)
└──────┬──────┘
       │ bid
       ▼
┌─────────────────┐
│ WebSocket Server│
└──────┬──────────┘
       │
       ├──► BidService ──► Redis (ставки)
       │                  └──► WalletService (заморозка)
       │
       ▼
┌─────────────────┐
│ Round Timer     │ (worker процесс)
└──────┬──────────┘
       │ проверяет таймеры
       ▼
┌─────────────────┐
│ SettlementService│
└──────┬───────────┘
       │
       ├──► Определяет победителей
       ├──► Списание для победителей
       ├──► Возврат для проигравших
       └──► Переход к следующему раунду
```

## Компоненты системы

### 1. MongoDB (Persistent Storage)

**Модель Auction:**
- `collection_id` - ID коллекции подарков
- `round_duration` - длительность раунда в секундах
- `gifts_per_round` - количество подарков на раунд
- `current_round_number` - текущий номер раунда
- `current_round_started_at` - время начала текущего раунда
- `total_rounds` - общее количество раундов (вычисляется: `ceil(total_amount / gifts_per_round)`)
- `status` - статус: `active` | `finished`
- `created_at` - время создания

**Модель Round:**
- `auction_id` - ID аукциона
- `round_number` - номер раунда
- `gift_ids` - массив ID подарков в раунде
- `started_at` - время начала
- `ended_at` - время окончания
- `status` - статус: `active` | `finished`

### 2. Redis (Runtime State)

**Ключи Redis:**

1. **`auction:{id}:state`** (HASH)
   - `round` - номер текущего раунда
   - `status` - статус: `active` | `finished`
   - `round_end_ts` - Unix timestamp окончания раунда (мс)
   - `settling` - флаг процесса settlement (0/1)

2. **`auction:{id}:users`** (SET)
   - Хранит ID пользователей, сделавших ставку
   - Используется как atomic lock (SADD возвращает 0, если уже существует)

3. **`auction:{id}:round:{n}:bids`** (ZSET)
   - Score: сумма ставки (для сортировки DESC)
   - Member: `{userId}:{timestamp}:{amount}` (для tie-breaking)

4. **`auction:rounds:timeouts`** (ZSET) - GLOBAL
   - Score: `round_end_ts` (Unix timestamp в мс)
   - Member: `{auctionId}:{roundNumber}`

5. **`auction:{id}:round:{n}:settled`** (STRING)
   - Значение: `"1"` если раунд settled (idempotency)

6. **`user:{userId}:frozen:{auctionId}`** (STRING)
   - Значение: замороженная сумма

## Жизненный цикл аукциона

### 1. Создание аукциона

```typescript
POST /auctions
{
  "collection_id": "...",
  "round_duration": 300,  // 5 минут
  "gifts_per_round": 5
}
```

**Процесс:**
1. Проверка существования коллекции
2. Завершение всех активных аукционов (максимум 1 активный)
3. Вычисление `total_rounds = ceil(total_amount / gifts_per_round)`
4. Создание записи в MongoDB
5. Вызов `AuctionService.start()`:
   - Инициализация Redis state для раунда 1
   - Создание первого раунда в MongoDB
   - Broadcast события `round_started`

### 2. Размещение ставки

**WebSocket сообщение:**
```json
{
  "type": "bid",
  "data": {
    "auctionId": "...",
    "amount": 100
  }
}
```

**Процесс (BidService.placeBid):**

1. **Валидация аукциона:**
   - Проверка существования
   - Проверка статуса = `active`
   - Проверка, что раунд активен (не settling)

2. **Атомарная проверка 1 ставка = 1 пользователь:**
   ```redis
   SADD auction:{id}:users {userId}
   ```
   - Если возвращает 0 → пользователь уже сделал ставку → отклонение

3. **Проверка баланса:**
   - `getAvailableBalance(userId)` = `balance - сумма всех frozen`
   - Если недостаточно → rollback (удаление из SET)

4. **Заморозка средств:**
   ```redis
   SET user:{userId}:frozen:{auctionId} {amount}
   ```

5. **Запись ставки:**
   ```redis
   ZADD auction:{id}:round:{n}:bids {amount} {userId}:{timestamp}:{amount}
   ```

6. **Broadcast события `bid_placed`** через WebSocket

### 3. Закрытие раунда (по таймеру)

**RoundTimerService** (worker процесс):
- Каждую секунду проверяет `auction:rounds:timeouts`
- Для каждого истекшего раунда вызывает `RoundService.closeRound()`

**RoundService.closeRound():**

1. Установка флага `settling = true` в Redis
2. Завершение раунда в MongoDB
3. Broadcast события `round_closed`
4. Асинхронный вызов `SettlementService.settleRound()`

### 4. Settlement (определение победителей)

**SettlementService.settleRound():**

1. **Проверка idempotency:**
   ```redis
   GET auction:{id}:round:{n}:settled
   ```
   - Если существует → пропуск

2. **Получение ставок:**
   ```redis
   ZREVRANGE auction:{id}:round:{n}:bids 0 {gifts_per_round-1} WITHSCORES
   ```
   - Получает топ-N ставок (отсортированы по сумме DESC)

3. **Сортировка при равенстве:**
   - По сумме DESC
   - При равенстве → по timestamp ASC (раньше = лучше)

4. **Определение победителей:**
   - Победители: первые `gifts_per_round` ставок
   - Проигравшие: остальные

5. **Финансовые операции:**
   - **Победители:** `deductBalance()` - окончательное списание
   - **Проигравшие:** `unfreezeBalance()` - возврат замороженных средств

6. **Очистка:**
   - Удаление `auction:{id}:round:{n}:bids`
   - Установка `auction:{id}:round:{n}:settled = "1"`

7. **Broadcast события `round_settled`**

8. **Переход к следующему раунду:**
   - Вызов `AuctionService.nextRound()`

### 5. Переход к следующему раунду

**AuctionService.nextRound():**

1. **Проверка доступных подарков:**
   - Получение непроданных подарков из текущего раунда
   - Проверка наличия доступных подарков в коллекции
   - Если подарков нет → завершение аукциона

2. **Создание нового раунда:**
   - Инкремент `current_round_number` в MongoDB
   - Создание нового раунда с непроданными + новыми подарками
   - Инициализация Redis state для нового раунда
   - Добавление таймера в `auction:rounds:timeouts`

3. **Broadcast события `round_started`**

### 6. Завершение аукциона

**AuctionService.finish():**

1. Установка статуса `finished` в MongoDB
2. Обновление Redis state
3. Возврат всех замороженных средств (`unfreezeAllForAuction`)
4. Очистка всех Redis ключей для аукциона
5. Broadcast события `auction_finished`

## Recovery при рестарте

**RecoveryService.recoverActiveAuctions():**

Вызывается при старте сервера в `index.ts`.

**Процесс:**

1. Получение всех активных аукционов из MongoDB
2. Для каждого аукциона:
   - Восстановление Redis state из MongoDB данных
   - Пересоздание таймеров в `auction:rounds:timeouts`
   - Восстановление замороженных балансов из ставок в Redis

## WebSocket события

### Клиент → Сервер

1. **`bid`** - размещение ставки
   ```json
   {
     "type": "bid",
     "data": {
       "auctionId": "...",
       "amount": 100
     }
   }
   ```

2. **`subscribe`** - подписка на события аукциона
   ```json
   {
     "type": "subscribe",
     "data": {
       "auctionId": "..."
     }
   }
   ```

3. **`unsubscribe`** - отписка от событий
   ```json
   {
     "type": "unsubscribe",
     "data": {
       "auctionId": "..."
     }
   }
   ```

### Сервер → Клиент

1. **`bid_placed`** - новая ставка
   ```json
   {
     "type": "bid_placed",
     "data": {
       "auctionId": "...",
       "userId": 123,
       "amount": 100,
       "timestamp": 1234567890
     }
   }
   ```

2. **`round_started`** - начало раунда
   ```json
   {
     "type": "round_started",
     "data": {
       "auctionId": "...",
       "roundNumber": 1,
       "roundEndTs": 1234567890
     }
   }
   ```

3. **`round_closed`** - закрытие раунда
   ```json
   {
     "type": "round_closed",
     "data": {
       "auctionId": "...",
       "roundNumber": 1
     }
   }
   ```

4. **`round_settled`** - settlement завершен
   ```json
   {
     "type": "round_settled",
     "data": {
       "auctionId": "...",
       "roundNumber": 1,
       "winners": [
         { "userId": 123, "amount": 100 }
       ]
     }
   }
   ```

5. **`auction_finished`** - аукцион завершен
   ```json
   {
     "type": "auction_finished",
     "data": {
       "auctionId": "..."
     }
   }
   ```

6. **`error`** - ошибка
   ```json
   {
     "type": "error",
     "error": "Error message",
     "message": "Optional details"
   }
   ```

## Инструкция по использованию

### 1. Подключение к WebSocket

```javascript
const ws = new WebSocket(`ws://localhost:3000/ws/auction?token=${jwtToken}`);
```

**Аутентификация:** JWT токен передается в query параметре `token`.

### 2. Подписка на аукцион

```javascript
ws.send(JSON.stringify({
  type: "subscribe",
  data: {
    auctionId: "auction_id_here"
  }
}));
```

### 3. Размещение ставки

```javascript
ws.send(JSON.stringify({
  type: "bid",
  data: {
    auctionId: "auction_id_here",
    amount: 100
  }
}));
```

**Ограничения:**
- Одна ставка на пользователя на весь аукцион
- Ставка не может быть изменена или отменена
- Баланс должен быть достаточным (учитываются замороженные средства)

### 4. Обработка событий

```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case "bid_placed":
      console.log("New bid:", message.data);
      break;
    case "round_started":
      console.log("Round started:", message.data);
      break;
    case "round_closed":
      console.log("Round closed:", message.data);
      break;
    case "round_settled":
      console.log("Winners:", message.data.winners);
      break;
    case "auction_finished":
      console.log("Auction finished");
      break;
    case "error":
      console.error("Error:", message.error);
      break;
  }
};
```

## Проверка правильности реализации

### ✅ EPIC 1: Auction Control Plane

- [x] Модель Auction с полем `total_rounds`
- [x] Метод `start()` - инициализация Redis state
- [x] Метод `finish()` - завершение аукциона, очистка Redis
- [x] Метод `shouldFinish()` - проверка доступных подарков

### ✅ EPIC 2: Redis Runtime State

- [x] Все ключи определены в `auctionKeys.ts`
- [x] Функции инициализации и работы с состоянием в `auctionState.ts`
- [x] Атомарные операции через Redis команды

### ✅ EPIC 3: Bid Flow

- [x] WebSocket сервер с аутентификацией
- [x] Атомарная проверка 1 ставка = 1 пользователь (SADD)
- [x] Валидация, заморозка баланса, запись в ZSET
- [x] Broadcast событий через WebSocket
- [x] Расширенный WalletService с методами работы с frozen balance

### ✅ EPIC 4: Round Timing Engine

- [x] RoundTimerService с worker процессом
- [x] Периодический опрос таймеров
- [x] Метод `closeRound()` с блокировкой ставок

### ✅ EPIC 5: Settlement Logic

- [x] Определение победителей через ZREVRANGE
- [x] Сортировка при равенстве по timestamp
- [x] Финансовый расчёт (списание/возврат)
- [x] Очистка Redis после settlement
- [x] Idempotency через ключ `settled`

### ✅ EPIC 6: Переход между раундами

- [x] Метод `nextRound()` с проверкой подарков
- [x] Инициализация нового раунда
- [x] Автоматическое завершение при отсутствии подарков

### ✅ EPIC 7: Recovery & Consistency

- [x] RecoveryService для восстановления при рестарте
- [x] Восстановление Redis state из MongoDB
- [x] Защита от двойного settlement

### ✅ EPIC 8: Observability

- [x] Структурированное логирование через pino
- [x] Логи всех ключевых событий

## Оптимизации

### Выполненные оптимизации:

1. **Устранено дублирование импортов** в `settlementService.ts`
2. **Исправлена проверка доступных подарков** - теперь проверяется только для конкретной коллекции
3. **Упрощены комментарии** в `bidService.ts`
4. **Оптимизирована проверка завершения аукциона** - используется проверка непроданных подарков вместо подсчета всех

### Рекомендации для дальнейшей оптимизации:

1. **Redis Pipeline** для атомарных операций:
   ```typescript
   const pipeline = redis.pipeline();
   pipeline.sadd(usersKey, userId);
   pipeline.zadd(bidsKey, amount, member);
   pipeline.set(frozenKey, amount);
   await pipeline.exec();
   ```

2. **Кэширование** данных аукциона в Redis для уменьшения запросов к MongoDB

3. **Batch операции** для обработки победителей/проигравших

4. **Lua scripts** для сложных атомарных операций

## Безопасность

1. **Аутентификация:** JWT токен проверяется при каждом WebSocket подключении
2. **Валидация:** Все входные данные валидируются
3. **Атомарность:** Критические операции выполняются атомарно через Redis
4. **Idempotency:** Settlement защищен от повторного выполнения
5. **Rollback:** При ошибках выполняется откат операций

## Мониторинг

Все ключевые события логируются через `pino`:
- `bid_placed` - размещение ставки
- `round_closed` - закрытие раунда
- `round_settled` - завершение settlement
- `round_started` - начало раунда
- `auction_finished` - завершение аукциона

Логи содержат контекст: `auctionId`, `roundNumber`, `userId`, `amount`.

