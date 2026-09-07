#!/usr/bin/env python3
"""stop.py — stop and remove ALL learning-plan containers.

Run from anywhere:  python3 stop.py           (stops the containers)
                    python3 stop.py --clean   (also deletes the built images)

Your checklist progress lives in your browser (localStorage), so stopping the
containers never loses it. Stdlib only, no dependencies.
"""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
COMPOSE = ROOT / "plans" / "docker-compose.all.yml"

def cyan(s): return f"\033[1;36m{s}\033[0m"


def docker_running() -> bool:
    if shutil.which("docker") is None:
        return False
    return subprocess.run(["docker", "info"],
                          stdout=subprocess.DEVNULL,
                          stderr=subprocess.DEVNULL).returncode == 0


def main() -> int:
    if not docker_running():
        print("Docker isn't running — nothing to stop.")
        return 0

    clean = "--clean" in sys.argv[1:]
    cmd = ["docker", "compose", "-f", str(COMPOSE), "down"]
    if clean:
        cmd += ["--rmi", "local"]
        print(cyan("▸ Stopping all plan containers and removing their images…"))
    else:
        print(cyan("▸ Stopping and removing all plan containers…"))

    result = subprocess.run(cmd, cwd=ROOT)
    if result.returncode != 0:
        return result.returncode

    print("✓ All plans stopped. Your checklist progress is saved in your browser (untouched).")
    print("  Start them again anytime with:  python3 start.py")
    print("  (To fully quit Docker itself, quit Docker Desktop from the menu bar.)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
