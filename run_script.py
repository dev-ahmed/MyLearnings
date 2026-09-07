#!/usr/bin/env python3
import sys
import subprocess
from pathlib import Path

try:
    import tomllib
except ImportError:
    try:
        import tomli as tomllib
    except ImportError:
        print("Error: Python 3.11+ required or install tomli: pip install tomli")
        sys.exit(1)


def load_scripts():
    config_path = Path(__file__).parent / "scripts.toml"
    with open(config_path, "rb") as f:
        return tomllib.load(f)


def list_scripts(scripts):
    print("Available scripts:")
    for name in scripts.keys():
        print(f"  - {name}")


def run_script(name, scripts):
    if name not in scripts:
        print(f"Error: Script '{name}' not found")
        list_scripts(scripts)
        sys.exit(1)

    command = scripts[name]
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True)
    sys.exit(result.returncode)


def main():
    config = load_scripts()
    scripts = config.get("scripts", {})

    if len(sys.argv) < 2:
        list_scripts(scripts)
        print("\nUsage: python run_script.py <script-name>")
        sys.exit(0)

    script_name = sys.argv[1]
    run_script(script_name, scripts)


if __name__ == "__main__":
    main()
