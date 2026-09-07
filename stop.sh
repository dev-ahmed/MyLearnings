#!/usr/bin/env bash
#
# stop.sh — stop and remove ALL learning-plan containers.
# Run from anywhere:  ./stop.sh
#
# Your checklist progress lives in your browser (localStorage), so stopping the
# containers never loses it. Pass --clean to also delete the built images.
#
set -euo pipefail
cd "$(dirname "$0")"                       # MyLearnings root
COMPOSE="plans/docker-compose.all.yml"

blue(){ printf "\033[1;36m%s\033[0m\n" "$*"; }

if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  echo "Docker isn't running — nothing to stop."
  exit 0
fi

if [ "${1:-}" = "--clean" ]; then
  blue "▸ Stopping all plan containers and removing their images…"
  docker compose -f "$COMPOSE" down --rmi local
else
  blue "▸ Stopping and removing all plan containers…"
  docker compose -f "$COMPOSE" down
fi

echo "✓ All plans stopped. Your checklist progress is saved in your browser (untouched)."
echo "  Start them again anytime with:  ./start.sh"
echo "  (To fully quit Docker itself, quit Docker Desktop from the menu bar.)"
