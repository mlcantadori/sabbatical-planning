#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_SRC="$ROOT_DIR/scripts/pre-commit-photo-check.sh"
HOOK_DST="$ROOT_DIR/.git/hooks/pre-commit"

if [ ! -d "$ROOT_DIR/.git/hooks" ]; then
  echo "No .git/hooks directory found. Run this inside the repository."
  exit 1
fi

cp "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"
echo "Installed pre-commit hook at $HOOK_DST"

