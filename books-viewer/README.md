# Books Viewer

Web-based viewer for all MyLearnings cookbooks (PDF & EPUB).

## Features

- Grid view of all 18 cookbooks
- PDF viewer with zoom and navigation
- EPUB reader with page navigation
- Filter by format (PDF/EPUB)
- Runs on port 8650

## Run with Docker

```bash
docker compose up -d --build
```

Access at: http://localhost:8650

## Development

```bash
pnpm install
pnpm dev      # Frontend dev server
pnpm server   # Backend API server
```
