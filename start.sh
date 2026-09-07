#!/usr/bin/env bash
#
# start.sh — build and start ALL learning-plan trackers at once.
# Run from anywhere:  ./start.sh   (it locates itself)
#
set -euo pipefail
cd "$(dirname "$0")"                       # MyLearnings root
COMPOSE="plans/docker-compose.all.yml"

blue(){ printf "\033[1;36m%s\033[0m\n" "$*"; }
red(){  printf "\033[1;31m%s\033[0m\n" "$*" >&2; }

# --- preflight: Docker present and running ---------------------------------
if ! command -v docker >/dev/null 2>&1; then
  red "✗ Docker isn't installed or not on PATH."
  red "  Install Docker Desktop (https://www.docker.com/products/docker-desktop) and try again."
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  red "✗ Docker isn't running. Open Docker Desktop, wait for the whale icon to say 'running', then re-run ./start.sh"
  exit 1
fi

# --- build + start ----------------------------------------------------------
blue "▸ Building & starting all learning plans (first run pulls a small image)…"
docker compose -f "$COMPOSE" up -d --build

cat <<'EOF'

✓ All plans are up. Open them in your browser:

    Python Backend Sprint     http://localhost:8642
    Docker Deploy Sprint      http://localhost:8643
    Backend Infra Sprint      http://localhost:8644   (Redis · Queues · Mailpit)
    Laravel Backend Sprint    http://localhost:8645
    RAG Sprint                http://localhost:8646
    Machine Learning Sprint   http://localhost:8647
    Rust Sprint               http://localhost:8648

Progress is saved in your browser as you check tasks off.
Stop everything with:  ./stop.sh
EOF
