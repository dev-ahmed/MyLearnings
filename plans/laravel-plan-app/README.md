# Laravel Backend Sprint — self-hosted

The **Laravel Backend Sprint** study-plan tracker, served as a static page by nginx in a small
Docker container. Progress is stored in your **browser's localStorage**, so the
container is completely stateless — redeploys never lose your progress.

## Run it

```bash
docker compose up -d --build
```

Open **http://localhost:8645**. Stop with `docker compose down`.

## Plain Docker

```bash
docker build -t laravel-plan .
docker run -d --name laravel-plan -p 8645:80 --restart unless-stopped laravel-plan
```

## Change the port

Edit the left-hand number in `docker-compose.yml` (`"8645:80"`), then re-run
`docker compose up -d`.

## Notes

- Progress is keyed to the origin (host + port); visit the same URL each time.
- Runs alongside the other plan trackers — each uses its own port (Python 8642,
  Docker 8643, Backend Infra 8644, Laravel 8645, RAG 8646, ML 8647), so you can
  run them all at once.
