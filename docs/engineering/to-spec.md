> **This fork (Pi adaptation):** `to-spec` is user-invoked here, type `/skill:to-spec`; no agent can fire it. It takes an optional **Wayfinder map** reference, and a map whose **Destination** names a repository file path gets a committed spec file instead of an issue. The shared runtime contract is in [the README](../../README.md).

## What it does

`to-spec` turns what you have already decided into a **[spec](https://www.aihero.dev/ai-coding-dictionary/spec)**, and lands it where the work says to land it: a committed repository file when a Wayfinder map's **Destination** names one, otherwise your issue tracker.

It does not interview you. When you reach for it, the deciding is already done. So it synthesises what is known (from the thread, the codebase, your `GLOSSARY.md` and ADRs) and does not start a new round of questions. The spec records decisions you already made. It is not a place to make new ones.

There are two sources, and you hand it one. The current conversation is upstream's source: the deciding happened in this window. A cleared **Wayfinder map** is the other: the deciding happened in earlier sessions, so this window holds nothing to synthesise, and the skill fetches the map and reads its settled tickets instead. A cleared map's tickets are settled decisions, so the skill does not reopen them; something missing, contradicting the codebase, or disagreeing between tickets becomes one question to you, not a decision the skill makes for you.

## When to reach for it

You invoke this by typing `/skill:to-spec` in Pi; the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) won't reach for it on its own. Upstream harnesses type `/to-spec`.

