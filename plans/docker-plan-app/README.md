# Docker Deploy Sprint — self-hosted

The 3-week Docker study-plan tracker, served as a single static page by nginx in
a small Docker container. Progress is stored in your **browser's localStorage**,
so the container is completely stateless — redeploys never lose your progress.

> Meta note: running this page *is itself* a Docker exercise. Reading the
> `Dockerfile`, `nginx.conf`, and `docker-compose.yml` in this folder covers
> most of Week 1 of the plan — a real image, a real config, a real `compose up`.

## Contents

```
index.html          the plan (self-contained HTML + CSS + JS)
Dockerfile          builds an nginx image serving the page
nginx.conf          nginx config (gzip, security headers, SPA fallback)
docker-compose.yml  one-command run (port 8643)
```

## Run it

### Docker Compose (recommended)

```bash
docker compose up -d --build
```

Open **http://localhost:8643**. Stop with `docker compose down`.

### Plain Docker

```bash
docker build -t docker-plan .
docker run -d --name docker-plan -p 8643:80 --restart unless-stopped docker-plan
```

### No build, just mount the file

```bash
docker run --rm -p 8643:80 \
  -v "$(pwd)/index.html:/usr/share/nginx/html/index.html:ro" \
  nginx:1.27-alpine
```

## Change the port

Edit the left-hand number in `docker-compose.yml` (`"8643:80"`), or the `-p`
flag on `docker run`, then reopen at that port.

## Running both plans at once

The Python plan uses port **8642** and this one uses **8643**, so they don't
clash. From each app folder run its own `docker compose up -d --build`, or add
both services to a single compose file.

## About your saved progress

- Progress lives in **localStorage**, keyed to the site's **origin**
  (scheme + host + port). Visit the same URL each time and it persists.
- It's client-side, so **rebuilding/redeploying the container never wipes it**.
- Different browsers/devices keep separate progress; private/incognito mode and
  clearing site data reset it. The light/dark choice is remembered the same way.
- This plan and the Python plan store progress under **different keys**, so they
  never overwrite each other even if served from the same host.

## Notes

- Fonts load from Google Fonts (best with internet access; clean system-font
  fallback otherwise).
- Sits behind any reverse proxy (Caddy, Traefik, nginx) for a real domain +
  HTTPS — point it at the container's port 80. Caddy's automatic HTTPS is a
  Week-3 task in the plan itself.
