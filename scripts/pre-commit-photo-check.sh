#!/bin/bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
echo "[pre-commit] validating itinerary photo URLs..."
node "$ROOT_DIR/scripts/validate-photo-urls.mjs"

