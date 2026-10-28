> **This fork (Pi adaptation):** the reading runs **in the foreground, one run at a time** — the session waits for it, nothing reads behind it, nothing fans out. Force it with `/skill:research`. The shared runtime contract is in [the README](../../README.md).

## What it does

`research` answers a question by reading the sources that own the answer, then leaves a cited Markdown file in the repo. It works only from **[primary sources](https://www.aihero.dev/ai-coding-dictionary/primary-source)**: official docs, source code, specs, first-party APIs. It follows every claim back to the source that owns it, so it will not repeat a blog post's account of an API when the API's own docs are reachable.

It does not answer you in the conversation. The output is a file, written where the repo already keeps such notes, with a link on each claim. You get a document you can react to, hand to another agent, or throw away, rather than an answer that is gone when the [session](https://www.aihero.dev/ai-coding-dictionary/session) ends.

## When to reach for it

Type `/research`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task turns into reading legwork.

Reach for it when the next step is *finding something out* from outside the working directory (how a third-party API behaves, what a spec says, whether a version claim holds), and you'd rather not stall your own thread doing the reading. What you need decides which skill:

| What you need | Reach for |
| --- | --- |
| An external fact a decision is waiting on | `research` |
| A decision made *with* you, by interview | [grilling](https://aihero.dev/skills-grilling) |
| A durable architecture decision, written into `GLOSSARY.md` and ADRs | [grill-with-docs](https://aihero.dev/skills-grill-with-docs) |
| To find out whether an approach works in your codebase | [prototype](https://aihero.dev/skills-prototype) |
| A plan too big to hold in one session | [wayfinder](https://aihero.dev/skills-wayfinder) |

The line between `research` and `grill-with-docs` is the **shelf life of what comes back**. Research produces short-lived facts, such as what this library's auth mechanism does as of this week. An ADR records a decision you keep. If what you are producing is a decision rather than a fact, you are [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling), not researching.

## Delegated legwork

The reading runs **in the foreground, one run at a time**. The session waits for it and never carries on working behind it; the next run starts only once the previous one has returned. Nothing is backgrounded, and nothing fans out across children. Research is still legwork you delegate, not thinking you outsource — you get a document to grill, plan, or design against, and you still make the decision.

Three cases bind, and only one of them delegates:

- **The parent, with a `researcher` subagent configured** (this fork's setup, via `pi-subagents`): it hands the question once, in the foreground, and waits for the brief to come back before anything else launches. The child carries its own research brief and its own web tools, so it loads no skill and needs none handed to it.
- **A subagent that is already doing the research**: it does the reading itself, in that run. It has no `subagent` tool, so it cannot delegate again.
- **The parent, with no such subagent configured**: it does the reading itself with whatever web tools it has. The job above is what binds, not the delegation.

The parent owns everything durable: the findings file, any commit, any issue. A delegated researcher only gathers — it receives the question, its scope, and what the decision is waiting on, and returns a cited brief. The parent writes that brief into the Markdown file, where the repo keeps such notes, and says where it put it. Researching directly, you are both, so write the file as you go.

The repo decides where the file goes, not the skill. It follows whatever convention already exists for notes. If there is none, it picks a sensible place and tells you where. It writes one file per run.

## Common questions

**It spawned a second research agent. Is that meant to happen?**

No. Upstream this is their best-documented bug, [issue #530](https://github.com/mattpocock/skills/issues/530): the upstream skill tells its caller to spin up a background agent without restricting the agent type, so the caller spawns a general-purpose agent that carries the same instructions and follows them again. One reporter measured roughly 450k [tokens](https://www.aihero.dev/ai-coding-dictionary/token) across three overlapping runs, and the duplicate finished half an hour later where the user could not see it. Upstream has no shipped fix, and users patched their installed copies with an instruction telling an already-nested agent to do the work itself.

In this fork the nesting is closed **structurally**, not by a line of instruction: the hand-off is the configured `researcher` subagent, which has no `subagent` tool, so it has nothing to nest; and the parent starts the next run only after the previous one returns. A second research run here is a regression against this fork's contract — stop and report it, don't paper over it.

The opposite upstream failure (global instructions that forbid re-delegating, so the agent declines and nothing happens) is handled rather than left silent: with no `researcher` configured, the parent does the reading itself in the same session, and says so.

**Where should the file live, and should I commit it?**

The skill puts the file where the repo already keeps notes and has no further opinion. The community view is mostly settled: keep ADRs, not research files. One Discord thread on this question put it most clearly: "ADRs yes. Everything else archive or delete after done. It otherwise becomes cruft of work and can poison future repo reads if you've drifted away from the spec/research." A research file records what was true on the day it was written, so a stale one is worse than none. On balance, these files don't belong in git, and there is no standard home for them. People use Obsidian, a separate knowledge repo, or the issue tracker instead.

**What counts as a "high-trust" primary source, and who decides?**

The [model](https://www.aihero.dev/ai-coding-dictionary/model) does. The skill names the *kinds* of source that qualify (official docs, source code, specs, first-party APIs), and there is no allowlist, no domain gate, and no verification pass. This was the loudest objection when the skill was first proposed, and nobody has answered it publicly: "Five research subagents pointed at junk just gives you five confident wrong answers faster. How are you gating what counts as high-trust sources?" Your only protection is the citation on each claim. Follow two or three of them. If they land on a summary of the thing rather than the thing, the run failed.

**Does a later session reuse what an earlier run found?**

No. Nothing loads a past research file automatically. The file stays in the repo until a human or a skill points at it. This was the strongest early challenge to the design: "the value's the markdown becoming context the agent re-reads later, not the fetch itself. A write-once dead file is just a fancy search." The shipped skill does not solve it. In practice, the file is useful only when you feed it into the next step yourself: attach it to a spec, quote it into a grilling session, point a [ticket](https://www.aihero.dev/ai-coding-dictionary/ticket) at it.

**Why not just ask the agent to go read the docs?**

You can, and a two-line prompt saying exactly that was the practice this skill replaced. The skill gives you two things the prompt does not. The reading happens in its own run, so your session's [context](https://www.aihero.dev/ai-coding-dictionary/context) stays clean — in this fork that run is **foreground**, so the session waits for it rather than working alongside it. And the primary-source constraint and the cited-file output are the same every time, rather than depending on how you phrased the prompt. Compared with a [harness](https://www.aihero.dev/ai-coding-dictionary/harness)'s own deep-research mode, the difference is the file and the primary-source rule, not the search. If a two-line prompt gets you what you need on a small question, use the two-line prompt.

**When does it stop reading?**

The skill has no stopping criterion. This shows up as two complaints that look opposite but have the same cause: agents that go far too deep, and agents that cover a topic broadly but miss the one detail that mattered. One practitioner put it as "deep-research skills are a bit too deep sometimes. And telling an agent to research usually results in missing crucial details." You have to set the scope. A narrow, answerable question (one API, one behaviour, one version claim) comes back far better than "research X".

**`/wayfinder` created research tickets. Do I resolve those myself?**

No, wayfinder runs them for you — **one at a time, in the foreground**. It runs the configured `researcher` subagent for one research ticket, waits for it to return, then starts the next. There is no parallel fan-out in this fork, and no background run to check on later. The parent captures each brief it returns on a throwaway `research/<name>` branch, with a [context pointer](https://www.aihero.dev/ai-coding-dictionary/context-pointer) from the ticket, and pushes the branch but opens no PR: it is never merged.

Research is still the one ticket type a session hands off, but it is no longer a licence to do unlimited work in one session. Resolve only the research this session can carry. A research ticket that is too big, still blocked, or simply not next stays open and unclaimed for a later session — never a half-done read closed as resolved. Upstream's claim that research tickets are "the exception to one ticket per session" describes the parallel design this fork replaced. One problem carried over from upstream still applies: deleting the branch later breaks the context pointers in the tickets.

## It's working if

- The delegation happened and the session **waited** for it. Reading the sources yourself in the parent means no `researcher` was configured — that is the documented fallback, not a bug.
- At most one subagent ran at a time, and the next started only after the previous one returned. Two running side by side breaks this fork's contract.
- One new Markdown file shows up, in the folder the repo already uses for notes, and the agent tells you the path.
- Every claim in it carries a link, and following two at random lands you on an official doc, a spec, or the source file itself, not on someone's write-up of it.
- You can make the decision you were stuck on from the file alone, without going back to the sources yourself.

## Where it fits

`research` is a reach-for-it-anytime standalone. It feeds the thinking skills and is not a step in the build chain. You take its file *into* the flow. [grilling](https://aihero.dev/skills-grilling) and [grill-with-docs](https://aihero.dev/skills-grill-with-docs) ask sharper questions when they already have the facts, and [to-spec](https://aihero.dev/skills-to-spec) can synthesise against it. [wayfinder](https://aihero.dev/skills-wayfinder) is the one skill that delegates to it directly: it invokes the configured `researcher` subagent for each research ticket on its map, one at a time in the foreground. The child carries its own brief, so it loads no skill. For the whole map, see [ask-matt](https://aihero.dev/skills-ask-matt).
