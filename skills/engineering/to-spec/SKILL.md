---
name: to-spec
description: "Turn the current conversation, or a cleared Wayfinder map, into a spec and publish it: no interview, just synthesis of what you've already decided. A committed repository file when the map names one, otherwise the project issue tracker."
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the user; just synthesize what you already know.

The issue tracker and triage label vocabulary should have been provided to you. If not, tell the user to run `/skill:setup-matt-pocock-skills`.

## Invocation

User-invoked: no agent can reach for it. In Pi, only the human can fire it, by typing `/skill:to-spec`. It takes one optional argument: what to synthesize from. Either a reference to a **Wayfinder map** (URL or issue number) or nothing at all.

## Source: conversation or map

Two sources. Work from whichever the user gave you; never require both.

- **No reference passed**: the current conversation. This is upstream's behavior, and the deciding already happened in this window.
- **A Wayfinder map passed**: the deciding happened in earlier sessions, so this window has nothing to synthesize. Fetch it. Never ask the user to repeat what the map already holds.

A cleared map's tickets are **settled**. Do not reopen them: no new interview, no re-deciding, no improvements slipped in "while we're here". If a decision is missing, or contradicts the codebase, or the tickets disagree with each other, record it and put it to the user as one question. Do not resolve it yourself, and do not invent an answer.

To read a map, follow the operations in this repo's tracker doc (the `docs/agents/issue-tracker.md` that `/skill:setup-matt-pocock-skills` wrote, reached through the `### Issue tracker` pointer in `AGENTS.md` / `CLAUDE.md`). The map is an **index, not a store**: a decision lives in exactly one place, its ticket, and the map only gists it and links.

1. Read the **map body** first: Destination, Notes, Decisions so far, Not yet specified, Out of scope. That is the whole low-resolution view, and `Decisions so far` is one line per closed ticket, a gist plus a link to the ticket that holds the detail.
2. Enumerate the map's **child tickets** using the tracker doc's child-enumeration operation. Never a bare issue list: it returns unrelated issues as well, and it drops children past its default limit.
3. Read each closed child's **final resolution comment**. The answer lives on the comment, not in the ticket body.
4. **Zoom selectively.** Do not read every ticket in full by default. Open a full body and its comments only where the spec must reproduce something exactly: contractual wording, a command, an exit code, one fixture row. The map's gist tells you which ticket you need.
5. A map whose tickets are all closed is **still open itself**; closing the map is not part of the handoff. Never filter on the map's own state.
6. Assets linked from a ticket (a research brief on a throwaway branch, a prototype) may not exist on the branch you are on. The resolution comment is the durable record: do not go reading for a branch that was never merged, and do not treat its absence as a missing decision.
7. Use the vocabulary the map's **Notes** names (usually `GLOSSARY.md`), in the spec's own words, not synonyms.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the spec, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations. When the source is a cleared map whose decisions already settled the seams, restate them from the map rather than sketching fresh ones: surface them so the user can confirm nothing drifted, but do not re-interview them.

3. Write the spec using the template below, then land it. **Where it lands is the destination's call, not yours.** Read the map's **Destination** section:

   - It names a **repository file path**: write the spec to that exact path, creating directories as needed. That file is the **canonical spec**. Do not also open an issue for it and do not open a PR: one document, one place, the same rule the map keeps its decisions by.
   - It names no file, or the source is a conversation: publish through the tracker doc's "When a skill says 'publish to the issue tracker'" operation.

   The destination belongs to that map alone. There is no default path and no repo-wide `docs/specs/` convention: honor what the map declared, and never invent a path for a map that declared none.

   Then the label, only when you published an **issue**: apply the `ready-for-agent` triage label when `docs/agents/triage-labels.md` maps that role and that label already exists on the tracker. A committed file carries no labels. When the vocabulary is not configured or the label is not there, say so and move on; never create a label from this skill.

   **Draft, present, approve, land.** Write the draft first: the file at its destination path, or for an issue the drafted body kept on disk. Present that draft in full, with the exact path or issue it will land on, and ask the user to approve. Keep the draft: approval is a write of the same text, never a fresh synthesis, so saying yes does not send you back through the map. Do not `git add`, commit, push, open a PR, or create an issue until they say yes.

4. **Link the map, once the spec is on the branch.** When the source was a map and the approved spec has been committed **and pushed** (or the approved issue published), add one line to the map's **Destination** section naming the canonical specification and linking it. Update the map body the same way wayfinder appends to it. Do not paste the spec's contents into the map, and do not touch its **Decisions so far** index: the spec is the destination, not a decision a ticket made, and the map stays an index. If the commit or the push failed, do not link a spec that is not there.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

Second exception, and it overrides the rule above: when a settled decision **pinned a contract**, reproduce it exactly, in quotes or a code span. That means a command as invoked, an error or help message byte for byte, an exit code, and any path the destination itself names. A paraphrased error message is a different contract, and a spec that loses it cannot be built from. The same holds for an **acceptance table** a decision settled (input to exit code, stdout, stderr): keep the rows and their exact bytes, and keep the rows the decision ruled out together with why it ruled them out, so completeness is declared rather than inferred from absence. Mark each pinned thing with the ticket it came from, so a reader can tell a settled contract from a sketch.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec. When the source is a map, carry its **Out of scope** section across: the things the map ruled out are the most useful lines on the page, and they are what an implementer will otherwise be tempted to add.

## Further Notes

Any further notes about the feature. When the source is a map, name the map and link it, so a fresh session can zoom the decisions sitting behind this document rather than trusting its gists. Record anything the map left genuinely unresolved here as an open question; do not close it by asking the user a new round of questions, and do not invent an answer.

</spec-template>
