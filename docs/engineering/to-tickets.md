> **This fork (Pi adaptation):** `to-tickets` is user-invoked and **registered in this fork's Pi manifest**, so no agent can fire it: type `/skill:to-tickets`, with an optional repository-relative spec path or issue reference after it. Its upstream methodology is unchanged. What this fork adds is source discipline: a committed spec file is read from the repository and pinned to a commit before any ticket is cut, each ticket cites the spec it was cut from and names the acceptance fixtures it owns, and a spec committed as a file yields standalone implementation issues rather than children of a map. It is **Validated** in the README's maturity categories: it has published tickets successfully in at least one representative workflow here, which is not a claim that every tracker backend or label path has been exercised. The shared runtime contract, including the maturity categories, is in [the README](../../README.md).

## What it does

`to-tickets` takes a plan, a [spec](https://www.aihero.dev/ai-coding-dictionary/spec), or the conversation you are in, and breaks it into a set of **[tickets](https://www.aihero.dev/ai-coding-dictionary/ticket)** on your issue tracker. Each ticket declares its **blocking edges**: the other tickets that have to finish before it can start.

Every ticket is a **tracer bullet**: a narrow but complete path through every layer of the change (schema, API, UI, tests) that you can demo on its own as soon as it lands. This is what makes the skill different from the obvious way to split work, which is to cut one layer at a time and integrate at the end. It also sizes each ticket to fit in a single fresh [context window](https://www.aihero.dev/ai-coding-dictionary/context-window), because a [session](https://www.aihero.dev/ai-coding-dictionary/session) that has never seen your spec will pick the ticket up.

## When to reach for it

You invoke this by typing `/skill:to-tickets` in Pi; the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) won't reach for it on its own, and no other skill can. Upstream harnesses type `/to-tickets`. It takes one optional argument: what to cut tickets from, a repository-relative spec file path or an issue reference.

| Where you are | What to run |
| --- | --- |
| You have a spec issue and the build spans several sessions | `/skill:to-tickets`, or `/skill:to-tickets #<spec_issue>` |
| The spec is a committed file in the repo | `/skill:to-tickets <path/to/spec.md>` |
| The plan is only in the conversation, never written up | `/skill:to-tickets` reads the thread directly, no spec needed |
| The whole change fits in one context window | [implement](https://aihero.dev/skills-implement), skip the tickets |
| Nothing is decided yet | [grill-with-docs](https://aihero.dev/skills-grill-with-docs), then [to-spec](https://aihero.dev/skills-to-spec) |
| A [wayfinder](https://aihero.dev/skills-wayfinder) map has cleared | [to-spec](https://aihero.dev/skills-to-spec) first, to collapse the map, then `/skill:to-tickets` on the spec it landed |

Tickets that `to-tickets` produced are agent-ready by construction. Don't run [triage](https://aihero.dev/skills-triage) over them. Triage is for work that arrived from someone else.

## Prerequisites

`to-tickets` publishes into a tracker, so [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) must have configured one for this repo, along with the triage-label vocabulary. Either kind works: a real tracker like GitHub or Linear, or local markdown files under `.scratch/`, which work with no extra setup.

## Tracer bullets, not layers

A **horizontal** slice ships one layer of the change. Nothing works until every layer has landed, and each ticket's acceptance criteria have to reach into work that another ticket owns. A **vertical** slice (the tracer bullet) ships one thin path through all the layers at once, so it is verifiable alone and owns everything it grades.

This is the rule people break most often. One team ran a 26-ticket stack sliced by layer (corpus, producer, aggregator, selector) and got roughly twenty agent runs per closed ticket, about three quarters of them rework. Their own post-mortem traced every failure class back to the horizontal slicing rather than to the implementations.

Two things happen before anything is published. `to-tickets` looks for prefactoring (the principle "make the change easy, then make the easy change") and orders that work first. Then it presents the breakdown as a numbered list and quizzes you on it: is the granularity right, are the blocking edges real, should anything merge or split. Nothing reaches the tracker until you approve, and that quiz is the place to push back.

## The committed spec is the source of truth

When you hand it a spec file, that file is the **canonical specification**, and the skill reads it rather than remembering it. It reads the working file, names the ref it searched and the commit that last touched the file on that ref, and reads that committed text; then it checks whether the working copy differs from that commit. The ref is the branch the build will run from, stated in the open: a commit from a stale or unrelated branch is never picked silently. A difference is reported, never absorbed: the skill does not build tickets from uncommitted edits or from what an earlier session said. Where the source is ambiguous, or uncommitted, it stops and asks which source is authoritative before it publishes anything.

That is what makes the tickets survive a fresh session. Each one carries a citation of its own: the repository-relative spec path plus a **commit-pinned permalink** for the version it was cut from. A citation points at the specification, not at code to change. The upstream rule against brittle file paths in ticket bodies still holds, and a spec citation is not a loophole in it.

The spec's contracts travel into the tickets unchanged: acceptance-fixture identifiers, commands as invoked, messages byte for byte, exit codes. The skill does not paraphrase them, invent a requirement the spec does not state, or rewrite the spec itself.

## Fixture ownership

A spec that names acceptance fixtures gets checked against the ticket list before publication: every required fixture has exactly one ticket as its **primary owner**, or is recorded as already passing at the commit the work starts from. A later ticket may reference an earlier fixture as **regression coverage**, and that reference is not a second implementation deliverable: it guards behaviour that already exists and ships nothing new. Behaviour the codebase already implements gets no ticket; it is named as already passing.

## Blocking edges

The edges are the point of the artifact. They work in two ways, depending on the tracker:

| Tracker | Where the edges live | How you work them |
| --- | --- | --- |
| Local markdown | Text in one file per ticket under `.scratch/<feature>/issues/<NN>-<slug>.md`, numbered blockers-first | Top to bottom, by hand |
| A real tracker (GitHub, Linear) | Native blocking links, or sub-issues where the tracker has them | Any ticket whose blockers are done is on the **frontier** and can be grabbed |

The edges live in the ticket either way. The tracker only decides whether anything can act on them in parallel. `to-tickets` produces the artifact; running it is your job, not the skill's, and in this fork the running is **sequential**: one focused fresh [session](https://www.aihero.dev/ai-coding-dictionary/session) per ticket, in dependency order, one run in flight. Two tickets with no edge between them may both be takeable; that does not mean they run at the same time, because this setup has one inference slot. Nothing here is delegated, and there is no auto-dispatch step that starts the next ticket for you.

## Parentage follows the source

| The source was | The tickets are |
| --- | --- |
| A spec committed as a Markdown file | **Standalone** issues. No issue is opened to duplicate the spec, and the spec is cited from each ticket body instead |
| An existing issue | Children of that issue, as upstream does |
| A `wayfinder:map` issue | Never its children. A map's children are decision tickets; a build slice filed under one reads as a decision the map made |
| An umbrella issue, approved by you | One separate umbrella holding the tickets, only when you said so; never created on its own |

## The wide-refactor exception

One shape breaks the tracer-bullet rule. A **wide refactor** is a single mechanical change (rename a column, retype a shared symbol) whose **blast radius** covers the whole codebase. One edit breaks thousands of call sites, so no vertical slice can land green.

`to-tickets` sequences that as **expand–contract** instead:

- **Expand**: add the new form beside the old, so nothing breaks.
- **Migrate**: move call sites over in batches sized by blast radius (per package, per directory), one ticket per batch, each blocked by the expand. CI stays green because the old form still exists.
- **Contract**: delete the old form once no caller remains, in a ticket blocked by every migrate batch.

Where even the batches can't stay green alone, they share an integration branch and all block a final integrate-and-verify ticket. CI only has to be green at that ticket.

## Common questions

**It produced twelve tickets for a three-line change.**
Over-decomposition is the most reported problem with this skill, and many users see it. The [model](https://www.aihero.dev/ai-coding-dictionary/model) defaults to atomic units and loses the grouping that would make them meaningful. The quiz step is where you fix this. Ask it to merge tickets, and it will. There is also a lower limit. If the whole change fits in one context window, you don't need this skill at all. Go straight to [implement](https://aihero.dev/skills-implement).

**The tickets came out one per layer: all the schema in one, all the API in another.**
This is the failure the vertical-slice rule is written against, and the skill still produces it sometimes. Catch it at the quiz step by asking one question per ticket: what can I demo when this is done? A ticket with no answer is a horizontal slice. Some people add a "demo path" line to each ticket for this reason, and report that it pushes the model toward vertical slices.

**On GitHub the tickets weren't created as sub-issues of the spec issue.**
This was reported across a dozen runs and several models, [most fully in issue #554](https://github.com/mattpocock/skills/issues/554). Fixed: `to-tickets` makes each ticket a sub-issue of its source issue, and the GitHub tracker template gives the command (`gh issue create --parent <n>`, `gh` 2.94+). Re-run [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) to refresh an older `docs/agents/issue-tracker.md`. That answer covers a source that **is an issue**. When the spec landed as a committed file there is no parent to attach to, and this fork does not invent one: the tickets are standalone, and cite the spec by path and commit-pinned permalink instead. Implementation tickets are never attached to a Wayfinder map issue either, upstream's or this fork's: the map's children are decision tickets.

**`ready-for-agent` never got applied, or the publish run died on a missing label.**
Upstream applies that label unless told otherwise, and on a tracker that has never heard of it that is a failed write. In this fork the label is conditional: it is applied only when the configured triage-label document maps that role and the label already exists on the tracker. When it does not, the skill reports that and publishes the tickets without it. A missing label is a note, never a reason a publication fails, and the skill never creates a label of its own.

**"Blocked by" was written into the issue body instead of a real blocking link.**
This is the same kind of problem, [reported in issue #513](https://github.com/mattpocock/skills/issues/513), where the agent even stated that GitHub has no native blocking relationship at all. It does: `gh issue create --blocked-by 12,15`. Because the skill publishes blockers first, their numbers are always available at creation time. The body text is meant to be the fallback for trackers with no native edge, not the default. The ticket template now omits `## Blocked by` when the edges are native.

**Where do the local tickets go? The v1.1 notes said a root-level `tickets.md`.**
They did, and that was a bug. A single shared file also caused race conditions when parallel agents wrote to it. Local mode now writes one file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, in dependency order, matching the layout the local tracker template already described. The `NN` prefix is a real ticket ID, so `/implement 03` works instead of retyping a long title.

**It kept truncating when it tried to read my spec.**
A very large spec can outgrow what a tracker issue serves back cleanly. There is no local copy to fall back on, so the agent spends [tool calls](https://www.aihero.dev/ai-coding-dictionary/tool-call) fetching chunks again and never reaches the end. Don't [clear](https://www.aihero.dev/ai-coding-dictionary/clearing) or [compact](https://www.aihero.dev/ai-coding-dictionary/compaction) between `/skill:to-spec` and `/skill:to-tickets`. Run them in the same context window and the agent never has to fetch the spec back. A spec that landed as a committed repository file has no truncation problem at all: `/skill:to-tickets` reads it from that path, in full, whenever a later session needs it.

**The acceptance criteria graded nothing: some passed before any work was done.**
The template asks for criteria and says nothing about whether they can fail, so this happens. Three shapes recur: a criterion already true at the base commit, a criterion that only work in another ticket can satisfy, and one that restates the request rather than deriving from the artifact. Vertical slicing prevents most of it, because a slice that delivers new behaviour fails at the base commit by construction. The check is still worth doing by hand. For each criterion, name the observation that would show it false, and confirm it fails at the commit the implementer starts from.

**The tickets are published. How do I actually run them?**
The skill stops at the artifact, and there is no auto-dispatch mode. Dispatch is manual: look at the board, count the tickets with no open blockers, and open that many agent sessions. Give each ticket a fresh context, and clear between them. [implement](https://aihero.dev/skills-implement) does not reliably close or check off the ticket when it finishes, on GitHub or in local markdown, so you update the ticket's state yourself. In this fork the count stays at one: the board tells you what is takeable, and you run one focused session at a time, because the setup has a single inference slot.

## It's working if

- Every ticket has an answer to "what can I demo when this is done?", and the answer is behaviour, not a layer.
- The list comes back to you numbered, with a "Blocked by" line on each, before anything is published.
- The ticket at the top has no blockers and can be started immediately.
- Nothing in a ticket body is a file path or a line number, except a snippet a prototype produced, or a citation of the spec file it was cut from.
- Each ticket reads like something a fresh session could finish without you in the room.
- Prefactoring, where it found any, is at the front of the order rather than mixed into feature tickets.
- A spec handed in as a file is read from the repository, and the ref it searched and the commit it was cut from are both named before any ticket is published.
- A spec file with uncommitted edits stops the run and asks, rather than becoming tickets of its own.
- Each published ticket names the acceptance fixtures it owns, and no fixture has two owners.

## Where it fits

`to-tickets` is a step in the main build chain:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review → retro
```

Upstream is [to-spec](https://aihero.dev/skills-to-spec), which hands it a settled spec to slice against. Keep both in one context window, with no clear between them. Downstream is [implement](https://aihero.dev/skills-implement), which builds one ticket per fresh session, driving [tdd](https://aihero.dev/skills-tdd) for the tests and closing with [code-review](https://aihero.dev/skills-code-review). [implement-spec](https://aihero.dev/skills-implement-spec) is the other way down. It reads the same blocking edges as a task graph and builds every ready ticket in parallel on one integration branch. Neither is registered in this fork's manifest, and neither is adapted here: this fork builds one ticket per fresh session, in sequence. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
