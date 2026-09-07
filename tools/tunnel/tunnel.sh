#!/usr/bin/env bash
#
# tunnel.sh — bring up the plan containers and open a PERSISTENT tunnel so the
# address is the same every time (no more "new URL on each run").
#
# Create the tunnel ONCE (see the one-time setup for your provider at the
# bottom of this file), then just run:  ./tunnel.sh
#
# Choose a provider by editing PROVIDER below, or:  PROVIDER=tailscale ./tunnel.sh
#
set -euo pipefail

# ─── config ────────────────────────────────────────────────────────────────
PROVIDER="${PROVIDER:-tailscale}"     # tailscale | cloudflared | ngrok
PYTHON_PORT=8642
DOCKER_PORT=8643
CF_TUNNEL_NAME="learning-plans"       # your named Cloudflare tunnel (created once)
# ───────────────────────────────────────────────────────────────────────────

# Run from the folder that contains python-plan-app/ and docker-plan-app/,
# or set APPS_DIR to that path.
APPS_DIR="${APPS_DIR:-$(cd "$(dirname "$0")" && pwd)}"

log(){ printf "\033[1;36m▸ %s\033[0m\n" "$*"; }
die(){ printf "\033[1;31m✗ %s\033[0m\n" "$*" >&2; exit 1; }

start_apps(){
  command -v docker >/dev/null || die "Docker isn't installed / not on PATH."
  for app in python-plan-app docker-plan-app; do
    if [ -d "$APPS_DIR/$app" ]; then
      ( cd "$APPS_DIR/$app" && docker compose up -d >/dev/null )
    fi
  done
  log "Containers up  →  python:$PYTHON_PORT   docker:$DOCKER_PORT"
}

case "$PROVIDER" in
  tailscale)
    command -v tailscale >/dev/null || die "Install Tailscale first:  brew install --cask tailscale"
    start_apps
    tailscale up >/dev/null 2>&1 || true          # no-op if already connected
    IP="$(tailscale ip -4 2>/dev/null | head -1 || true)"
    NAME="$(tailscale status --json 2>/dev/null | grep -o '\"DNSName\":\"[^\"]*' | head -1 | cut -d'\"' -f4 | sed 's/\.$//' || true)"
    log "Reachable from any device on your tailnet (phone must have Tailscale on):"
    [ -n "$IP" ]   && echo "    http://$IP:$PYTHON_PORT   |   http://$IP:$DOCKER_PORT"
    [ -n "$NAME" ] && echo "    http://$NAME:$PYTHON_PORT   |   http://$NAME:$DOCKER_PORT"
    echo "These addresses stay the same every time. Nothing left running by this script."
    ;;

  cloudflared)
    command -v cloudflared >/dev/null || die "Install first:  brew install cloudflared"
    [ -f "$HOME/.cloudflared/config.yml" ] || die "No ~/.cloudflared/config.yml — see setup notes below."
    start_apps
    log "Starting Cloudflare tunnel '$CF_TUNNEL_NAME' (Ctrl-C to stop)…"
    exec cloudflared tunnel run "$CF_TUNNEL_NAME"   # hostnames are fixed in config.yml
    ;;

  ngrok)
    command -v ngrok >/dev/null || die "Install first:  brew install ngrok"
    start_apps
    # Free tier = one reserved domain, so this exposes the Python plan.
    # Reserve a domain in the ngrok dashboard → Domains, then put it here:
    RESERVED="${NGROK_DOMAIN:-YOUR-NAME.ngrok-free.app}"
    [ "$RESERVED" = "YOUR-NAME.ngrok-free.app" ] && \
      log "Set NGROK_DOMAIN to your reserved domain for a stable URL (else it's random)."
    log "Starting ngrok → https://$RESERVED (Ctrl-C to stop)…"
    # Recent CLI uses --url; older uses --domain. If one errors, try the other,
    # or check:  ngrok http --help
    exec ngrok http --url="https://$RESERVED" "$PYTHON_PORT"
    ;;

  *) die "Unknown PROVIDER '$PROVIDER' (use: tailscale | cloudflared | ngrok)";;
esac

# ═══════════════════════════════════════════════════════════════════════════
# ONE-TIME SETUP  (do this once; afterwards just run ./tunnel.sh)
# ═══════════════════════════════════════════════════════════════════════════
#
# ── Tailscale (recommended: no domain, same address forever, both ports) ────
#   1. brew install --cask tailscale   &&   open the app, sign in (once).
#   2. Install Tailscale on your phone, sign in with the SAME account.
#   3. Run ./tunnel.sh — it prints http://your-mac:8642 / :8643.
#      Those work from your phone anywhere Tailscale is on. That's it.
#
# ── Cloudflare named tunnel (public https URL for both plans; needs a domain
#    added to your free Cloudflare account) ───────────────────────────────
#   1. brew install cloudflared
#   2. cloudflared tunnel login
#   3. cloudflared tunnel create learning-plans        # creates a UUID + creds
#   4. cloudflared tunnel route dns learning-plans python.yourdomain.com
#      cloudflared tunnel route dns learning-plans docker.yourdomain.com
#   5. Create ~/.cloudflared/config.yml  (template in cloudflared-config.example.yml)
#   6. ./tunnel.sh   → same hostnames every run.
#
# ── ngrok reserved domain (quick public URL, one service on free tier) ─────
#   1. brew install ngrok  &&  ngrok config add-authtoken <token>
#   2. ngrok dashboard → Domains → create your free static domain.
#   3. NGROK_DOMAIN=your-name.ngrok-free.app PROVIDER=ngrok ./tunnel.sh
#
