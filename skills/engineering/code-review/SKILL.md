---
name: code-review
description: "Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews as two separate fresh-context reviewers, one at a time, and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to \"review since X\"."
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards**: does the code conform to this repo's documented coding standards?
- **Spec**: does the code faithfully implement the originating issue / spec?

Each axis gets its own **fresh-context reviewer**, and the two run **one at a time, in the foreground**: the Standards reviewer returns before the Spec reviewer is launched, and neither sees the other's brief or findings. Upstream fans the two out in parallel; this fork runs one inference slot, so the same two axes and the same two briefs run sequentially. Never start the second before the first has returned, and never have two model requests live at once.

The issue tracker should have been provided to you. If it has not, tell the user to type `/skill:setup-matt-pocock-skills`. That skill is user-invoked in Pi, so no agent can run it for them: name the command, do not attempt it.

## Process

### 1. Pin the fixed point, and fail closed

Whatever the user said is the fixed point (a commit SHA, branch name, tag, `main`, `HEAD~5`, etc.). If they didn't specify one, ask for it. Never guess one.

Upstream compares with `git diff <fixed-point>...HEAD`: the three-dot form measures from the merge-base, not from the fixed point itself. Keep that semantics, and resolve it to immutable commits once, so a branch move later cannot change what was reviewed. Record three identifiers:

- the reference the user supplied, kept verbatim
- the merge-base SHA: `git merge-base <fixed-point> HEAD`
- the reviewed HEAD SHA: `git rev-parse HEAD`

Run the actual review against the resolved SHAs, not the moving names: `git diff <merge-base-sha> <head-sha>` and `git log <merge-base-sha>..<head-sha> --oneline`.

Fail here, before any reviewer is launched, rather than inside one:

- `git rev-parse <fixed-point>` fails: report the bad reference and stop.
- The merge-base does not resolve: report that the comparison cannot be established and stop.
- The diff is empty: report that the committed range is empty and stop.

Name what sits outside the range. Run `git status --short` and state that staged, unstaged and untracked changes are not part of the reviewed range; if the user wants them reviewed, they commit first, then review.

A positional reference (`HEAD~5`, or a branch far behind) can pull in history unrelated to the change under review. Read the commit list before delegating: if it names work the user did not ask about, say so and ask for a tighter fixed point. Do not review the extra history silently.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.), fetched via the workflow in the tracker doc.
2. A path the user passed as an argument.
3. A spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** reviewer will skip and report "no spec available".

### 3. Identify the standards sources

Search the repo for every file that documents how code should be written. When `CODING_STANDARDS.md` or `CONTRIBUTING.md` exists, it must be on the list.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below: a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation. Like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Prepare the evidence, then review one axis at a time

The reviewers are read-only: Pi's packaged `reviewer` agent has read, grep, find and ls, and no shell, so it cannot run `git diff` or resolve a ref itself. The parent is the only one that can produce the diff, so it produces it once and hands it over.

Collect the evidence in the parent before delegating:

- The full diff text of `<merge-base-sha>` against `<head-sha>`. The actual diff, not a summary, not a file list, not a paraphrase.
- The commit list from `git log <merge-base-sha>..<head-sha> --oneline`.
- The three identifiers from step 1: the supplied reference, the merge-base SHA, the reviewed HEAD SHA.
- The axis-specific evidence: for Standards, the standards-source files found in step 3, pasted in full; for Spec, the spec source found in step 2, as its repository-relative path plus the commit that holds it, and its full text.

Check the evidence is complete before delegating. Compare the text you will send against `git diff --stat <merge-base-sha> <head-sha>`: every file in the stat is present, and the added and removed line counts match. The same check binds the axis evidence: every standards file found in step 3 is pasted in full, and the spec text is the version held at the reviewed HEAD SHA.

One axis is one reviewer with one context, so one brief must carry the whole diff for that axis. Where it will not fit, do not split the range across two calls for the same axis: that is a second reviewer, and stitching two partial reviews back together presents them as one review of the range. Ask the user for a tighter fixed point instead, or review the narrower set they name as separate labelled reviews. If a partial pass is what the user asked for, label that axis's report **partial coverage** and name the files and hunks reviewed and the ones left out. Never present a partial review as covering the whole range, and never substitute a summary for the code.

Then run the two reviews in sequence, one fresh context each:

1. Launch the Standards reviewer in the foreground and wait for it: `subagent({ agent: "reviewer", task: ..., async: false })`.
2. Only after it returns, launch the Spec reviewer as a separate fresh-context call.

Never issue the two calls together, and never let two model requests be live at once. Each reviewer gets its own axis only: do not paste the other axis's brief, question, or findings into either one.

**Fallback, when no suitable reviewer agent is configured** (check with `subagent({ action: "list" })` rather than assuming): run both axes yourself, in this session, one after the other, each from its own brief, and label the report as a **foreground-only review**. Say that the two axes did not get independent contexts, and that the reasoning already in this session may have shaped what the review found. Never present a foreground-only review as an independent one. Everything else still binds: both sections, citations on every finding, the word limits, and no blended verdict.

**Standards reviewer brief** carries:

- The pinned range (the three identifiers) and the full diff text.
- The commit list.
- The standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full (the reviewer has no other access to it).
- The ask: "Report, per file/hunk where relevant, (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls: documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec reviewer brief** carries:

- The pinned range and the full diff text.
- The commit list.
- The path or fetched contents of the spec.
- The ask: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

Both briefs carry the same format instruction, because the packaged `reviewer` agent has its own default output (a P0/P1/P2 severity ladder and a `Merge verdict: BLOCK, OK, or OK with notes` line). That default does not apply here. Each reviewer answers in the categories asked for above, with a citation on every finding, under its own word limit, and returns no severity ladder, no merge verdict, and no ranking across the two axes. The parent owns the report shape: the pinned range, the two sections under `## Standards` and `## Spec` as the reviewers put them, and the per-axis summary. Nothing in the report blends the two axes. Findings stay inside the diff; where a finding needs surrounding code, name the files the reviewer may read for context, which is evidence about the change, not a licence to review outside the range.

Pi's harness already keeps a child from fanning out on its own, so upstream's guard line against nested `/code-review` spawns is not needed here and is not added.

If the spec is missing, skip the Spec reviewer and note that in the final report.

### 5. Aggregate

Open the report with the pinned range exactly as resolved in step 1: the reference the user supplied, the merge-base SHA, and the reviewed HEAD SHA. Findings are only verifiable against those commits, and HEAD moves while the report is being read.

State which mode ran: two sequential fresh-context reviewers, or the foreground-only fallback. State the coverage too: whether each axis reviewed the whole range or only part of it, naming what was left out where it is partial.

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings, because the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes: that's the reranking the separation exists to prevent.

### 6. What this skill does not do

`code-review` is diagnostic. It changes no code, writes no files, commits nothing, pushes nothing, and writes nothing to an issue tracker. The user decides which findings to act on, and the fixing happens elsewhere.

A later correction review is a **delta review**: pin the previous reviewed HEAD SHA as the new fixed point and diff `<previous-head-sha> <new-head-sha>`. Name it as a delta review of that range, and say that findings outside the delta are not being reapproved. It is not a comprehensive reapproval of the final codebase.

Do not run this skill repeatedly until the report comes back clean. Each pass is a list of leads, and there is no convergence guarantee.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
