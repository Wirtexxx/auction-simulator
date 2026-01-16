# Auction Simulator - Telegram Mini App Backend Challenge

**Project name:** CryptoBot Auction  
**Project description:** Backend system for running digital item auctions with bids, rounds, balances, and winner selection, based on CryptoBot auction mechanics

## Механика аукциона

### Основные принципы

1. **Многораундовая система**

    - Аукцион состоит из нескольких раундов
    - В каждом раунде часть участников получает подарки, остальные продолжают участие
    - Аукцион продолжается до продажи всех подарков (может превышать `total_rounds`)

2. **Одна ставка на пользователя на весь аукцион**

    - Каждый пользователь может сделать только одну ставку на весь аукцион
    - Ставка используется во всех раундах аукциона
    - Ставки автоматически копируются в каждый новый раунд

3. **Определение победителей**

    - Победители определяются по сумме ставки (больше = лучше)
    - При равных суммах побеждает тот, кто сделал ставку раньше
    - Топ-N участников получают подарки (N = количество подарков в раунде)

4. **Перенос непроданных подарков**

    - Если в раунде не все подарки были проданы, они переносятся в следующий раунд
    - Новый раунд содержит: непроданные подарки + новые подарки (до `gifts_per_round`)

5. **Anti-sniping защита**
    - Ставки блокируются в последние 10 секунд раунда
    - Предотвращает "снайперские" ставки в последний момент

### Работа с балансами

-   При размещении ставки средства замораживаются
-   Победители: средства списываются, подарок назначается
-   Проигравшие: средства размораживаются (возвращаются)
-   Wallet endpoint учитывает все замороженные средства (`frozen_balance`, `available_balance`)

## Архитектура системы

### Технологический стек

-   **Backend:** Node.js + TypeScript + Express
-   **База данных:** MongoDB (персистентное хранение)
-   **Кэш/Состояние:** Redis (состояние аукционов, ставки, таймеры)
-   **Real-time:** WebSocket (обновления в реальном времени)
-   **Frontend:** React + TypeScript + Vite

### Компоненты системы

#### Backend

1. **Auction Service** (`backend/src/api/auction/auctionService.ts`)

    - Создание аукциона
    - Управление жизненным циклом аукциона (start, finish, nextRound)
    - Проверка условий завершения аукциона

2. **Bid Service** (`backend/src/api/bid/bidService.ts`)

    - Размещение ставок
    - Атомарная проверка одной ставки на пользователя (SADD)
    - Anti-sniping защита
    - Валидация баланса

3. **Settlement Service** (`backend/src/services/settlementService.ts`)

    - Определение победителей
    - Обработка финансовых транзакций
    - Распределение подарков
    - Переход к следующему раунду

4. **Round Service** (`backend/src/api/round/roundService.ts`)

    - Создание раундов
    - Управление подарками в раундах
    - Перенос непроданных подарков

5. **Wallet Service** (`backend/src/api/wallet/walletService.ts`)

    - Управление балансами
    - Заморозка/разморозка средств
    - Списание средств победителям

6. **Recovery Service** (`backend/src/services/recoveryService.ts`)
    - Восстановление состояния после перезапуска сервера
    - Восстановление frozen balances
    - Восстановление ставок из предыдущих раундов

#### Frontend

1. **Auction Pages**

    - Список аукционов
    - Детали аукциона
    - Размещение ставок

2. **Admin Pages**

    - Создание коллекций
    - Создание аукционов
    - Управление аукционами (start/finish)
    - Управление балансами

3. **WebSocket Integration**
    - Real-time обновления ставок
    - Уведомления о начале/завершении раундов
    - Уведомления о завершении аукциона

### Поток данных

```
1. Создание аукциона
   Admin → POST /auctions → AuctionService.createAuction()
   → RoundService.createRound() → Redis state initialization

2. Размещение ставки
   User → POST /bids → BidService.placeBid()
   → SADD (atomic check) → ZADD (bid) → Freeze balance
   → WebSocket broadcast

3. Завершение раунда
   Timer → RoundTimerService → SettlementService.settleRound()
   → Determine winners → Process payments → NextRound()
   → Copy bids to new round → WebSocket broadcast

4. Завершение аукциона
   shouldFinish() → AuctionService.finish()
   → Unfreeze all balances → Cleanup Redis → Mark collection as sold
```

### Redis структура данных

-   `auction:{id}:state` (HASH) - состояние аукциона
-   `auction:{id}:users` (SET) - пользователи со ставками (атомарная проверка)
-   `auction:{id}:round:{n}:bids` (ZSET) - ставки раунда (score = amount)
-   `auction:{id}:round:{n}:settled` (STRING) - флаг settlement (idempotency)
-   `user:{userId}:frozen:{auctionId}` (STRING) - замороженные средства
-   `auction:rounds:timeouts` (ZSET) - таймеры раундов

## Инструкции по запуску

### Требования

-   Docker и Docker Compose
-   Node.js 18+ (для локальной разработки)

### Запуск через Docker Compose

1. Клонируйте репозиторий:

```bash
git clone <repository-url>
cd auction-simulator
```

2. Создайте файл `.env` (опционально, есть значения по умолчанию):

```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password
REDIS_PASSWORD=redispassword
TELEGRAM_BOT_TOKEN=your_bot_token
```

3. Запустите систему:

```bash
docker-compose up -d
```

