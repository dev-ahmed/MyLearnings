#!/usr/bin/env python3
"""start.py — build and start ALL learning-plan trackers at once.

Run from anywhere:  python3 start.py   (or ./start.py)
Stdlib only, no dependencies.
"""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent          # MyLearnings/
COMPOSE = ROOT / "plans" / "docker-compose.all.yml"

PLANS = [
    ("Python Backend Sprint",   8642, ""),
    ("Docker Deploy Sprint",    8643, ""),
    ("Backend Infra Sprint",    8644, "(Redis · Queues · Mailpit)"),
    ("Laravel Backend Sprint",  8645, ""),
    ("RAG Sprint",              8646, ""),
    ("Machine Learning Sprint", 8647, ""),
    ("Rust Sprint",             8648, ""),
]

def cyan(s): return f"\033[1;36m{s}\033[0m"
def red(s):  return f"\033[1;31m{s}\033[0m"


def docker_ok() -> bool:
    """True only if the docker CLI exists AND the daemon is running."""
    if shutil.which("docker") is None:
        return False
    return subprocess.run(["docker", "info"],
                          stdout=subprocess.DEVNULL,
                          stderr=subprocess.DEVNULL).returncode == 0


def main() -> int:
    if shutil.which("docker") is None:
        print(red("✗ Docker isn't installed or not on PATH."))
        print("  Install Docker Desktop (https://www.docker.com/products/docker-desktop) and try again.")
        return 1
    if not docker_ok():
        print(red("✗ Docker isn't running. Open Docker Desktop, wait until it says 'running', then re-run."))
        return 1

    print(cyan("▸ Building & starting all learning plans (first run pulls a small image)…"))
    result = subprocess.run(
        ["docker", "compose", "-f", str(COMPOSE), "up", "-d", "--build"],
        cwd=ROOT,
    )
    if result.returncode != 0:
        print(red("✗ docker compose failed — see the output above."))
        return result.returncode

    print("\n✓ All plans are up. Open them in your browser:\n")
    for name, port, note in PLANS:
        print(f"    {name:<26} http://localhost:{port}   {note}".rstrip())
    print("\nProgress is saved in your browser as you check tasks off.")
    print("Stop everything with:  python3 stop.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
