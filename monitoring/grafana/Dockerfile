FROM grafana/grafana:latest

# Set working directory
WORKDIR /etc/grafana

# Switch to root to set permissions
USER root

# Copy provisioning configuration and set permissions
COPY --chown=grafana:grafana provisioning/ /etc/grafana/provisioning/

# Copy dashboards and set permissions
COPY --chown=grafana:grafana dashboards/ /var/lib/grafana/dashboards/

# Switch back to grafana user (default user in Grafana image)
USER grafana

# Expose Grafana port
EXPOSE 3000

# Use default Grafana entrypoint
ENTRYPOINT ["/run.sh"]
