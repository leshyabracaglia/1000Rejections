#!/bin/bash
set -e

echo "=== Running tests before build ==="
npm run test:ci

if [ $? -ne 0 ]; then
  echo "Tests failed! Aborting build."
  exit 1
fi

echo "=== All tests passed ==="
