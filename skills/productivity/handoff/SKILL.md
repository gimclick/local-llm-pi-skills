---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows) - not the current workspace.

Include a "suggested skills" section in the document, naming which skills the next agent should reach for. Name only skills the receiving harness actually has: a name it cannot find is a dead pointer. How the next agent reaches one differs by harness, so write the instruction it can act on:

- Where the harness has a Skill tool (Claude Code), name the skill to call that tool with.
- In Pi there is no Skill tool. A model-invoked skill is loaded by reading its `SKILL.md`, whose path the next agent finds in its own `<available_skills>` block: name the skill and say to read that path. A user-invoked skill (`disable-model-invocation: true` in its frontmatter) is absent from that block and no agent can load it, so write the command for the human to type (`/skill:<name>`), never an instruction for the agent to invoke it.

Keep the document a small fraction of the conversation. Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
