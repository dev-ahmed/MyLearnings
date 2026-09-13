#!/usr/bin/env python3
"""deploy.py — build the hub and push it to the server.

Run from anywhere:  python3 deploy.py   (or ./deploy.py)
Stdlib only, no dependencies.

    ./deploy.py                 build, upload, restart, verify
    ./deploy.py --skip-build    reuse the existing books-viewer/dist
    ./deploy.py --dry-run       show what rsync would send, change nothing
    ./deploy.py --verify        only check the live site
"""
import argparse
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from base64 import b64encode
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HUB = ROOT / "mylearnings-hub"
VIEWER = ROOT / "books-viewer"

HOST = "root@204.168.234.42"
KEY = Path.home() / ".ssh" / "shopbook_hetzner_new"
REMOTE = "/opt/mylearnings"
URL = os.environ.get("MYLEARNINGS_HUB_URL", "http://204.168.234.42")
PM2_APP = "mylearnings-books"

def slugs() -> list[str]:
    """Every plan the hub actually holds, so a new sprint is verified for free."""
    return sorted(p.stem for p in (HUB / "plans").glob("*.html"))


def cyan(s): return f"\033[1;36m{s}\033[0m"
def green(s): return f"\033[1;32m{s}\033[0m"
def red(s): return f"\033[1;31m{s}\033[0m"
def dim(s): return f"\033[2m{s}\033[0m"


def step(message: str) -> None:
    print(f"\n{cyan('▶')} {message}")


def die(message: str) -> None:
    print(f"{red('✗')} {message}")
    sys.exit(1)


def run(cmd: list[str], cwd: Path | None = None, quiet: bool = False) -> str:
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stdout[-2000:])
        print(result.stderr[-2000:])
        die(f"failed: {' '.join(cmd[:4])}…")
    if not quiet and result.stdout.strip():
        print(dim(result.stdout.strip()[-600:]))
    return result.stdout


def ssh(script: str, quiet: bool = True) -> str:
    return run(["ssh", "-o", "BatchMode=yes", "-i", str(KEY), HOST, script], quiet=quiet)


def preflight() -> None:
    step("preflight")
    if not KEY.is_file():
        die(f"ssh key not found: {KEY}")
    if not shutil.which("rsync"):
        die("rsync not installed")
    who = ssh("echo $(whoami)@$(hostname)").strip()
    print(f"  {green('✓')} ssh {who}")


def build() -> None:
    step("building books-viewer")
    pnpm = shutil.which("pnpm") or die("pnpm not found")
    run([pnpm, "build"], cwd=VIEWER, quiet=True)
    dist = VIEWER / "dist"
    if not (dist / "index.html").is_file():
        die("build produced no dist/index.html")
    print(f"  {green('✓')} dist built")


def stage(into: Path) -> Path:
    step("staging bundle")
    for sub in ("hub/server", "www/plans", "www/books", "cookbooks"):
        (into / sub).mkdir(parents=True, exist_ok=True)

    shutil.copytree(VIEWER / "dist", into / "www" / "books", dirs_exist_ok=True)
    for html in sorted((HUB / "plans").glob("*.html")):
        shutil.copy2(html, into / "www" / "plans" / html.name)
    shutil.copy2(HUB / "index.html", into / "www" / "index.html")
    shutil.copy2(HUB / "server" / "index.js", into / "hub" / "server" / "index.js")
    shutil.copytree(ROOT / "cookbooks", into / "cookbooks", dirs_exist_ok=True)

    (into / "hub" / "package.json").write_text(
        '{\n  "name": "mylearnings-hub",\n  "private": true,\n  "type": "module",\n'
        '  "dependencies": { "cors": "^2.8.6", "express": "^5.2.1" }\n}\n'
    )

    for junk in into.rglob(".DS_Store"):
        junk.unlink()

    plans = len(list((into / "www" / "plans").glob("*.html")))
    books = len([p for p in (into / "cookbooks").rglob("*") if p.suffix in (".pdf", ".epub")])
    print(f"  {green('✓')} {plans} plans · {books} book files")
    return into


