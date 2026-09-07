# Python Backend Sprint — self-hosted

A single static HTML page (the 8-week study-plan tracker) served by nginx in a
tiny Docker container. Your checklist progress is stored in your **browser's
localStorage**, so it is saved on your device — the container holds no state.

## Contents

```
index.html          the plan (HTML + CSS + JS, self-contained)
Dockerfile          builds an nginx image serving the page
nginx.conf          nginx server config (gzip, security headers, SPA fallback)
docker-compose.yml  one-command run
```

## Run it

### Option A — Docker Compose (recommended)

```bash
docker compose up -d --build
```

Open **http://localhost:8642**. Stop with `docker compose down`.

### Option B — plain Docker

```bash
docker build -t python-plan .
docker run -d --name python-plan -p 8642:80 --restart unless-stopped python-plan
```

### Option C — no build, just mount the file

```bash
docker run --rm -p 8642:80 \
  -v "$(pwd)/index.html:/usr/share/nginx/html/index.html:ro" \
  nginx:1.27-alpine
```

## Change the port

Edit the left-hand number in `docker-compose.yml` (`"8642:80"` → e.g. `"9000:80"`),
or the `-p` flag in the `docker run` command. Then reopen the site at that port.

## About your saved progress

- Progress lives in **localStorage in your browser**, keyed to the site's
  **origin** (scheme + host + port). Visit it at the **same URL** each time and
  your checkmarks persist.
- Because it is client-side, **rebuilding or redeploying the container never
  wipes your progress** — the container is stateless by design.
- Different browsers/devices keep **separate** progress (localStorage doesn't
  sync between them). Clearing site data or using private/incognito mode resets it.
- There's a light/dark toggle (top-right); your theme choice is remembered the
  same way.

## Notes

- The page pulls its fonts from Google Fonts, so it looks best with internet
  access; without it, it falls back to clean system fonts and still works fully.
- To update the plan later, replace `index.html` and
  `docker compose up -d --build` again. Your browser progress carries over.
- Runs behind any reverse proxy (Traefik, Caddy, nginx) if you want a real
  domain + HTTPS — just point it at the container's port 80.
