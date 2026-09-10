#!/usr/bin/env bash
# PostToolUse hook: prettier the file Claude just wrote, so formatting never
# shows up as review noise.
set -uo pipefail
input=$(cat)
command -v jq >/dev/null 2>&1 || exit 0
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md) ;;
  *) exit 0 ;;
esac
npx --no-install prettier --write "$file" >/dev/null 2>&1
exit 0
