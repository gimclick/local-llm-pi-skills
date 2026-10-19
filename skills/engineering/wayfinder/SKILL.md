---
name: wayfinder
description: Plan a huge chunk of work (more than one agent session can hold) as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear.
disable-model-invocation: true
---

A loose idea has arrived, too big for one agent session, and wrapped in fog: the way from here to the **destination** isn't visible yet. Wayfinding is about finding that way, not charging at the destination. This skill charts the way as a **shared map** on the repo's issue tracker, then works its **decision tickets** (questions whose resolution is a decision, not slices of a build to execute) one at a time until the route is clear.

The destination varies per effort, and naming it is the first act of charting: it shapes every ticket. It might be a spec to hand off and iterate on, a decision to lock before planning starts, or a change made in place like a data-structure migration. The map is domain-agnostic: engineering work, course content, whatever fits the shape.

## Plan, don't do

Wayfinder is **planning** by default: each ticket resolves a decision, and the map is done when the way is clear, with nothing left to decide before someone goes and does the thing. The pull to just do the work is usually the signal you've reached the edge of the map and it's time to hand off. That hand-off is a command for the human, not a step for you: see [Hand off a cleared map](#hand-off-a-cleared-map). An effort can override this in its **Notes**, carrying execution into the map itself, but absent that, produce decisions, not deliverables. The one artifact a map does build is a prototype's demonstration, and it stays throwaway: see [Prototype tickets](#prototype-tickets).

## Refer by name

Every map and ticket is an issue, so it has a **name**: its title. In everything the human reads (narration, the map's Decisions-so-far), refer to it by that name, never by a bare id, number, or slug. A wall of `#42, #43, #44` is illegible; names read at a glance. The id and URL don't vanish; a name wraps its link, but they ride _inside_ the name, never stand in for it.

## Load skills by name

Pi has no Skill tool. Another skill is loaded by reading its `SKILL.md`: the skills you can reach are listed by name, description, and path in your `<available_skills>` block, and "load the `grilling` skill" below means read that path and follow it. A user-invoked skill (`setup-matt-pocock-skills`, and `wayfinder` itself) is absent from that block, so no agent can load it: only the human can, by typing `/skill:<name>`.

### Check it is loaded before you reach for it

A ticket type names the skill that carries its methodology, and that skill may not be loaded in this run. The repo checkout holds skill folders the package manifest never enabled, so a folder on disk is not evidence, and neither is a count of what you expect to find. Check at the point of use, not on every map load or ticket listing: the check belongs to the moment a ticket's type or the map's **Notes** names a skill you are about to work. Take the answer from Pi itself:

- **Model-invoked skill** (`grilling`, `domain-modeling`, `prototype`): the answer is your `<available_skills>` block. The skill is reachable when its name appears there.
- **User-invoked skill** (`to-spec`, `to-tickets`, `implement`, `triage`, `setup-matt-pocock-skills`): absent from that block whether installed or not, so the block is never the answer. Ask the human which skills they installed, or run the resolved-skill listing `/skill:setup-matt-pocock-skills` describes (one `get_commands` record through `pi --mode rpc`), which reports enabled-but-hidden skills too.

When a skill a ticket needs is **not loaded**, report the limitation and stop; do not improvise the methodology with generic reasoning in its place. Post one comment on the ticket naming the missing skill and what would have been done (`prototype` is not loaded in this run, so nothing was prototyped), leave the ticket **open and unresolved**, and do not append it to the map's Decisions-so-far: an improvised resolution reads as settled and drops the methodology the map was charted to keep. Tell the human which skill to install before naming the ticket takeable again.

## The Map

The map is a single issue on this repo's issue tracker, labelled `wayfinder:map`, the canonical artifact. Its tickets are child issues of the map.

The map is an **index**, not a store. It lists the decisions made and points at the tickets that hold their detail; a decision lives in exactly one place, its ticket, so the map never restates it, only gists it and links.

**Where the map, its child tickets, blocking, and frontier queries physically live is tracker-specific.** The issue tracker should have been provided to you. If not, tell the user to run `/skill:setup-matt-pocock-skills`. Consult the tracker doc's "Wayfinding operations" section for how _this_ repo expresses them. If no tracker has been provided, default to the local-markdown tracker.

### The map body

The whole map at low resolution, loaded once per session. Open tickets are **not** listed: they are open child issues, found by query.

```markdown
## Destination

<what reaching the end of this map looks like: the spec, decision, or change this effort is finding its way to. One or two lines; every session orients to it before choosing a ticket.>

## Notes

<domain; skills every session should consult; standing preferences for this effort>

## Decisions so far

<!-- the index: one line per closed ticket, enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [<closed ticket title>](link): <one-line gist of the answer>

## Not yet specified

<!-- see "Fog of war": in-scope fog you can't ticket yet; graduates as the frontier advances -->

## Out of scope

<!-- see "Out of scope": work ruled beyond the destination; closed, never graduates -->
```

### Tickets

Each ticket is a **child issue** of the map; the tracker's issue id is its identity. Its body is the question, sized to one 100K token agent session:

```markdown
## Question

<the decision or investigation this ticket resolves>
```

Each ticket carries a `wayfinder:<type>` label, one of `research`, `prototype`, `grilling`, `task` (see [Ticket Types](#ticket-types)). `wayfinder:` labels are the only labels a map and its tickets carry, never a triage label like `ready-for-agent`: they are decisions, not implementation work.

A session **claims** a ticket by assigning it to the dev driving the map, **first**, before any work, so concurrent sessions skip it. That assignee _is_ the claim: an open, unassigned ticket is unclaimed.

Blocking uses the tracker's **native** dependency relationship: essential because it renders the frontier _visually_ in the tracker's own UI, so the human sees what's takeable without opening the map. Only a tracker that lacks native blocking falls back to a body convention. A ticket is **unblocked** when every ticket blocking it is closed; the **frontier** is the open, unblocked, unclaimed children, the edge of the known.

The answer isn't part of the body; it's recorded on resolution (see [Work through the map](#work-through-the-map)). Assets created while resolving a ticket are linked from the issue, not pasted in.

## Ticket Types

Every ticket is either **HITL** (human in the loop, worked _with_ a human who speaks for themselves) or **AFK**, driven by the agent alone. A HITL ticket only resolves through that live exchange; the agent never stands in for the human's side of it (a grilling agent that answers its own questions has broken this).

- **Research** (AFK): Reading documentation, third-party APIs, or local resources like knowledge bases to surface a fact a decision waits on. Resolved by the `researcher` subagent, one at a time (see [Research delegation](#research-delegation)). Use when knowledge outside the current working directory is required.
- **Prototype** (HITL): Raise the fidelity of the discussion by making a cheap, rough, concrete artifact to react to (an outline, a rough take, a stub, or UI/logic code) by loading the `prototype` skill. Use when "how should it look" or "how should it behave" is the key question. Worked in the parent, resolved only on the human's verdict (see [Prototype tickets](#prototype-tickets)).
- **Grilling** (HITL): Conversation. The default case. Always load both the `grilling` and `domain-modeling` skills.
- **Task** (HITL or AFK): Manual work that must happen before a _decision_ can be made: nothing to decide, prototype, or research, but the discussion is blocked until it's done. Signing up for a service so its API can be judged, provisioning access, moving data so its shape can be seen. This is the one type that _does_ rather than decides, and it earns its place by unblocking a decision, not by delivering the destination. The agent drives it alone where it can (AFK); otherwise it hands the human a precise checklist (HITL). Resolved when the work is done; the answer records what was done and any resulting facts (credentials location, new URLs, row counts) later tickets depend on.

## Research delegation

Research is the only ticket type a session hands off, and this setup runs **one inference generation at a time**, so the handoff is **sequential**: at most one subagent runs at a time, and the next launches only once the previous one has returned. Never fan research out across children, and never background it and carry on working: the session blocks on each run.

- **Invoke the configured `researcher` subagent directly**, in the foreground, one call at a time. It already carries its own research brief and its own web tools, so it loads no skill; it has no `subagent` tool, so it cannot nest.
- **The child only gathers.** It receives the question, its scope, and what the decision is waiting on; it returns a cited brief to the parent. It opens no issue, posts no comment, commits nothing, and spawns nothing.
- **The parent owns everything durable**: the GitHub Issue, the resolution comment, the commit, and the persistent findings file. Write the brief the child returned where this repo keeps research notes, link it from the ticket, and keep the map an index.
- **Fit the session, not the ticket.** Resolve only the research this session can carry. When a `research` ticket is too big, still blocked, or simply not next, leave it open and unclaimed: an unresolved Wayfinder research ticket for a future session, never a half-done read closed as resolved.
- **One slot governs inference this session starts.** Independent sessions the human runs are not fan-out: each has its own inference slot, and concurrent edits to the tracker are expected. What is never allowed is this session putting a second delegated run on the wire while one is still running, or backgrounding one to keep working beside it. The constraint is on agent-managed concurrency, not on the human's sessions.
- **Evidence, not recollection.** A research ticket resolves on claims each tied to a source. A brief with no citations, or one that leaves the question unanswered, does not resolve it; record contradictions and missing evidence on the ticket rather than smoothing them over.

## Prototype tickets

A `prototype` ticket is **HITL**: the artifact exists so a human can react to it, and that reaction is the answer. Work it in this session, in this session's own inference slot.

- **Load `prototype` in the parent.** It is model-invoked, so it is reachable by name in your `<available_skills>` block; read its `SKILL.md` and follow it, including its two branches (a logic demo, or UI variants). Pi has no Skill tool, so a named skill is a file to read.
- **No delegation, no concurrency.** A prototype is not handed to a subagent, not backgrounded, and not run beside another delegated run: the exchange needs the human in it, and a child cannot hold that. If `prototype` is not loaded, follow the missing-skill rule above: comment, leave the ticket open, stop.
- **Answer this ticket's question.** The question the ticket's body asks is the question the prototype answers, written at the top of the artifact so it can be checked later. A prototype built around a different question does not resolve this ticket, whatever it looks like.
- **The ticket owns the artifact.** Commit the prototype to a throwaway `prototype/<name>` branch, push it, open no PR, and never merge it: prototype code does not enter the default branch. Before you branch, read the Git state (the current branch, the dirty paths, and whether `prototype/<name>` already exists), and build in an isolated worktree or on a branch that does not already exist: never overwrite a branch, force-push, discard unrelated working-tree changes, or switch the checkout the rest of the map's work lives in. Record a durable reference **on the ticket** (the branch, the artifact's path inside it, and the commit identifier), so a later session can find and re-run it. Do not hang the reference off an implementation issue; a wayfinder map has none, and inventing one invents a downstream artifact that does not exist yet.
- **The human supplies the verdict.** Show the artifact (its path, its URL, the `?variant=` keys), then put the ticket's question to the human against it. Do not pick a winning UI variant, and do not decide that the prototype has answered the question: you have no way to make that judgement, and choosing it yourself closes the ticket on an untested decision. Wait for the verdict.
- **Open until the verdict arrives.** No resolution comment, no close, no map line for a prototype ticket the human has not answered. If the human is unreachable this session, post one comment naming the branch and the artifact, say the verdict is what remains, and leave the ticket **open and unresolved**.
- **Resolve on the verdict.** Once the human confirms, the resolution comment records the question and the settled decision in the human's own words, plus what it rules in or out, and carries the branch reference. Then close the ticket and append the map's one-line gist and link: the map stays an index pointing at that decision, never a restatement of it.
- **No promotion.** Upstream `prototype` folds the winning variant or the validated module into the real code once the verdict lands. Inside a map that is out of bounds: the map plans. Keep the demonstration on its branch and the confirmed decision in the ticket; fold nothing into production, and start no implementation. That belongs to the spec and the tickets cut from it, in a later session. Standalone `prototype`, outside a map, keeps its upstream behaviour.

## Fog of war

The map is _deliberately_ incomplete: don't chart what you can't yet see. Beyond the live tickets lies the **fog of war**: the dim view of decisions and investigations you can tell are coming but can't yet pin down, because they hang on questions still open. Resolving a ticket clears the fog ahead of it, graduating whatever's now specifiable into fresh tickets, one at a time, until the way to the destination is clear and no tickets remain.

The map's **Not yet specified** section is where that dim view is written down: the suspected question, the area to revisit later. It's the undiscovered frontier _toward_ the destination: everything here is in scope, just not sharp enough to ticket. Write as loosely or as fully as the view allows; it doubles as a signpost for collaborators reading where the effort is headed.

**Fog or ticket?** The test is whether you can state the question precisely now, _not_ whether you can answer it now.

- **Ticket when** the question is already sharp, even if it's blocked and you can't act on it yet.
- **Not yet specified when** you can't yet phrase it that sharply. Don't pre-slice the fog into ticket-sized pieces: it's coarser than a ticket, and one patch may graduate into several tickets, or none, once the frontier reaches it.

**Not yet specified** excludes what's already decided (Decisions so far), what's already a live ticket, and what's out of scope (the next section).

## Out of scope

Fog only ever gathers _toward_ the destination. The destination fixes the scope, so work beyond it is **out of scope**: it isn't fog, and it doesn't belong in **Not yet specified**. It gets its own **Out of scope** section on the map: work you've consciously ruled out of _this_ effort. Scope, not sharpness, lands it here.

Out-of-scope work never graduates (the frontier stops at the destination), so it returns only if the destination is redrawn, and then as a fresh effort, not a resumption.

Ruling something out of scope is a scoping act, not a step on the route. When a ticket that already exists turns out to sit past the destination (mis-scoped in while charting, or exposed by a resolution), **close it** (a closed ticket is unambiguously off the frontier) and leave one line in the **Out of scope** section: the gist plus why it's out of scope, linking the closed ticket. It stays out of **Decisions so far**, which records the route actually walked; a scope boundary isn't a step on it.

## Invocation

Two modes. Either way, **never resolve more than one ticket per session**, with the exception of research tickets, and neither mode ends by building: see [Hand off a cleared map](#hand-off-a-cleared-map).

### Chart the map

User invokes with a loose idea.

1. **Name the destination.** Load both the `grilling` and `domain-modeling` skills, to pin down what this map is finding its way to: the spec, decision, or change. The destination fixes the scope, so it's settled first.
2. **Map the frontier.** Grill again, **breadth-first** this time: fan out across the whole space rather than deep on any one thread, surfacing the open decisions and the first steps takeable now. **If this surfaces no fog** (the way to the destination is already clear, the whole journey small enough for one session), you don't need a map. Stop and ask the user how they'd like to proceed.
3. **Create the map** (label `wayfinder:map`): Destination and Notes filled in, Decisions-so-far empty, the fog sketched into **Not yet specified**.
4. **Create the tickets you can specify now** as child issues of the map, then wire blocking edges in a **second pass** (issues need ids before they can reference each other). Write cross-references in that pass too, with real ids: a placeholder `#<n>` auto-links to an unrelated issue. Wiring sorts them into the frontier and the blocked; everything you can't yet specify stays in the fog: the **Not yet specified** section.
5. **Run the research tickets, one at a time.** For each `research` ticket you just created, run the `researcher` subagent in the foreground and wait for it to return before starting the next (see [Research delegation](#research-delegation)). The parent captures each brief it returns on a throwaway `research/<name>` branch with a context pointer from the ticket, and pushes the branch but opens no PR: it is never merged. Leave any research ticket this session could not carry open for a later session. `prototype` tickets are not run here: they are HITL, so they wait for a session the human is in.
6. Stop: charting is one session's work; it hand-resolves nothing.

### Work through the map

User invokes with a map (URL or number). A ticket is **optional**: without one, you pick the next decision, not the user.

1. Load the **map**: the low-res view, not every ticket body.
2. Choose the ticket. If the user named one, use it. Otherwise take the first frontier ticket in order. **Claim it**: assign it to yourself before any work.
3. Resolve it as the type its `wayfinder:<type>` label names (see [Ticket Types](#ticket-types)). Read the label, not just the body: the body never states the type. **Zoom as needed**: fetch the full body of any related or closed ticket on demand; load whichever skills the `## Notes` block names. If in doubt, load both the `grilling` and `domain-modeling` skills.
4. Record the resolution: post the answer as a **resolution comment**, **close** the issue, and **append a context pointer** to the map's Decisions-so-far. A `prototype` ticket has no answer to record until the human supplies a verdict (see [Prototype tickets](#prototype-tickets)).
5. Add newly-surfaced tickets (create-then-wire); graduate any fog the answer has made specifiable, clearing each graduated patch from **Not yet specified** so it lives only as its new ticket. If the answer reveals that a ticket (this one or another) sits beyond the destination, **rule it out of scope** rather than resolving it on the route. If the decision invalidates other parts of the map, update or delete those tickets.

The human may run unblocked tickets in parallel, in independent sessions each with its own inference slot, so expect other sessions to be editing the tracker concurrently. That is not licence to overlap work this session starts: the one-slot rule in [Research delegation](#research-delegation) still binds here.

### Hand off a cleared map

A map is **cleared** only when all three hold:

- The **Destination** names what the map was finding its way to, so the destination has been established.
- **Not yet specified** is empty: fog still written on the page is work the map has not made specifiable, so the way is not clear.
- No **unresolved decision child ticket** remains, blocked or unblocked. An open ticket that is still blocked is an open decision: the frontier is closed, the map is not. Name the outstanding ticket and stop without handing off.

When all three hold, the map is done. **Tell the human to run `/skill:to-spec` with the map reference** (`/skill:to-spec <map URL or number>`), the skill that collapses the settled decisions into the spec the map's **Destination** names. Then stop.

- **Do not load `to-spec` yourself**, and do not restate its steps: it is user-invoked, so no agent can reach it, and the human's command is the hand-off.
- **Do not close the map.** A cleared map is still open itself; closing it is not part of the hand-off, and the spec links back to it.
- **Do not begin implementation from this session.** The map is an index of decisions, not a build plan; the build belongs to the spec and the tickets cut from it. An effort whose **Notes** carry execution into the map is the exception, and it says so in the Notes.
