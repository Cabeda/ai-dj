#!/usr/bin/env python3
"""Run the standalone converter package from this repository checkout."""
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "packages" / "lilypond-to-strudel" / "src"))

from lilypond_strudel.cli import main


if __name__ == "__main__":
    raise SystemExit(main())
