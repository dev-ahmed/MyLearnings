#!/usr/bin/env python3
"""launcher.py — open the QR launcher page with this computer's address
auto-filled, so you can scan a plan's QR code with your phone.

Run:  python3 launcher.py   (or the alias: plans-qr)

It prefers this Mac's stable Bonjour name (e.g. my-macbook.local) over the
raw IP, because the .local name keeps working even when your router hands the
Mac a new IP. Falls back to the IP, then to typing it on the page.

The plans must be running (plans-start) and your phone must be on the same
Wi-Fi. Stdlib only.
"""
import socket
import subprocess
import sys
import webbrowser
from pathlib import Path

PAGE = Path(__file__).resolve().parent / "plans-launcher.html"


def local_hostname() -> str:
    """This computer's mDNS/Bonjour name (…\.local), stable across IP changes."""
    # macOS: the authoritative Bonjour local hostname.
    try:
        out = subprocess.run(["scutil", "--get", "LocalHostName"],
                             capture_output=True, text=True, timeout=3)
        name = out.stdout.strip()
        if name:
            return name if name.endswith(".local") else name + ".local"
    except Exception:
        pass
    # Fallback: the OS hostname (Linux/other).
    try:
        h = socket.gethostname().strip().rstrip(".")
        if h and h.lower() != "localhost":
            return h if ("." in h) else h + ".local"
    except Exception:
        pass
    return ""


def lan_ip() -> str:
    """Best-effort local network IP (no packets are actually sent)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))          # picks the interface used for the default route
        return s.getsockname()[0]
    except Exception:
        return ""
    finally:
        s.close()


def main() -> int:
    if not PAGE.exists():
        print(f"✗ Can't find {PAGE.name} next to this script.")
        return 1

    host = local_hostname()
    ip = lan_ip()

    if host:
        frag = f"#host={host}"
        print(f"▸ Using this Mac's stable network name: {host}")
        if ip:
            print(f"  (current IP is {ip}, but the .local name keeps working if that changes)")
    elif ip:
        frag = f"#ip={ip}"
        print(f"▸ Detected this computer's IP: {ip}")
    else:
        frag = ""
        print("▸ Couldn't auto-detect an address — you can type it on the page.")

    print(f"▸ Opening {PAGE.name} in your browser…")
    print("  (Make sure the plans are running:  plans-start)")
    webbrowser.open(PAGE.as_uri() + frag)
    return 0


if __name__ == "__main__":
    sys.exit(main())
