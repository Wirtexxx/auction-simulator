#!/bin/sh
set -eu

SCRAPE_INTERVAL="${SCRAPE_INTERVAL:-15s}"
EVALUATION_INTERVAL="${EVALUATION_INTERVAL:-15s}"
MONITOR="${MONITOR:-auction-simulator}"
CONFIG_FILE="/etc/prometheus/prom.yml"

if [ -z "${JOB_NAME:-}" ] && [ -z "${CUSTOM_SCRAPE_CONFIGS:-}" ]; then
  echo "ERROR: no scrape configs provided" >&2
  exit 1
fi

mkdir -p "$(dirname "$CONFIG_FILE")"

# ---------- global ----------
cat > "$CONFIG_FILE" <<EOF
global:
  scrape_interval: ${SCRAPE_INTERVAL}
  evaluation_interval: ${EVALUATION_INTERVAL}
  external_labels:
    monitor: "${MONITOR}"
EOF

# external labels
if [ -n "${EXTERNAL_LABELS:-}" ]; then
  OLD_IFS="$IFS"
  IFS=','
  for kv in $EXTERNAL_LABELS; do
    key=${kv%%=*}
    val=${kv#*=}
    printf '    %s: "%s"\n' "$key" "$val" >> "$CONFIG_FILE"
  done
  IFS="$OLD_IFS"
fi

printf '\nscrape_configs:\n' >> "$CONFIG_FILE"

# ---------- job ----------
if [ -n "${JOB_NAME:-}" ] && [ -n "${TARGETS:-}" ]; then
  printf '  - job_name: "%s"\n' "$JOB_NAME" >> "$CONFIG_FILE"
  printf '    static_configs:\n' >> "$CONFIG_FILE"
  printf '      - targets: [' >> "$CONFIG_FILE"

  first=1
  for t in $(printf '%s' "$TARGETS" | tr ',' ' '); do
    [ "$first" -eq 1 ] && first=0 || printf ', ' >> "$CONFIG_FILE"
    printf '"%s"' "$t" >> "$CONFIG_FILE"
  done
  printf ']\n' >> "$CONFIG_FILE"

  if [ -n "${JOB_LABELS:-}" ]; then
    printf '        labels:\n' >> "$CONFIG_FILE"
    OLD_IFS="$IFS"
    IFS=','
    for kv in $JOB_LABELS; do
      key=${kv%%=*}
      val=${kv#*=}
      printf '          %s: "%s"\n' "$key" "$val" >> "$CONFIG_FILE"
    done
    IFS="$OLD_IFS"
  fi
fi

# ---------- custom ----------
if [ -n "${CUSTOM_SCRAPE_CONFIGS:-}" ]; then
  printf '\n%s\n' "$CUSTOM_SCRAPE_CONFIGS" >> "$CONFIG_FILE"
fi

echo "Generated Prometheus config:"
cat "$CONFIG_FILE"

exec /bin/prometheus --config.file="$CONFIG_FILE" "$@"
