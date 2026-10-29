---
name: wait-what
description: "Stop. That last message did not land: re-pitch it."
disable-model-invocation: true
---

Wait, I don't understand where you've got to here. Re-pitch that: give me a little bit of context, talk in ASD-STE100 Simplified Technical English, and use the ubiquitous language from `GLOSSARY.md` (follow `GLOSSARY-MAP.md` to the right one if the repo has more than one).

## Invocation

User-invoked: no agent can reach for it. In Pi, only the human can fire it, by typing `/skill:wait-what`; upstream harnesses type `/wait-what`. It takes no argument: the message that did not land is whatever the human means by it, in their own words, and how far back the re-pitch goes is the agent's call, since what lost you is usually bigger than one paragraph.

## Pi execution and authorization

The sentence above is the whole instruction. It names no skill to load, no tool to call, and no artifact to write, so it runs in this session as written, with no delegation and no second model session. What this fork has to state is where the two files it names live, and what happens when they do not.

- **`GLOSSARY.md` and `GLOSSARY-MAP.md` belong to the project under review.** Read them from the project the session is working on, never from this repository, the installed package clone, or beside this `SKILL.md`. A `GLOSSARY-MAP.md` at the project root means the repo indexes more than one context: follow it to the one the conversation is actually in. Where the map does not make that context obvious, ask which one before re-pitching, rather than picking one silently.
- **When they are not there, lose only the vocabulary half.** No `GLOSSARY-MAP.md` means one root `GLOSSARY.md`, so read that one. No `GLOSSARY.md` at all means the re-pitch still runs on the register and the context you were missing. Name that the domain-vocabulary half was lost, and never substitute a term you invented for one the project owns: inventing project nouns is the failure this skill exists to stop.
- **A re-pitch explains, it does not act.** Re-pitching what you just explained authorizes no edit, no refactor, no file written, no branch, no commit, no push, and no tracker write. That work is separately authorized, in a later session.
