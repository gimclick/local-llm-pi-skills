---
name: implement
description: "Implement one ticket or spec in a fresh session: fetch a referenced issue and state its title, read the commit-pinned spec it cites, drive tdd at confirmed seams, run focused tests as you go and the full suite once, commit to the human-confirmed branch, then run code-review over that committed range."
disable-model-invocation: true
---

# Implement

Implement the work described by the user, a specification, or a ticket. One invocation, one ticket, one fresh session: the tickets `to-tickets` produces are vertical slices sized to fit one context window, and this fork runs one inference slot, so a ticket is worked by this session and never handed to another live run beside it.

This skill builds what has already been decided. There is no interview, no re-planning, no proposal of a different approach: whatever the spec, the ticket, and the conversation settled upstream is the input, and the job is to turn it into a local commit. It is not a ticket scheduler and it is not an orchestrator: it does not pick the next ticket, dispatch a frontier, or run several tickets in one session. That job belongs to `implement-spec`, which stays out of this fork's manifest.

## Invocation

User-invoked: no agent can reach for it. In Pi, only the human can fire it, by typing `/skill:implement`; upstream harnesses type `/implement`. It takes one optional argument: an **issue reference** (a number or a URL) or a **repository-relative spec path**. With no argument, work from the spec or the plan in the current conversation, and name that source before you start.

## Process

### 1. Establish what the work is, from its authoritative source

Resolve the tracker through `docs/agents/issue-tracker.md`, the file `/skill:setup-matt-pocock-skills` writes. If that file is missing or the tracker section is unconfigured, tell the user to type `/skill:setup-matt-pocock-skills`: it is user-invoked, so name the command and do not attempt it.

When the user passed an issue reference:

- **Fetch it and state its title before implementing anything.** On GitHub pass the target explicitly, from the tracker doc's **Target repository** line: `gh issue view <n> -R <owner>/<repo> --json number,title,body,labels,comments`. Never choose among remotes silently; when the reference or the remotes are ambiguous, ask.
- Check the title against what the user meant. A bare `#2` resolved against some other numbered list in context is the classic wrong-ticket run; passing the issue URL or `owner/repo#2` removes the ambiguity.
- Read the issue body in full: its **Source** citation, its acceptance criteria, and its blockers.

Then read the specification the ticket was cut from. The issue is the **scoped task**; the specification is **authoritative for behaviour**.

- Where the citation names a spec path plus a commit-pinned permalink, read that exact committed revision (`git show <commit>:<path>`), and report the commit you pinned. Never implement from a recollection, a summary, or the conversation that produced the spec.
- If the working copy of that file differs from the pinned revision, report the difference and ask which source is authoritative **before implementing**. Do not absorb a drifted spec quietly.
- Preserve the contract literally: acceptance criteria as written, output messages byte for byte, exit codes, and the spec's own fixture identifiers. A paraphrased criterion is a different contract.
- Respect what the spec excludes and what the repo's ADRs and `GLOSSARY.md` already settle. Do not add a feature the spec did not ask for.
- Where the issue and the spec genuinely conflict, report the conflict and ask. Do not silently pick one side and change the requirement.

### 2. Check readiness and Git state before editing

- **Blocking gate.** Where the tracker records native blocking as verified, take the open-only count: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` (open blockers only; `0` means startable). Where the tracker doc marks the capability **unverified**, use its fallbacks (`gh issue view <n> -R <owner>/<repo> --json blockedBy` with `[.blockedBy.nodes[] | select(.state == "OPEN")] | length`, guarding that the node array is not truncated, or the `Blocked by: #<n>` body line) and say which gate you read. Do not start a ticket with unresolved open blockers unless the human explicitly resolves the situation, by closing the blockers or saying to proceed.
- **Inspect the checkout**: `git status --short`, the current branch, recent commits, and the base the human named. Report what is already on the branch.
- **Look for partial implementation.** If part of the ticket is already committed, say so and implement the remainder against that state; do not rewrite it from scratch and do not overwrite unrelated work.
- **Confirm the branch or worktree before editing.** Ask the human which branch the work lands on and wait for their answer. Never create or switch branches on your own, never amend an earlier commit, never force-push, never use a destructive Git operation.
- **One run at a time.** One implementation task per fresh session, in the foreground, at most one model request live. No delegation of the implementation, no parallel implementers, no worktree fan-out: several `/implement` runs sharing one checkout, one index and one HEAD is worse than unsupported.

### 3. Record the fixed point before work begins

