---
name: retro
description: "Conduct a retrospective on a coding session."
disable-model-invocation: true
---

The user has asked for a **retrospective**. You are suggesting improvements to the coding agent's **environment** to improve future runs.

## Steps

1. Load `writing-for-agents` before you read any session evidence. Pi has no Skill tool: check that `writing-for-agents` appears in the agent's `<available_skills>` block, then read `skills/productivity/writing-for-agents/SKILL.md` in this checkout and follow it. It is registered and model-invoked here. When the candidate you are judging is a skill document, follow that file's own conditional pointer and read `SKILL-MECHANICS.md` beside it. Load it eagerly, not only before you write: it carries the definitions of a no-op instruction and of a good skill, and the **No-ops** and **Skills** candidates are judged against them. A name that is not loaded is a missing dependency: report it and stop rather than judge the steering files with no yardstick.

2. Read the primary sources for the session the user specifies. This may mean searching through session logs on this machine. If the user doesn't specify a session, default to the current one. Pi names the current session in `PI_SESSION_FILE`; a past session is one the user selects, by path, by session ID, or from the `/resume` picker. Read either one the way **Session evidence** below describes, not by loading a whole log.

3. Look for candidates for improvement in these categories.

- **Navigation**: how easy was it for the agent to find the right files? Are there hidden dependencies between files? Would a **navigation pointer** make it easier? _Use when_ the session took a long time to find a piece of information.
- **Automated checks**: are there automated checks that could catch errors the agent made? Linting, typing, tests, filesystem linters? Read the repo's own check command first (its `package.json`/build-tool `lint`/`check` scripts, its CI workflow), so a check that already exists but sits unwired or silently broken is the finding, not a reinvention. A repo with no **guardrail** (no pre-commit hook and no CI job running its lint/typecheck/test command) is itself a finding: an un-linted repo is a standing missed opportunity, not a neutral default. _Use when_ the agent made a mistake an automated check could have caught, or the repo has no guardrail at all.
- **Coding standards**: should the **reviewer agent** be given a new rule to enforce? Should an existing rule be removed or clarified? Classify the violation first: a **mechanical** one (a fixed syntactic pattern, a banned API, an import shape, a file-location rule) gets a deterministic check, full stop: a custom rule in the repo's own linter, a new pre-commit hook, or a new CI job, whichever the repo's language and existing guardrail make cheapest. Default to building the check over writing the rule. Reserve `CODING_STANDARDS.md` for genuine **judgement calls** (cross-file consistency, "matches the surrounding style," anything no guardrail could ever substitute for). _Use when_ the reviewer agent failed to catch a mistake.
- **Global AGENTS.md**: are there any steering instructions that should be moved to coding standards (or automated checks) instead? _Use when_ the AGENTS.md file is particularly large - in the repo OR the user's global scope.
- **Tool economy**: did the agent make expensive tool calls that could be streamlined? Is there any custom tooling (CLI's, MCP's) that is particularly token-inefficient? _Use when_ the agent made an expensive tool call.
- **No-ops**: look for instructions in steering files that don't modify the agent's behavior. _Use when_ the steering files are large and unwieldy.
- **Information access**: look for opportunities to increase the agent's access to information. Teeing dev server logs, readonly access to third-party services. _Use when_ a crucial piece of information was not available to the agent.

4. Present these candidates to the user, in order of severity. Stop there: see **Output and approval** below.

## Session evidence

Pi saves each session as a JSONL tree under `~/.pi/agent/sessions/--<working-directory>--/<timestamp>_<session-id>.jsonl`, one directory per working directory. `pi --continue` reopens the most recent session for the current directory, `--session` opens a path or ID you already have, and `/export` writes the current session out as HTML or JSONL.

- Identify the selected session before reading it, and follow its actual entry structure. Entries form a tree linked by `id`/`parentId`, and not every line is a user or assistant message: headers, tool results, and compaction entries are separate entry types.
- These logs are large. Search selectively by entry type, keyword, entry ID, or bounded range, and read only the entries needed to establish one specific observation. Never load a whole log into the model context.
- A fresh session does not hold another session's conversation. A past session is evidence you read from its file, not memory you recall.
- Keep observed and interpreted apart. A recorded tool call and its output are observations; a model's account of what it was doing, and a compaction summary, are interpretations. A compaction summary can locate an event; it is not proof of one.
- Do not reconstruct reasoning you cannot read. Where the record does not show the struggle, report that category as having no evidence rather than filling it with a plausible finding.
- Repository artifacts corroborate a session: committed diffs, test runs, the repo's own check scripts, CI workflows, hooks, and steering files are checkable now. Name the source beside every candidate, and discard any candidate you cannot trace to a specific session moment or to a deficiency you inspected directly.

## Output and approval

Retro proposes. Its normal completion is the severity-ranked list, each candidate naming its evidence and the enforcement surface that already exists.

Nothing is applied in the same run, and Retro writes no file: no source code or project instruction edited, no other skill edited, no CI check or hook created or changed, no `CODING_STANDARDS.md` created, no Git configuration changed, no dependency installed, no commit or push, no issue or pull request opened or edited, and no external permission changed. Present the candidates and stop for the human to pick.

A selected improvement is a separately authorized implementation task, run as its own change with its own review. Prefer wiring a check that already exists over creating a duplicate. A newly proposed blocking check is code like any other: run it against the project, including against changes that should pass, before it is allowed to block.

## Reference

### Implementation vs Review

Remember that all work goes through two stages: implementation and review. The implementation agent has the most **context pressure**. They are responsible for exploration, writing code, and debugging failures.

The review agent has the least context pressure - it receives a diff, so no exploration needed. It often does not need to write code or debug.

This means that the review agent should be responsible for imposing coding standards, not the implementation agent.

### Files

You have access to several files in the repo:

- `CLAUDE.md`/`AGENTS.md`: these files are pushed to the context window of any agent working in this repo. They should be used incredibly sparingly, usually only for **navigation pointers** to other files.
- `CODING_STANDARDS.md`: this file is read during review, not implementation. Add **navigation pointers** to docs folders if the standards file gets more than 1,000 lines long.
- Docs: use docs as references files, pointed to by other files. Look for existing docs before writing new ones.
- Skills: use skills for docs (since their description goes into the agent's context window), or for user-invoked commands. Follow the advice in the `writing-for-agents` skill.

### This fork's instruction files

`CLAUDE.md` is upstream-controlled and must not be deleted, rewritten, or trimmed. `AGENTS.md` is fork-local and harness-aware. Retro may name a no-op or a redundant instruction in either, and recommend its removal or its move into standards or a check, but it never edits either file, and it never proposes adding an instruction to an always-loaded file when a narrower surface the agent already reads would carry it. Do not create a new document to hold retrospective findings: the lesson lives in the check, the pointer, or the standard, or it is dropped. If a proposed `CODING_STANDARDS.md` would restate policy the repo already documents, point at that existing authoritative review surface and say why, rather than adding a second standards file.

## Execution

One selected session, or one clearly bounded work episode, at a time. Nothing is delegated and nothing runs in parallel or in the background: this fork has one inference slot. No other skill invokes `retro`; the human types `/skill:retro`.
