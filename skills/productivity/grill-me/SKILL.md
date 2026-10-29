---
name: grill-me
description: A relentless interview to sharpen a plan or design.
disable-model-invocation: true
---

Call the Skill tool with "grilling".

## Invocation

User-invoked: no agent can reach for it. In Pi, only the human can fire it, by typing `/skill:grill-me`; upstream harnesses type `/grill-me`. It takes no argument: the idea in front of the human is what gets grilled, in their own words.

## Pi execution and authorization

This fork runs one live model request at a time, and Pi has no Skill tool. Where this skill says to call the Skill tool, the rules below replace that instruction. Every other step, and every stopping condition, is upstream's.

- **Load the named skill through Pi's registry, not through a path.** The one upstream sentence names one model-invoked skill: `grilling`, the interview. That is one load: check the name in the agent's `<available_skills>` block, read that skill's `SKILL.md` at the path Pi advertises there, and follow the methodology the loaded file carries, including its rounds, its frontier, its question format, and its rule that facts are the agent's job and decisions are the human's. Do not substitute your own version of the interview for the one that loaded. Never resolve the name against the project under review, this checkout, or the installed package clone: the idea being grilled usually has no repo under it at all.
- **Check at the point of use, not at the top.** A name that is not in the advertised list is a missing dependency, and here it is the whole skill: with no `grilling` loaded there is no interview to run. Name the gap, report it, and stop rather than improvising the methodology or claiming to have followed it.
- **Stateless, so there is nothing to gate.** This skill writes no file, creates no branch, and touches no tracker: the shared understanding it produces stays in the conversation, which is upstream's design and not an omission. Nothing here authorizes a commit, a branch, a push, or a pull request, and an interview that reaches an empty frontier authorizes no action. Upstream's stop before acting stays in force until the human confirms shared understanding.
