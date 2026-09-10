#!/usr/bin/env bash
# The three gates from CLAUDE.md, in one command.
# Usage: ./scripts/verify.sh [--quiet]
set -uo pipefail
cd "$(dirname "$0")/.."

quiet=0
[ "${1:-}" = "--quiet" ] && quiet=1
log() { [ "$quiet" -eq 1 ] || echo "$@"; }

fail=0
out=""

run() {
  local name="$1"; shift
  log "--- $name"
  local result
  if ! result=$("$@" 2>&1); then
    fail=1
    out+=$'\n'"### $name FAILED"$'\n'"$result"$'\n'
    log "$result"
    log "FAIL: $name"
  else
    log "ok: $name"
  fi
}

run "typecheck" npx tsc --noEmit
run "lint" npx expo lint
run "test" npx jest --ci --silent

if [ "$fail" -ne 0 ]; then
  [ "$quiet" -eq 1 ] && printf '%s\n' "$out"
  exit 1
fi
log "All gates clean."
