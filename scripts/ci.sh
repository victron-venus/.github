#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/validate-source.py
python3 scripts/workflow_contracts.py
python3 -m unittest discover -s tests -p test_site.py
ruff check --ignore-noqa --select E9,F63,F7,F82 scripts tests
