#!/usr/bin/env bash
set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGES_DIR="$BASE_DIR/public/images"
MANIFEST="$BASE_DIR/image-manifest.json"

mkdir -p "$IMAGES_DIR/categories" "$IMAGES_DIR/masters" "$IMAGES_DIR/reviews" "$IMAGES_DIR/products"

python3 - <<'PY'
import json, os, urllib.request
base = os.path.dirname(os.path.abspath(__file__))
manifest_path = os.path.join(base, "image-manifest.json")
images_dir = os.path.join(base, "public", "images")

with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

for rel, url in manifest.items():
    out = os.path.join(images_dir, rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    print(f"Downloading {rel} ...")
    urllib.request.urlretrieve(url, out)

print("Done. Images saved into public/images/")
PY