Reach for it when the build is too big for one agent [session](https://www.aihero.dev/ai-coding-dictionary/session) and must be split across several. That is the whole trigger:

| Where you are | What to run |
| --- | --- |
| You haven't decided anything yet | [grill-with-docs](https://aihero.dev/skills-grill-with-docs) first |
| Decided, and the work fits one [context window](https://www.aihero.dev/ai-coding-dictionary/context-window) | [implement](https://aihero.dev/skills-implement): skip the spec |
| Decided, and the work spans several sessions | `/skill:to-spec`, then [to-tickets](https://aihero.dev/skills-to-tickets) |
| A [wayfinder](https://aihero.dev/skills-wayfinder) map has cleared | `/skill:to-spec #<map_issue>` (or the map's URL) |

## Prerequisites

`to-spec` lands the spec somewhere an implementer can find it, so [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) must first configure a tracker for this repo; in Pi, type `/skill:setup-matt-pocock-skills`. Either kind of tracker works: a real tracker like GitHub, or local markdown files under `.scratch/`, which work with no extra setup.

The triage-label vocabulary is what the `ready-for-agent` label needs, and in this fork that step is conditional. The label is applied only when the vocabulary is configured, that label already exists on the tracker, and the spec landed as an **issue**. A committed spec file carries no labels, and the skill never creates a label of its own; it reports the gap and moves on.

## The spec is a decision record

The spec exists because context windows end. You settled many things while [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling): the shape of the solution, the choices you argued through, and what you deliberately refused. All of that is in one conversation that you are about to clear. The spec keeps it.

So the spec does not validate or decide anything. It records what you decided, in your project's own vocabulary, so a fresh session can pick up the work without you explaining it again. If the spec states something you never said, that is a defect.

## Seams before prose

Before it writes anything, `to-spec` sketches the **seams** where the feature will be tested, and checks them with you. It prefers existing seams to new ones, and picks the highest seam it can. The ideal number of seams for a change is one.

Other skills use those agreed seams later. [tdd](https://aihero.dev/skills-tdd) works only at seams you agreed in advance. [code-review](https://aihero.dev/skills-code-review) reviews the diff against the spec, so a seam nobody agreed to shows up as a review finding. Both connections go through this document. That is why you should take the seam conversation seriously here, and not leave it for implementation.

## Where the spec lands

The destination belongs to the map, not to the skill. A Wayfinder map opens with a **Destination** section, and that section says what the end of the map looks like. When it names a repository file path, that path is where the spec goes and that file is the **canonical spec**: no issue alongside it, no PR, one document in one place, the same rule the map keeps its decisions by.

| What the map's Destination says | What `to-spec` does |
| --- | --- |
| A repository file path | Writes the spec to that exact path, creating directories as needed |
| No file path named, or no map at all | Publishes through the tracker doc's "publish to the issue tracker" operation |

There is no default path and no repo-wide `docs/specs/` convention: the destination is per map, declared in that map, and a map that declared none gets a tracker issue. If you want the spec somewhere else, change the map's Destination before you run the skill.

It drafts before it lands: the file at its destination path, or the drafted body kept on disk for an issue. It presents that draft in full, names the exact path or issue it will land on, and waits for you to approve. Approval is a write of the same text, never a fresh synthesis, so saying yes does not send you back through the map. Nothing is committed, pushed, or published until you do.

## Common questions

**Where did `/to-prd` go?**
It is this skill, renamed in v1.1. "Spec" is now the one term used throughout, and the old `to-prd` slug no longer works, so reinstall under the new name. The old vocabulary is replaced by the pair *spec* and *tickets*. The spec is the destination and the decisions that fix it. The [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket) are the steps that get there. If you change direction, delete the unfinished tickets and keep the spec.

**Why does the spec get the `ready-for-agent` label? I don't want an agent implementing off it.**
The label means "no further triage needed": the document is complete enough for an agent to work from. It marks an input, not a work order. But [AFK](https://www.aihero.dev/ai-coding-dictionary/afk) agents that poll for `ready-for-agent` cannot see that difference. They will try to build the whole spec in one run instead of picking up the ticket slices. This is the most-reported problem with the skill. Until it changes, exclude the parent spec explicitly in your AFK agent's prompt, or remove the label after `/to-tickets` has run. In this fork the step is conditional: the label is applied only when the spec landed as an issue and that label already exists on the tracker. A committed spec file carries no label at all, which is why a poller never picks it up.

**Why not go straight from grilling to `/to-tickets` and skip the spec?**
Often you should. The spec is worth its step only on multi-session work. Its value is that the tickets are disposable and the spec is not. Each ticket is sized for one fresh context window and then gets deleted or closed, while the spec stays as the one place that records the reasoning behind them. On a single-session change, that gives you nothing, and you pay for an extra synthesis step where the [model](https://www.aihero.dev/ai-coding-dictionary/model) can drift. Go from grilling to `/implement`.

**I just finished a wayfinder map. What do I feed it?**
Give it the main map issue, `/skill:to-spec #<map_issue>` (upstream: `/to-spec #<map_issue>`), not the individual decision tickets. [wayfinder](https://aihero.dev/skills-wayfinder) produces decisions spread across a map, not deliverables. `to-spec` collapses them into one document you can build from. It reads the map body first, then the map's child tickets and each closed one's resolution comment, since the map is an index and the detail lives on the ticket. If you loop the map straight into `/implement`, you lose that step.

**The map named a file path for the spec. Do I still get an issue?**
No. The file replaces the issue: one document, one place. Publishing both duplicates the spec, which is the same thing the map rules out for decisions. The map's **Destination** section gains one line naming and linking the spec once the approved spec is committed and pushed, so a fresh session can find the document from the map. The spec's contents are never pasted into the map.

**Is the spec for me to review, or is it just for the agent?**
Mostly for the agent, and it reads that way: complete, dense, and full of references. Read the seams and the out-of-scope section. In those two places, a wrong decision is cheapest to catch now and most expensive to find later. People do complain about reading the whole thing, and there is no summary mode. But if the spec surprises you, the grilling was too shallow; the spec is not too long.

**Do I keep the spec frozen once tickets start, or let the agent rewrite it?**
Nothing keeps it in sync. In practice it is a snapshot of what you knew at that moment, and it goes out of date the first time implementation teaches you something. Treat it as disposable after the work ships. Your `GLOSSARY.md` and ADRs are the files meant to last. If you learn something during implementation that should last, put it there, not in an edited spec.

**My work is a refactor or a module boundary, not a feature. Does the template fit?**
Less well, and this is a known limitation. The template relies heavily on user stories, which do not fit architectural work. You end up writing stories nobody asked for around decisions that are really about interfaces and invariants. Use the implementation-decisions and testing-decisions sections instead. Record the lasting architectural decisions as ADRs through [grill-with-docs](https://aihero.dev/skills-grill-with-docs), not in the spec.

**Will it check the tracker for related work, or cite the ADRs it's respecting?**
No to both. It reads and follows the ADRs for the area it touches, but it does not link them. It also does not search the tracker for overlapping issues before it writes, so a spec can duplicate work that someone already filed, and nothing warns you. If the area is busy, search the tracker yourself first.

**`/to-tickets` couldn't read my spec: it kept truncating.**
A tracker issue may not return a very large spec in full, and there is no local copy to use instead. To fix this, do not [clear](https://www.aihero.dev/ai-coding-dictionary/clearing) or [compact](https://www.aihero.dev/ai-coding-dictionary/compaction) between `/to-spec` and `/to-tickets`. Run them in the same window, and `/to-tickets` never has to fetch the spec again. A spec that landed as a committed repository file has no truncation problem: it is read from that path, in full, whenever a later session needs it.

## It's working if

- It starts writing instead of asking you a new round of questions.
- Given a map, it fetches it and reads the tickets behind it; it never asks you to repeat what the map already holds.
- It shows you the seams before it writes, and proposes as few as it can.
- It shows the whole draft, with the exact path or issue it will land on, and asks you to approve before anything is committed, pushed, or published.
- It uses your project's nouns, not generic product-management boilerplate.
- A command, an error message, or an exit code that a ticket pinned appears in the spec exactly as that ticket wrote it, not paraphrased.
- You remember making every decision in it. It invented nothing to fill a section.
- The out-of-scope section lists real things. The things you refused are usually the most useful lines on the page.

## Where it fits

`to-spec` is a step in the main build chain, but only on the multi-session branch of it:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review → retro
```

Upstream, [grill-with-docs](https://aihero.dev/skills-grill-with-docs) makes the decisions that this skill only records, and a finished [wayfinder](https://aihero.dev/skills-wayfinder) map joins the chain here. In this fork that handoff is `/skill:to-spec`, and the spec lands where the map's **Destination** names it. Downstream, [to-tickets](https://aihero.dev/skills-to-tickets) cuts the spec into tracer-bullet tickets for [implement](https://aihero.dev/skills-implement) to build. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
