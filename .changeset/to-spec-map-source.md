---
"mattpocock-skills": patch
---

`to-spec` now takes an optional Wayfinder map as its argument (`/to-spec #<map_issue>`), and synthesises from that map's settled decisions rather than only the current conversation: it reads the map body, enumerates the map's child tickets, and reads each closed ticket's resolution comment, zooming a full ticket body only where the spec must reproduce something exactly.

Where the spec lands is the map's call, not the skill's. A map whose **Destination** names a repository file path gets a committed spec at that exact path, and that file is the canonical spec: no issue alongside it, no PR. A map that names no path publishes to the tracker as before. There is no default path and no repo-wide `docs/specs/` convention.

The `ready-for-agent` label now applies only to a published **issue**, and only when the triage vocabulary is configured and that label already exists on the tracker; a committed file carries no labels, and the skill never creates a label. The GitHub tracker doc gains an **Edit an issue body** operation (`gh issue edit --body-file`), so a map body keeps its sections intact when a skill appends to it.

The skill drafts before it lands: the file at its destination path, or the drafted body kept on disk for an issue. It presents that draft in full with the exact path or issue it will land on, and waits for the user to approve. Approval is a write of the same text, never a fresh synthesis, and nothing is committed, pushed, or published until then.
