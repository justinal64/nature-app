---
description: Run the three quality gates (typecheck, lint, test)
allowed-tools: Bash(./scripts/verify.sh*), Bash(npx tsc*), Bash(npx expo lint*), Bash(npx jest*)
---

Run `./scripts/verify.sh` and report the result.

If anything fails, fix it, then re-run until all three gates are clean. Do not
report the work as done while any gate is red.
