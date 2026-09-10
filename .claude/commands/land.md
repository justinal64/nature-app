---
description: Turn the work in progress into a reviewable PR
---

Take whatever is uncommitted right now and land it as a PR.

1. `git status` and `git diff` - summarise what actually changed.
2. If we are on `main`, create a branch first. Never commit to `main` directly.
3. `./scripts/verify.sh` must be clean.
4. Commit in logical chunks with the
   `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` trailer. Use
   `Closes #N` in the body if this closes an issue.
5. Push and `gh pr create`. Do not merge. Print the PR URL.
6. If you noticed anything broken or sketchy that was out of scope, file it as
   an issue rather than fixing it silently.