On the confirmed branch, resolve the base the review will start from and write it down: the branch name, `git rev-parse HEAD`, and `git merge-base <base-ref> HEAD` when the human named a base other than HEAD. This is the fixed point handed to `code-review` at the end, pinned now so the reviewed range is this ticket's work and not whatever else lands later.

### 4. Drive TDD at approved seams

`tdd` and `code-review` are model-invoked in this fork, so they are reachable by name in your `<available_skills>` block. Pi has no Skill tool: loading one means reading its `SKILL.md` in this checkout and following it. Check the block at the point of use, not by assumption.

- **Load `skills/engineering/tdd/SKILL.md` in this session** and follow it: what a good test is, the anti-patterns, and the rules of the loop. If `tdd` is not loaded, report the missing dependency and stop here; do not substitute generic testing advice for the methodology that skill carries.
- **The seam gate binds.** A seam already recorded as human-approved in the spec or ticket you are working from is reused without re-asking. A seam you infer, propose, or cannot point at an approval still needs the human's answer before any test is written: name the public test seam, give each one a one-line note on what it catches and what it misses, and wait. Acceptance criteria name behaviour, not seams, so they are never an approval on their own.
- **Run the loop where it fits.** If the ticket is glue, wiring, or straight delegation with no independent source of truth to assert against, say so and ask the human whether the red → green loop applies at all before writing a test that restates the implementation. That judgement is the human's, and a test with no independent source of truth is the tautological anti-pattern `tdd` names.
- **Red before green, one slice at a time.** One seam, one failing test, only enough code to pass it, repeat. Expected values come from the acceptance criteria and the pinned spec, never from what the implementation currently returns. There is no refactoring phase in this loop: refactoring belongs to `code-review`.

### 5. Run the feedback loops while you work

Run typechecking and the focused test files you touched regularly, as the implementation proceeds, and the full available test suite once near the end. Report every command you ran and what it returned. Name any test suite that could not run and why. Never claim a test passed without having seen its result.

### 6. Commit, then review the committed range

The order differs from upstream on purpose: an uncommitted diff is invisible to a review that reads commits, so the commit comes first.

1. **Commit** the implementation to the branch the human confirmed. A normal commit: no amend, no force-push, nothing staged left over from elsewhere.
2. **Resolve the committed HEAD SHA**: `git rev-parse HEAD`.
3. **Check the range before reviewing it.** `git diff --stat <fixed-point> <head-sha>` and `git log <fixed-point>..<head-sha> --oneline` must be non-empty and name the ticket's work. An empty range is reported and the review stops; a range that names work the ticket did not ask about is reported and tightened by asking for a better fixed point.
4. **Load `skills/engineering/code-review/SKILL.md` in this session** and follow it. If `code-review` is not loaded, stop the review step and report the missing dependency; do not invent a substitute review.
5. **Pass the fixed point from step 3** and let that skill pin the range (the reference supplied, the merge-base SHA, the reviewed HEAD SHA) and run its two axes as it defines them: **Standards** and **Spec** in separate fresh contexts, launched one at a time, the second only after the first has returned, never two model requests live. Keep the axes separate and the report two sections; do not blend a verdict.
6. **Report the findings; act on none of them.** `code-review` is diagnostic, and this skill does not apply speculative suggestions on the reviewer's behalf. The human decides what to fix.
7. **Coverage is stated, not assumed.** If a reviewer could not obtain complete evidence or reports partial coverage, say so and do not present the review as comprehensive.
8. **Corrections come later, and only on approval.** A fix the human asks for is committed separately and reviewed as a **delta** from the previous reviewed HEAD SHA to the new one, labelled as a delta rather than a reapproval of everything. Do not re-run the review until the report comes back clean.

### 7. Where the run ends

The run ends at a local implementation commit and a review report. It does not push, open a pull request, close or comment on an issue, change labels or tick acceptance checkboxes, or start the next ticket. Publication and ticket completion stay the human's.

## Report

Close the session with:

- The ticket implemented (number and the title you fetched) and the specification it came from: repository-relative path plus the commit you pinned.
- The branch, the fixed-point SHA recorded in step 3, and the implementation commit SHA.
- The test and typecheck commands run and their results, and any that could not run.
- The review findings under `## Standards` and `## Spec`, opened with the pinned range, plus which review mode ran and its coverage.
- Remaining concerns: unverified capabilities, unrun tests, partial coverage, conflicts you reported.
- The human action that makes dependent tickets available: closing this ticket on the tracker. `implement` never closes it, and a dependency chain stays stalled until it does.
