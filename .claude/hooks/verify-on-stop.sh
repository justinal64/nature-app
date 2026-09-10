#!/usr/bin/env bash
# Stop hook: refuse to let the session end with a broken tree.
# Exit 2 feeds the failures back to Claude so it fixes them instead of
# reporting work as done. Guarded so it can only fire once per stop chain.
set -uo pipefail
input=$(cat)

if command -v jq >/dev/null 2>&1; then
  active=$(printf '%s' "$input" | jq -r '.stop_hook_active // false')
  [ "$active" = "true" ] && exit 0
fi

repo="$(cd "$(dirname "$0")/../.." && pwd)"

# Nothing changed in the working tree? Nothing to verify.
if git -C "$repo" diff --quiet && git -C "$repo" diff --cached --quiet; then
  exit 0
fi

if output=$("$repo/scripts/verify.sh" --quiet 2>&1); then
  exit 0
fi

echo "Quality gates failed - fix these before finishing:" >&2
echo "$output" >&2
exit 2