def upload(staged: Path, dry_run: bool) -> None:
    """Push the bundle, forcing server-side ownership and modes.

    rsync -a carries the local uid and the staging directory's 0700 across,
    and nginx (www-data) can then no longer traverse the tree — the whole site
    answers 403. macOS ships openrsync, which has no --chmod, so modes are
    normalised server-side instead.
    """
    step("uploading" + (" (dry run)" if dry_run else ""))
    cmd = [
        "rsync", "-rltz", "--delete", "--exclude", "node_modules",
        "-e", f"ssh -o BatchMode=yes -i {KEY}",
        f"{staged}/", f"{HOST}:{REMOTE}/",
    ]
    if dry_run:
        cmd.insert(1, "--dry-run")
        cmd.insert(1, "-v")
    run(cmd, quiet=not dry_run)
    if dry_run:
        return

    ssh(
        f"chown -R root:root {REMOTE} && "
        f"find {REMOTE} -type d -exec chmod 755 {{}} + && "
        f"find {REMOTE} -type f -exec chmod 644 {{}} +"
    )
    print(f"  {green('✓')} synced to {REMOTE} (root:root, 755/644)")


def restart() -> None:
    step("installing deps and restarting")
    ssh(f"cd {REMOTE}/hub && npm install --omit=dev --silent")
    ssh(f"pm2 restart {PM2_APP} --update-env")
    print(f"  {green('✓')} {PM2_APP} restarted")


def _auth_header() -> dict[str, str]:
    user = os.environ.get("MYLEARNINGS_HUB_USER")
    password = os.environ.get("MYLEARNINGS_HUB_PASS")
    if not user or not password:
        return {}
    token = b64encode(f"{user}:{password}".encode()).decode()
    return {"Authorization": f"Basic {token}"}


def _get(path: str, headers: dict[str, str]) -> int:
    request = urllib.request.Request(URL + path, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return response.status
    except urllib.error.HTTPError as exc:
        return exc.code
    except OSError:
        return 0


def verify() -> bool:
    step("verifying")
    headers = _auth_header()
    if not headers:
        print(dim("  MYLEARNINGS_HUB_USER/PASS not set — checking only that auth is enforced"))
        code = _get("/", {})
        ok = code == 401
        print(f"  {green('✓') if ok else red('✗')} anonymous → {code} (expect 401)")
        return ok

    failures = []
    if _get("/", {}) != 401:
        failures.append("anonymous request was not refused")

    for path in ("/", "/books/", "/books/api/books"):
        code = _get(path, headers)
        mark = green("✓") if code == 200 else red("✗")
        print(f"  {mark} {path:<20} {code}")
        if code != 200:
            failures.append(path)

    plans = slugs()
    bad = [s for s in plans if _get(f"/plans/{s}", headers) != 200]
    if bad:
        failures.append(f"plans failing: {', '.join(bad)}")
        print(f"  {red('✗')} {len(bad)} of {len(plans)} plans failed")
    else:
        print(f"  {green('✓')} all {len(plans)} plans → 200")

    for problem in failures:
        print(f"  {red('!')} {problem}")
    return not failures


def main() -> None:
    parser = argparse.ArgumentParser(description="Deploy the MyLearnings hub.")
    parser.add_argument("--skip-build", action="store_true", help="reuse the existing dist")
    parser.add_argument("--dry-run", action="store_true", help="show what would be sent")
    parser.add_argument("--verify", action="store_true", help="only check the live site")
    args = parser.parse_args()

    if args.verify:
        sys.exit(0 if verify() else 1)

    preflight()
    if not args.skip_build:
        build()
    elif not (VIEWER / "dist" / "index.html").is_file():
        die("--skip-build given but books-viewer/dist is missing")

    with tempfile.TemporaryDirectory(prefix="mylearnings-deploy-") as tmp:
        staged = stage(Path(tmp))
        upload(staged, args.dry_run)

    if args.dry_run:
        print(f"\n{dim('dry run — nothing was changed')}")
        return

    restart()
    ok = verify()
    print(f"\n{green('✓ deployed') if ok else red('✗ deployed with problems')} → {URL}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
