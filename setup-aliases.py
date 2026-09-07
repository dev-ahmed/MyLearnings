#!/usr/bin/env python3
"""setup-aliases.py — add `plans-start` / `plans-stop` aliases to your ~/.zshrc
so you can run the learning plans from anywhere.

Run once:  python3 setup-aliases.py
Then:      source ~/.zshrc     (or open a new terminal)

Re-running is safe — it replaces its own block, so your zshrc never accumulates
duplicates. Undo with:  python3 setup-aliases.py --remove
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent            # MyLearnings/ (wherever it lives)
ZSHRC = Path.home() / ".zshrc"
BEGIN = "# >>> MyLearnings aliases >>>"
END = "# <<< MyLearnings aliases <<<"

BLOCK = f"""{BEGIN}
# Run the learning-plan trackers from anywhere. Managed by setup-aliases.py.
alias plans-start='python3 "{ROOT / "start.py"}"'
alias plans-stop='python3 "{ROOT / "stop.py"}"'
alias plans-qr='python3 "{ROOT / "launcher.py"}"'
alias plans-dir='cd "{ROOT}"'
{END}"""


def strip_old(text: str) -> str:
    """Remove any existing MyLearnings block (idempotent)."""
    pattern = re.compile(re.escape(BEGIN) + r".*?" + re.escape(END) + r"\n?", re.DOTALL)
    return re.sub(pattern, "", text).rstrip() + "\n"


def main() -> int:
    remove = "--remove" in sys.argv[1:]
    existing = ZSHRC.read_text() if ZSHRC.exists() else ""
    cleaned = strip_old(existing)

    if remove:
        ZSHRC.write_text(cleaned)
        print(f"✓ Removed MyLearnings aliases from {ZSHRC}")
        print("  Run 'source ~/.zshrc' or open a new terminal to apply.")
        return 0

    new = cleaned.rstrip() + "\n\n" + BLOCK + "\n" if cleaned.strip() else BLOCK + "\n"
    ZSHRC.write_text(new)
    print(f"✓ Added aliases to {ZSHRC}:")
    print("      plans-start   → build & start all plans")
    print("      plans-stop    → stop all plans")
    print("      plans-qr      → open the phone QR launcher page")
    print("      plans-dir     → cd into the MyLearnings folder")
    print("\nActivate them now with:  source ~/.zshrc   (or just open a new terminal)")
    print("Then, from anywhere:      plans-start")
    return 0


if __name__ == "__main__":
    sys.exit(main())
