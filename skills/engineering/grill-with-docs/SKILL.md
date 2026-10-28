---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
disable-model-invocation: true
---

Call the Skill tool twice, for "grilling" and "domain-modeling".

## Invocation

User-invoked: no agent can reach for it. In Pi, only the human can fire it, by typing `/skill:grill-with-docs`; upstream harnesses type `/grill-with-docs`. It takes no argument: the plan or design in front of the human is what gets grilled, in their own words.

## Pi execution and authorization

This fork runs one live model request at a time, and Pi has no Skill tool. Where this skill says to call the Skill tool, the rules below replace that instruction. Every other step, and every report requirement, is upstream's.

- **Load each named skill through Pi's registry, not through a path.** The one upstream sentence names two model-invoked skills: `grilling` (the interview) and `domain-modeling` (the writing). That is two loads, issued one at a time, never one load naming both: check each name in the agent's `<available_skills>` block, then read that skill's `SKILL.md` at the path Pi advertises there, and follow the methodology the loaded file carries. Do not substitute your own version of the interview or of the writing discipline for the one that loaded. Never resolve a skill name against the project under review, and never against a path in this repository: the repo being grilled is usually not this checkout. Files bundled with a loaded skill, such as `domain-modeling`'s glossary and ADR formats, resolve against the directory holding that skill's loaded `SKILL.md`.
- **Check at the point of use, not at the top.** A name that is not in the advertised list is a missing dependency: name the step that cannot proceed, keep the work that does not need it, and report the gap rather than improvising the missing methodology or claiming to have followed it. A missing `grilling` blocks the interview; a missing `domain-modeling` blocks the glossary and ADR writing, and the interview can still run.
- **Persistent writes need the human.** `GLOSSARY.md` and `docs/adr/` files are tracked project files. Before the first one, state the write set: each file, and which resolved term or decision each change serves. Wait for the answer. One approval covers the whole set, and no approval means stop at the interview and hand the findings over.
- **A settled decision authorizes nothing.** Reaching a decision in the interview is not permission to refactor, to design an interface, to create a branch, to commit, to push, or to open a pull request. That work is separately authorized, in a later session.
