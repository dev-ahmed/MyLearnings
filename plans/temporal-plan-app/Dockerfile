# Serve the Temporal Durable Workflows Sprint plan as a tiny static site.
# Checklist progress is saved through the progress API (sqlite, port 8700),
# so this container stays stateless — rebuilding it never loses progress.
FROM nginx:1.27-alpine

# Static page + server config
COPY index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Basic container healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
