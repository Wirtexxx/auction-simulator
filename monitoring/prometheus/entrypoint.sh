#!/bin/sh
set -eu

# Defaults
SCRAPE_INTERVAL=${SCRAPE_INTERVAL:-15s}
EVALUATION_INTERVAL=${EVALUATION_INTERVAL:-15s}
MONITOR=${MONITOR:-auction-simulator}
CONFIG_FILE=/etc/prometheus/prom.yml

# Create config dir if missing
mkdir -p $(dirname "$CONFIG_FILE")

cat > "$CONFIG_FILE" <<EOF
global:
  scrape_interval: ${SCRAPE_INTERVAL}
  evaluation_interval: ${EVALUATION_INTERVAL}
  external_labels:
    monitor: "${MONITOR}"

scrape_configs:
EOF

# Helper: write one job from JOB_NAME/TARGETS/LABELS
if [ -n "${JOB_NAME:-}" ] && [ -n "${TARGETS:-}" ]; then
  # Convert comma-separated targets into YAML array entries
  # e.g. TARGETS="backend:8080,other:9090"
  printf '  - job_name: "%s"\n' "$JOB_NAME" >> "$CONFIG_FILE"
  printf '    static_configs:\n' >> "$CONFIG_FILE"
  printf '      - targets: [' >> "$CONFIG_FILE"
  first=1
  for t in $(echo "$TARGETS" | tr ',' ' '); do
    if [ "$first" -eq 1 ]; then
      printf '"%s"' "$t" >> "$CONFIG_FILE"
      first=0
    else
      printf ', "%s"' "$t" >> "$CONFIG_FILE"
    fi
  done
  printf ']\n' >> "$CONFIG_FILE"

  # Add labels if provided: LABELS="service=auction-backend,environment=production"
  if [ -n "${LABELS:-}" ]; then
    printf '        labels:\n' >> "$CONFIG_FILE"
    IFS=','; for kv in $LABELS; do
      key=$(printf '%s' "$kv" | cut -d= -f1)
      val=$(printf '%s' "$kv" | cut -d= -f2-)
      printf '          %s: "%s"\n' "$key" "$val" >> "$CONFIG_FILE"
    done
  fi
fi

# If the user provided arbitrary additional scrape configs, append them verbatim.
# Useful for complex jobs. Example: set CUSTOM_SCRAPE_CONFIGS env to a YAML block.
if [ -n "${CUSTOM_SCRAPE_CONFIGS:-}" ]; then
  printf '\n# custom scrape configs (from CUSTOM_SCRAPE_CONFIGS env)\n' >> "$CONFIG_FILE"
  printf '%s\n' "$CUSTOM_SCRAPE_CONFIGS" >> "$CONFIG_FILE"
fi

echo "Generated Prometheus config at $CONFIG_FILE:"
cat "$CONFIG_FILE"

# Exec prometheus with provided args (allow overriding via CMD)
exec /bin/prometheus --config.file="$CONFIG_FILE" "$@"