#!/bin/bash

cd "$(dirname "$0")/../../table-poker"

echo "Running typecheck..."
if ! npx tsc --noEmit; then
  echo "Typecheck failed" >&2
  exit 2
fi

echo "Running lint..."
if ! npm run lint; then
  echo "Lint failed" >&2
  exit 2
fi

echo "All checks passed"
exit 0
