---
description: Take an issue from open to reviewable PR
argument-hint: <issue number>
---

Ship issue #$1 end to end.

1. `gh issue view $1 --comments` and read CLAUDE.md before touching anything.
2. Restate the scope in one or two sentences and name the files you expect to
   change. If the issue is ambiguous, needs a product decision, or is much
   bigger than it reads, stop here and ask me instead of guessing.
3. Branch: `git checkout -b agent/issue-$1-<short-slug>` off an up-to-date `main`.
4. Implement it. Match neighbouring style. Respect the offline-first rules -
   a network call in the identify or guide hot path is a bug.
5. Add or update tests in `__tests__/` for any logic testable without a device.
6. `./scripts/verify.sh` must be clean before you go further.
7. Commit with the `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`
   trailer, push, and `gh pr create` against `main`. The body starts with
   `Closes #$1`, explains what changed and why, lists what you left out, and
   flags anything I need to verify on a real device.
8. Do not merge. Print the PR URL and stop.
