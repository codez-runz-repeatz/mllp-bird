#!/bin/sh
# build.sh - Build standalone executables for macOS, Linux, and Windows using pkg

set -e

VERSION=$(node -p "require('./package.json').version")
DIST_DIR=dist

# Clean dist directory
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Install pkg if not already installed
echo "Checking for pkg..."
if ! command -v pkg >/dev/null 2>&1; then
  echo "Installing pkg..."
  npm install -g pkg
fi

echo "Building executables..."
pkg . --targets node16-macos-x64,node16-linux-x64,node16-win-x64 --out-path "$DIST_DIR"

# Version the executables
for f in "$DIST_DIR"/*; do
  ext=""
  case "$f" in
    *.exe) ext=".exe";;
  esac
  mv "$f" "$DIST_DIR/$(basename "$f" "$ext")-$VERSION$ext"
done

echo "Build complete. Versioned executables are in the ./dist directory."
