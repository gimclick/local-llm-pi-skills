> **This fork (Pi adaptation):** `wait-what` is user-invoked and **registered in this fork's Pi manifest** as the twenty-first skill, so it is absent from the agent's `<available_skills>` block and only the human can fire it, by typing `/skill:wait-what` with no argument (upstream harnesses type `/wait-what`). Its `SKILL.md` carries upstream's 396-byte file byte-identical as its prefix at the pinned commit `59db609eb1e18aaf59b63284d0e52255aff0c63c`, and its `agents/openai.yaml` is byte-identical in full, so the one operative sentence, its leading word **wait**, the ASD-STE100 register, and the `GLOSSARY-MAP.md` pointer are upstream's. What is adapted is two appended sections: `## Invocation` names the command and states that it takes no argument, and `## Pi execution and authorization` states that the two glossary files resolve against the project under review rather than this checkout or the installed package clone, gives the fallback where the map or the glossary is absent, and states that a re-pitch authorizes no edit, branch, commit, push, or tracker write. It is **Validated** in the README's maturity categories under a stated scope: one re-pitch run on 2026-10-28 in `~/projects/wayfinder-test`, started as a fresh session in that project and fired by typing `/skill:wait-what` with no argument, re-pitched a real answer about `linecount.py` into short active sentences in the ASD-STE100 register, carried all eleven terms of that project's own `GLOSSARY.md` and none of the words its `_Avoid_` lines rule out for them, and named that the glossary it read belongs to the project under review and that no `GLOSSARY-MAP.md` means one context. Excluded from the claim: the branch where a project has no `GLOSSARY.md`, the branch where a `GLOSSARY-MAP.md` points at more than one glossary and the tie-break that asks which one, since no project here carries a map, and the refusal branch of the authorization boundary, which the run stated rather than tested. The scope is stated in full in [the README](../../README.md). The shared runtime contract, including the maturity categories, is in [the README](../../README.md).

## What it does

You type `wait-what` when you did not understand a message. The [agent](https://www.aihero.dev/ai-coding-dictionary/agent) then re-pitches what it just said. It adds the context you were missing, writes in plain English, and uses the vocabulary from your project's `GLOSSARY.md`.

The skill is three lines long. That is the design, not an unfinished draft. Skills against verbosity usually fail because they grow too long. A four-hundred-line concision skill still leaves the [model](https://www.aihero.dev/ai-coding-dictionary/model) verbose, because the model copies the length of the skill, not its request. This one has a single precise leading word and nothing else.

## When to reach for it

Type `/skill:wait-what` in Pi (upstream harnesses type `/wait-what`); the agent won't reach for it on its own, and it shouldn't. Only you know when you stopped following.

Use it as soon as you notice you're skimming. For example, the agent has started to use jargon it invented, put five acronyms in one sentence, or explained a decision whose premise you never saw. It fixes the conversation you're already in. To stop the jargon arriving at all, use [grill-with-docs](https://aihero.dev/skills-grill-with-docs), which builds the shared language upfront.

## The name is the mechanism

The leading word is **wait**. "Be concise" is an instruction about the agent's output, and the model obeys it by clipping words and losing you further. **Wait** is about *your* state. It says you stopped understanding here. An agent that hears "be brief" writes clipped fragments. An agent that hears "wait, you lost me" backs up and explains.

That difference is the whole skill. Every popular fix for verbosity names the *output*: `/tldr`, `/no-fluff`, `/talk-normal`. The model over-corrects into clipped fragments that are shorter and no clearer. Naming the *listener* asks for both halves at once: fewer words **and** the context you were missing.

The skill says re-pitch **that**, not "that last message". What lost you is usually bigger than one paragraph, so the agent decides how far back to go.

## It plugs into the language you already have

The body reuses the leading words already in your global `CLAUDE.md` and your project's `GLOSSARY.md`. ASD-STE100 Simplified Technical English sets the register. The ubiquitous language supplies the nouns. The skill, `CLAUDE.md` and `GLOSSARY.md` use the same [tokens](https://www.aihero.dev/ai-coding-dictionary/token), so invoking it is not a new instruction. It is a reminder of one the agent already agreed to.

If you have no `GLOSSARY.md` (and no `GLOSSARY-MAP.md` pointing to one for the context at hand), the skill still works. You lose only the domain-vocabulary half.

## Common questions

**Will it just make the agent shorter?** No, and that is the trap the skill is built against. Every popular verbosity fix names the *output* (`/tldr`, `/no-fluff`, `/talk-normal`), and the model over-corrects into clipped fragments that are shorter and no clearer. This one names your state, so the agent backs up and explains. A re-pitch that comes out shorter and blunter is the skill failing, not working.

**The agent never reaches for it. Is that broken?** No. It is user-invoked on purpose: only you know when you stopped following, and a model that guessed which message failed would be re-explaining the wrong thing. In Pi it is absent from the agent's skill list, so nothing but you can fire it, by typing `/skill:wait-what`. Upstream harnesses report the same invisibility through their own skill lists, and it is intended behaviour there too.

**I read a whole ticket, and none of it landed. Does one re-pitch fix that?** It repairs one message after the fact, so one re-pitch covers the thing you just read. If a whole skill's output reads in a way you cannot follow, the fix sits upstream of this skill, in how that skill phrases its own text. The recurring report is that the agent writes text it finds clear and you do not; the cure is shared language agreed before the writing, which is [grill-with-docs](https://aihero.dev/skills-grill-with-docs).

**My repo has more than one glossary.** Then it carries a `GLOSSARY-MAP.md` at the root, and the body follows it to the context the conversation is actually in. Where the map does not make that context obvious, the skill asks which one before re-pitching rather than picking one silently, since a re-pitch in the wrong vocabulary reads as a confident wrong answer. Not every skill in this set carries the map phrase; some read only the root `GLOSSARY.md`. This one does.

**Where did `CONTEXT.md` go?** Renamed, upstream and here alike. The domain-doc convention moved from `CONTEXT.md` and `CONTEXT-MAP.md` to `GLOSSARY.md` and `GLOSSARY-MAP.md` across the skills that read and write it, so this skill reads the `GLOSSARY` names. A repo still carrying the legacy names is offered a `git mv` to the current ones by [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills).

## It's working if

- The re-pitch is **shorter and clearer**, not shorter and blunter.
- It adds the premise you were missing, instead of only deleting words.
- Project nouns replace invented ones. The terms in your `GLOSSARY.md` come back.
- You can use it twice in a row, and it does not degrade into terseness.

## Where it fits

You can use `wait-what` at any point, in any conversation, inside any other skill. It repairs one message after the fact. The real fix is a shared language agreed upfront, and that is [grill-with-docs](https://aihero.dev/skills-grill-with-docs): a [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling) session that runs [domain-modeling](https://aihero.dev/skills-domain-modeling) as it goes, so it records the words you both use in your `GLOSSARY.md`. If you're unsure which skill fits the moment, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
