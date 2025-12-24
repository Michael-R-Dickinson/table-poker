#!/bin/bash

# Read JSON input from stdin
input=$(cat)

# Extract tool name and file path
tool_name=$(echo "$input" | jq -r '.tool_name')
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Only process Edit and Write tools
if [[ "$tool_name" != "Edit" && "$tool_name" != "Write" ]]; then
  exit 0
fi

# Skip if no file path
if [[ -z "$file_path" ]]; then
  exit 0
fi

# Skip if file doesn't exist
if [[ ! -f "$file_path" ]]; then
  exit 0
fi

# Only format TypeScript, JavaScript, JSON, and similar files
if [[ "$file_path" =~ \.(ts|tsx|js|jsx|json|md)$ ]]; then
  cd "$(dirname "$0")/../../table-poker"
  npx -y prettier --write "$file_path" 2>/dev/null || true
fi

exit 0
