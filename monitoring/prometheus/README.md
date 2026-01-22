# Prometheus Dockerfile

## Структура

```
monitoring/
└── prometheus/
    ├── Dockerfile          # Dockerfile для сборки образа
    ├── entrypoint.sh       # Entrypoint скрипт для генерации конфигурации
    └── README.md           # Этот файл
```

## Сборка образа

### Вариант 1: Сборка из директории prometheus (standalone)

```bash
cd monitoring/prometheus
docker build -t auction-prometheus:latest .
```

### Вариант 2: Сборка из корня проекта (через docker-compose)

```bash
# Из корня проекта
docker-compose build prometheus
```

## Запуск контейнера

### Standalone запуск

```bash
# Сборка образа
cd monitoring/prometheus
docker build -t auction-prometheus:latest .

# Запуск контейнера
docker run -d \
  --name auction-prometheus \
  -p 9090:9090 \
  -e SCRAPE_INTERVAL=15s \
  -e EVALUATION_INTERVAL=15s \
  -e MONITOR=auction-simulator \
  -e JOB_NAME=backend \
  -e TARGETS=backend:8080 \
  -e LABELS="service=auction-backend,environment=production" \
  -v prometheus_data:/prometheus \
  auction-prometheus:latest
```

### Переменные окружения

Все переменные имеют значения по умолчанию:

- `SCRAPE_INTERVAL` - интервал сбора метрик (по умолчанию: `15s`)
- `EVALUATION_INTERVAL` - интервал оценки правил (по умолчанию: `15s`)
- `MONITOR` - метка монитора (по умолчанию: `auction-simulator`)
- `JOB_NAME` - имя job для scrape config (опционально)
- `TARGETS` - targets для scrape config, разделенные запятыми (опционально)
- `LABELS` - метки для scrape config в формате `key=value,key2=value2` (опционально)
- `CUSTOM_SCRAPE_CONFIGS` - произвольный YAML блок для дополнительных scrape configs (опционально)

### Примеры использования

**Базовый запуск:**
```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  auction-prometheus:latest
```

**С кастомными настройками:**
```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -e SCRAPE_INTERVAL=30s \
  -e JOB_NAME=backend \
  -e TARGETS=localhost:8080,localhost:9090 \
  -e LABELS="service=backend,environment=dev" \
  auction-prometheus:latest
```

**С несколькими targets:**
```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -e JOB_NAME=services \
  -e TARGETS="backend:8080,frontend:3000,api:8081" \
  -e LABELS="environment=production" \
  auction-prometheus:latest
```

**С кастомными scrape configs:**
```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -e CUSTOM_SCRAPE_CONFIGS='
  - job_name: "custom-job"
    static_configs:
      - targets: ["custom:9090"]
        labels:
          service: "custom-service"
  ' \
  auction-prometheus:latest
```

## Использование в docker-compose.yml

Dockerfile также работает с docker-compose:

```yaml
prometheus:
  build:
    context: ./monitoring
    dockerfile: prometheus/Dockerfile
  environment:
    SCRAPE_INTERVAL: ${PROMETHEUS_SCRAPE_INTERVAL:-15s}
    JOB_NAME: backend
    TARGETS: backend:8080
    LABELS: "service=auction-backend,environment=production"
```

## Особенности

- Конфигурация генерируется динамически из переменных окружения
- Не требует статического файла `prometheus.yml`
- Поддерживает множественные targets через запятые
- Поддерживает кастомные scrape configs через `CUSTOM_SCRAPE_CONFIGS`
- Легко расширяется для добавления новых jobs

## Проверка конфигурации

После запуска контейнера можно проверить сгенерированную конфигурацию:

```bash
docker exec prometheus cat /etc/prometheus/prom.yml
```

Или через веб-интерфейс Prometheus:
```
http://localhost:9090/config
```
