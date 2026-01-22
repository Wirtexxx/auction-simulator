# Multi-stage build:
# 1) взять prometheus-бинарь из официального образа
# 2) на базе alpine добавить необходимые утилиты и entrypoint
FROM prom/prometheus:v2.49.0 AS prometheus-base

FROM alpine:3.19
RUN apk add --no-cache ca-certificates bash gettext
# копируем бинарь и стандартные директории из официального образа
COPY --from=prometheus-base /bin/prometheus /bin/prometheus
COPY --from=prometheus-base /etc/prometheus /etc/prometheus

# наш entrypoint будет генерировать /etc/prometheus/prom.yml
# Note: Build context is ./monitoring, so path is relative to that
COPY prometheus/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9090
USER 0
ENTRYPOINT ["/entrypoint.sh"]