4. Система будет доступна:
    - Backend API: http://localhost:8080
    - Frontend: http://localhost:5173
    - API Docs (Swagger): http://localhost:8080/api-docs

### Локальная разработка

#### Backend

```bash
cd backend
pnpm install
pnpm run dev
```

#### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

### Переменные окружения

См. `backend/src/common/utils/envConfig.ts` для полного списка переменных окружения.

Основные:

-   `MONGO_URI` - строка подключения к MongoDB
-   `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - параметры Redis
-   `JWT_SECRET` - секрет для JWT токенов
-   `TELEGRAM_BOT_TOKEN` - токен Telegram бота (опционально)
-   `CORS_ORIGIN` - разрешенный origin для CORS

## API Документация

Полная API документация доступна через Swagger UI:

-   URL: `http://localhost:8080/api-docs`
-   Все endpoints задокументированы с примерами запросов/ответов

### Основные endpoints

-   `POST /auctions` - создание аукциона (требует admin)
-   `GET /auctions` - список аукционов
-   `GET /auctions/:id` - детали аукциона
-   `POST /auctions/:id/start` - запуск аукциона (требует admin)
-   `POST /auctions/:id/finish` - завершение аукциона (требует admin)
-   `POST /bids` - размещение ставки (требует auth)
-   `GET /bids/round` - список ставок раунда
-   `GET /wallets/:id` - баланс пользователя

## Допущения и решения

### Допущения

1. **Одна ставка на пользователя на весь аукцион**

    - Реализовано через атомарную операцию SADD в Redis
    - Ставки копируются в каждый новый раунд автоматически

2. **Продолжение аукциона до продажи всех подарков**

    - Аукцион продолжается после `total_rounds` если есть непроданные подарки
    - Frontend показывает "OVER ROUND" баннер для дополнительных раундов

3. **Anti-sniping**

    - Блокировка ставок в последние 10 секунд раунда
    - Значение можно изменить в `ANTI_SNIPING_SECONDS`

4. **Ранжирование**
    - Сначала по сумме (DESC), затем по времени (ASC - раньше лучше)
    - Учитывается только последняя ставка каждого пользователя

### Архитектурные решения

1. **Redis для состояния**

    - Быстрый доступ к данным
    - Атомарные операции для предотвращения race conditions
    - Таймеры раундов в Redis ZSET

2. **MongoDB для персистентности**

    - Аукционы, раунды, подарки, ownership
    - Восстановление состояния после перезапуска

3. **WebSocket для real-time**

    - Мгновенные обновления для всех участников
    - События: bid_placed, round_started, round_settled, auction_finished

4. **Idempotency**
    - Settlement помечается как выполненный
    - Предотвращает повторную обработку

## Тестирование

### Unit тесты

```bash
cd backend
pnpm test
```

### Интеграционные тесты

```bash
cd backend
pnpm test:integration
```

### Ручное тестирование

1. Создайте коллекцию через админ панель
2. Создайте аукцион для коллекции
3. Разместите ставки от разных пользователей
4. Дождитесь завершения раунда
5. Проверьте распределение подарков и балансы

## Мониторинг

Система включает мониторинг на базе Prometheus и Grafana для отслеживания производительности, бизнес-метрик и технических показателей.

### Доступ к мониторингу

После запуска через `docker-compose up`:

-   **Prometheus:** http://localhost:9090
-   **Grafana:** http://localhost:3000
    -   Логин по умолчанию: `admin` / `admin` (можно изменить через переменные окружения)

### Доступные метрики

#### Производительность

-   `http_request_duration_seconds` - время ответа HTTP запросов (p50, p95, p99)
-   `http_request_total` - количество HTTP запросов
-   `settlement_duration_seconds` - время выполнения settlement
-   `bid_processing_duration_seconds` - время обработки ставки
-   `database_query_duration_seconds` - время выполнения запросов к БД
-   `redis_operation_duration_seconds` - время выполнения операций Redis

#### Бизнес-метрики

-   `auction_created_total` - количество созданных аукционов
-   `auction_finished_total` - количество завершенных аукционов
-   `bid_placed_total` - количество размещенных ставок
-   `bid_amount_sum` - сумма всех ставок
-   `round_settled_total` - количество завершенных раундов
-   `winners_total` - количество победителей
-   `gifts_distributed_total` - количество распределенных подарков
-   `auction_active_count` - количество активных аукционов
-   `round_active_count` - количество активных раундов
-   `frozen_balance_total` - общая сумма замороженных средств

### Endpoint метрик

Backend экспортирует метрики в формате Prometheus по адресу:

```
GET http://localhost:8080/metrics
```

### Grafana дашборды

Предустановленный дашборд "Auction Simulator Dashboard" включает:

-   HTTP метрики (requests/sec, latency, error rate)
-   Бизнес-метрики (ставки, аукционы, раунды, победители)
-   Метрики производительности (settlement duration, bid processing duration)

### Настройка переменных окружения

Для настройки мониторинга можно использовать следующие переменные:

```env
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
GRAFANA_ROOT_URL=http://localhost:3000
```

## Безопасность

Система включает следующие меры безопасности:

-   Защита от NoSQL инъекций
-   Санитизация входных данных
-   Валидация MongoDB ObjectId
-   Улучшенная обработка ошибок (не раскрывает внутренние детали)
-   Rate limiting
-   Helmet security headers
-   JWT аутентификация
-   Проверка прав доступа (admin)
