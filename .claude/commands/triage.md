---
description: Triage the open backlog and mark what an agent can ship unattended
---

Triage the WildLens backlog.

1. `gh issue list --state open --limit 100` and read each one.
2. Sort them into three buckets and show me the table before changing anything:
   - **agent-ready** - scope is clear, no product decision left, no new
     credentials or paid services, no ML retraining, and the change is roughly
     under 400 lines. The nightly agent can ship these while I sleep.
   - **needs-decision** - a real question is open. Say what the question is.
   - **too-big** - should be split. Propose the split.
3. After I confirm, apply the `agent-ready` label to the first bucket
   (`gh label create agent-ready --color 0E8A16 --description "Safe for the nightly agent" 2>/dev/null || true`),
   and post the blocking question as a comment on each needs-decision issue.
4. Order the agent-ready bucket so the highest-value issue is oldest - the
   nightly agent takes the oldest one first.
