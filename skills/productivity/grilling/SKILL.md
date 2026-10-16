---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Word each question so "yes" accepts your recommended answer.

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), find it yourself: use the tools you already have when the lookup is small, and hand the question to the configured `researcher` subagent when it needs specialist reading (`subagent({ agent: "researcher", task: ..., async: false })`). Don't ask the user for anything you could look up yourself. Research runs **in the foreground, one at a time**: this setup produces one inference at a time, so nothing is exploring behind the interview. Wait for a run to return before the interview continues, start the next only once the previous one has returned, never run two subagents side by side, and never delegate again from inside a subagent. A fact you have not settled is an unsettled prerequisite, so the questions downstream of it wait for it and belong to a later round; ask the rest of the frontier in full. If the research cannot finish in this session, leave the question unsettled and record it as an open prerequisite rather than assuming an answer. The _decisions_ are the user's: put each to them and wait, and never answer a question that needs their preference, judgement, or tradeoff on their behalf.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.
