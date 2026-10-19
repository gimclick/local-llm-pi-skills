---
name: to-tickets
description: Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker (edges as text in one file per ticket locally, or native blocking links on a real tracker).
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into a set of **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it.

The issue tracker and triage label vocabulary should have been provided to you. If not, tell the user to run `/skill:setup-matt-pocock-skills`.

## Invocation

User-invoked: no agent can reach for it. In Pi, only the human can fire it, by typing `/skill:to-tickets`. Upstream harnesses type `/to-tickets`. It takes one optional argument: what to cut tickets from. Either a **repository-relative spec file path** or an **issue reference** (a number or a URL). With no argument, work from the current conversation, which is upstream's behaviour.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path, an issue number or URL), fetch it and read its full body and comments.

#### When the source is a committed spec file

The file in the repository is the **canonical specification**. Read the actual file. Do not work from a recollection of it, a summary of it, or the conversation that produced it.

1. Read the file at the path the user gave, from the working tree.
2. Establish which commit holds the authoritative version **against a ref you name**: `git log -1 <ref> -- <path>` for the last commit that touched it on the branch the build will run from, then `git show <commit>:<path>` to read that exact text. Report the ref and the commit you pinned, so the citation is checkable afterwards. Never take a commit from a stale or unrelated branch silently: when HEAD is not that branch, ask which branch is the source before you pin.
3. Compare the working file against that committed version (`git diff <commit> -- <path>`, or `git status` on the path). A difference is a fact to report, never a fact to absorb quietly.
4. **Do not silently build tickets from uncommitted changes or conversation memory.** When the working file differs from the committed version, or the file is untracked, uncommitted, or otherwise ambiguous, stop and ask the user which source is authoritative **before publishing anything**. Take their answer, re-read, and continue.
5. Preserve the spec's contractual requirements exactly: acceptance-fixture identifiers, commands as invoked, output messages byte for byte, exit codes, and any table rows the spec pins. A paraphrased contract is a different contract.
6. Do not rewrite the canonical specification, and do not invent a requirement it does not state. This skill cuts tickets from it; it does not edit it, renumber its sections, or settle an open question on the spec's behalf.

Cite the source on each published ticket with the **repository-relative spec path** and a **commit-pinned permalink** to the version you cut from. That citation points at the specification. It is not an implementation file path, and it is not an instruction to touch that file: keep upstream's caution against brittle file paths in ticket bodies, and a spec citation is not a loophole in it.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Ticket titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** tickets.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory), each batch its own ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a ticket blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify ticket; green is promised only there.

#### Traceability

Each ticket must be readable by a fresh session that has never seen the spec:

- **One coherent slice.** A ticket delivers one thing, verifiable on its own. Not a layer, not a batch of unrelated fixes.
- **Name the criteria it owns.** Cite the acceptance criteria and, when the spec names them, the **acceptance-fixture identifiers** the ticket makes pass. Use the spec's own identifiers; do not rename them.
- **Cite the source of its required behavior.** The spec path plus commit-pinned permalink, or the issue reference you read. A criterion with no source is a criterion you invented.
- **Name its prerequisites.** The tickets that gate it, by their numbers or titles.
- **Check fixture ownership.** Every required acceptance fixture has exactly one ticket as its **primary owner**, or is documented as already passing at the base commit. A later ticket may reference an earlier fixture for **regression coverage**, and that reference is not a second implementation deliverable: it guards behaviour that already exists and ships nothing new.
- **Do not open work for behaviour already implemented.** Confirm it passes at the commit the implementer starts from, say so, and let a later ticket reference it as a regression.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Blocked by**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work
- **Covers**: the acceptance criteria and fixture identifiers from the spec it owns

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each ticket only depend on tickets that genuinely gate it?
- Should any tickets be merged or split further?
- Is every fixture from the spec owned by exactly one ticket, or already passing?

Iterate until the user approves the breakdown. **Nothing is published until they approve it.** The approval gate is mandatory: it is a human decision, and no part of this skill acts on a breakdown the human has not agreed to.

### 5. Publish the tickets to the configured tracker

Publish the approved tickets. **How** depends on the tracker `/skill:setup-matt-pocock-skills` configured; the tickets are the same either way, only the shape of the blocking edges changes:

- **Local files** → write one file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order (blockers first). Each file's "Blocked by" lists the numbers/titles it depends on. Use the per-ticket file template below: one ticket per file, never a single combined file.
- **A real issue tracker (GitHub, Linear, …)** → publish one issue per ticket in dependency order (blockers first) so each ticket's blocking edges can reference real identifiers. Use the platform's native blocking relationship where it has one; otherwise set each ticket's "Blocked by" to the blocking issues. If the source was an existing issue, make each ticket its sub-issue (the tracker doc's operation), **unless that issue is a Wayfinder decision map** (see [Parentage](#parentage)). Apply the `ready-for-agent` triage label **only when** `docs/agents/triage-labels.md` maps that role and that label already exists on the tracker. When it does not, report the unavailable label and publish the tickets without it: a missing label is a note, not a blocker, and never a label you create.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

Do NOT close or modify any parent issue.

#### Parentage

Parentage follows the source, not the habit:

- **A spec committed as a Markdown file** → publish **standalone implementation issues**. Do not open an issue merely to duplicate the spec: the file is the spec, and a second copy of it on the tracker is a second document to keep in sync. Do not attach implementation tickets to a `wayfinder:map` issue either; the map's children are decision tickets, and a build slice filed under it reads as a decision the map made. Cite the spec from each ticket body (path plus commit-pinned permalink) instead of inventing a parent.
- **A separate implementation umbrella issue** is allowed **only when the user has explicitly approved it**. Never create one automatically. When approved, it holds the tickets and says which spec file is canonical.
- **An existing source issue** → keep upstream's sub-issue behaviour: the tickets are its children. The one exception is a Wayfinder decision map, which never takes an implementation child.

#### Execution constraints

This fork runs one inference slot at a time, and this skill publishes an artifact; it does not run it:

- **No delegation.** Tickets are not handed to subagents by this skill, and this skill starts nothing.
- **Independent tickets do not imply parallel execution.** Two tickets with no edge between them may both be takeable; they are still worked one at a time.
- **Sequential work.** One focused fresh session per ticket, in dependency order, at most one run in flight.
- **No automatic implementation.** No auto-dispatch, no "do the next ticket" step, and no duration estimates for a ticket. Sizing is a slice rule, not a promise about time.

<local-ticket-template>

# <NN>: <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

**Source:** the spec at `<repo-relative path>`, <commit-pinned permalink to the version cut from> (or the issue reference you read). Not an implementation file path.

**Covers:** the acceptance criteria and fixture identifiers from that spec this ticket owns, or "already passing at the base commit" for any it only guards.

**Blocked by:** the numbers/titles of the tickets that gate this one, or "None (can start immediately)".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-ticket-template>

<issue-template>

## Parent

A reference to the parent issue on the tracker (if the source was an existing issue, otherwise omit this section). Omit it too when that issue is a Wayfinder decision map: implementation tickets cut from a committed spec are standalone.

## Source

The repository-relative spec path plus the commit-pinned permalink for the version cut from, or the reference to the source issue. This is a citation, not an implementation file path.

## What to build

The end-to-end behaviour this ticket makes work, from the user's perspective, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1, with the spec's own fixture identifier where it has one
- [ ] Criterion 2

## Blocked by

- A reference to each blocking ticket, or "None (can start immediately)". Omit this section when blockers were set as native edges.

</issue-template>

In either form, avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
