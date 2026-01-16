# Инструкция по настройке мониторинга

## Проверка загрузки дашборда в Grafana

Если дашборд не отображается в Grafana, выполните следующие шаги:

### 1. Проверьте логи Grafana

```bash
docker-compose logs grafana | grep -i "dashboard\|provisioning\|error"
```

### 2. Перезапустите Grafana

```bash
docker-compose restart grafana
```

Или пересоздайте контейнер:

```bash
docker-compose up -d grafana
```

### 3. Проверьте права доступа к файлам

Убедитесь, что Grafana может читать файлы дашбордов:

```bash
ls -la monitoring/grafana/dashboards/
```

### 4. Проверьте конфигурацию provisioning

Файл `monitoring/grafana/provisioning/dashboards/dashboard.yml` должен указывать на правильный путь:

```yaml
options:
  path: /var/lib/grafana/dashboards
```

### 5. Ручной импорт дашборда

Если автоматическая загрузка не работает, можно импортировать дашборд вручную:

1. Откройте Grafana: http://localhost:3000
2. Войдите (admin/admin)
3. Перейдите в **Dashboards** → **Import**
4. Загрузите файл `monitoring/grafana/dashboards/auction-dashboard.json`
5. Выберите datasource **Prometheus**
6. Нажмите **Import**

### 6. Проверка datasource

Убедитесь, что Prometheus datasource настроен:

1. Перейдите в **Configuration** → **Data sources**
2. Должен быть datasource с именем **Prometheus** и URL `http://prometheus:9090`

## Структура файлов

```
monitoring/
├── prometheus.yml                    # Конфигурация Prometheus
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── prometheus.yml        # Настройка Prometheus datasource
│   │   └── dashboards/
│   │       └── dashboard.yml        # Настройка provisioning дашбордов
│   └── dashboards/
│       └── auction-dashboard.json    # Дашборд с метриками
```

## Доступ

- **Grafana:** http://localhost:3000 (admin/admin)
- **Prometheus:** http://localhost:9090
- **Backend Metrics:** http://localhost:8080/metrics
