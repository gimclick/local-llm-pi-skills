---
"mattpocock-skills": patch
---

`wayfinder` now ends at the map. A map counts as cleared only when its **Destination** is established, its **Not yet specified** section is empty, and no unresolved decision child ticket remains, blocked or unblocked; a still-blocked ticket keeps the map open and no hand-off is offered. When the map is cleared it tells the human to run `/skill:to-spec` with the map reference and stops there: it never loads that skill (user-invoked, so no agent can reach it), never closes the map, and never starts the build from the session that cleared it.

Before routing a ticket to a named skill, `wayfinder` checks that the skill is loaded in this run, at the point of use rather than on every map load: a name in the agent's `<available_skills>` block for a model-invoked skill, Pi's resolved skill list for a user-invoked one. A skill present in the checkout but not loaded is reported on the ticket and the ticket stays open and unresolved, rather than worked with generic reasoning in place of the methodology it names.

The one-inference-slot rule now names the concurrency it governs. Independent sessions the human runs each have their own slot, and concurrent tracker edits are expected; what is forbidden is one session putting a second delegated run on the wire while one is still running, or backgrounding one to work beside it.

The GitHub tracker doc separates parentage by ticket kind: a `wayfinder:map` issue's children are decision tickets, and an implementation ticket is a child of the spec it was cut from, never of the map that spec was synthesised from. The spec's origin is a citation, not a parent. Where the spec landed as a committed file there is nothing to file implementation tickets under, and that question is recorded, not decided. The doc also gains a procedure for clearing a capability marker: when a real operation proves sub-issues, native blocking, or the dependency gate on that repo, the file records the command and what it returned in place of the **unverified** note, one marker at a time, leaving the other warnings and fallbacks intact.

`README.md` and the wayfinder and setup docs pages now record what this fork has exercised on GitHub (tracker setup, labels, native sub-issues, blocking edges, a resolved ticket, research delegation, glossary updates, map-to-spec publication) and what has not: `prototype`, `to-tickets`, `implement`, `triage`, and every tracker backend other than GitHub.
