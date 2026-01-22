#!/bin/sh
set -eu

# =========================
# Configuration
# =========================
SCRAPE_INTERVAL="${SCRAPE_INTERVAL:-15s}"
EVALUATION_INTERVAL="${EVALUATION_INTERVAL:-15s}"
MONITOR="${MONITOR:-auction-simulator}"
CONFIG_FILE="/etc/prometheus/prom.yml"

# =========================
# Preconditions
# =========================
if [ -z "${JOB_NAME:-}" ] && [ -z "${CUSTOM_SCRAPE_CONFIGS:-}" ]; then
  echo "ERROR: no scrape configs provided (JOB_NAME/TARGETS or CUSTOM_SCRAPE_CONFIGS required)" >&2
  exit 1
fi

# =========================
# Prepare filesystem
# =========================
mkdir -p "$(dirname "$CONFIG_FILE")"

# =========================
# Write global config
# =========================
cat > "$CONFIG_FILE" <<EOF
global:
  scrape_interval: ${SCRAPE_INTERVAL}
  evaluation_interval: ${EVALUATION_INTERVAL}
  external_labels:
    monitor: "${MONITOR}"

scrape_configs:
EOF

# =========================
# Single job via env vars
# =========================
if [ -n "${JOB_NAME:-}" ] && [ -n "${TARGETS:-}" ]; then
  printf '  - job_name: "%s"\n' "$JOB_NAME" >> "$CONFIG_FILE"
  printf '    static_configs:\n' >> "$CONFIG_FILE"
  printf '      - targets: [' >> "$CONFIG_FILE"

  first=1
  for t in $(printf '%s' "$TARGETS" | tr ',' ' '); do
    if [ "$first" -eq 1 ]; then
      printf '"%s"' "$t" >> "$CONFIG_FILE"
      first=0
    else
      printf ', "%s"' "$t" >> "$CONFIG_FILE"
    fi
  done
  printf ']\n' >> "$CONFIG_FILE"

  if [ -n "${LABELS:-}" ]; then
    printf '        labels:\n' >> "$CONFIG_FILE"
    OLD_IFS="$IFS"
    IFS=','

    for kv in $LABELS; do
      key=$(printf '%s' "$kv" | cut -d= -f1)
      val=$(printf '%s' "$kv" | cut -d= -f2-)
      printf '          %s: "%s"\n' "$key" "$val" >> "$CONFIG_FILE"
    done

    IFS="$OLD_IFS"
  fi
fi

# =========================
# Custom scrape configs
# =========================
if [ -n "${CUSTOM_SCRAPE_CONFIGS:-}" ]; then
  printf '\n# custom scrape configs (from CUSTOM_SCRAPE_CONFIGS)\n' >> "$CONFIG_FILE"
  printf '%s\n' "$CUSTOM_SCRAPE_CONFIGS" >> "$CONFIG_FILE"
fi

# =========================
# Debug output
# =========================
echo "Generated Prometheus config at $CONFIG_FILE:"
cat "$CONFIG_FILE"

# =========================
# Run Prometheus
# =========================
exec /bin/prometheus --config.file="$CONFIG_FILE" "$@"
