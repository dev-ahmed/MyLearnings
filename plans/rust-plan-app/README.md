# Rust Sprint — self-hosted

The **Rust Sprint** study-plan tracker, served as a static page by nginx in a small
Docker container. Progress is stored in your browser's localStorage, so the
container is stateless — redeploys never lose progress.

## Run it

```bash
docker compose up -d --build
```

Open **http://localhost:8648**. Stop with `docker compose down`.

## Notes

- Progress is keyed to the origin (host + port); visit the same URL each time.
- Runs alongside the other plan trackers — each uses its own port (Python 8642,
  Docker 8643, Backend Infra 8644, Laravel 8645, RAG 8646, ML 8647, Rust 8648).
