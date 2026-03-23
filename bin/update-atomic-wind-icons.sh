#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ICONS_DIR="$ROOT_DIR/assets/atomic-wind/icons"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

git clone --no-checkout --depth=1 --filter=blob:none \
  https://github.com/lucide-icons/lucide.git "$WORK_DIR/lucide"

cd "$WORK_DIR/lucide"
git sparse-checkout set icons
git checkout

rm -rf "$ICONS_DIR"
mkdir -p "$ICONS_DIR"
find "$WORK_DIR/lucide/icons" -name "*.svg" -exec cp {} "$ICONS_DIR/" \;

node "$ROOT_DIR/bin/generate-icons-json.mjs" \
  --icons-dir "$ICONS_DIR" \
  --out "$ROOT_DIR/assets/atomic-wind/icons.json"
