---
name: research
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork done by a single foreground subagent.
---

Run the research **in the foreground, one at a time**: the session waits for it and never carries on working behind it. Never background it, never fan it out across children, and never start the next until the previous one has returned.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Report the findings as a single Markdown file, citing each claim's source.
3. Save it where the repo already keeps such notes; match the existing convention, and if there is none, put it somewhere sensible and say where.

## Who does the reading

- **You are already a subagent** (you have no `subagent` tool, or you were launched to do this one task): do the research yourself, in this run. Do not delegate it again. A nested research agent re-reads the same sources, doubles the cost, and finishes somewhere nobody is watching.
- **You are the parent and a `researcher` agent is configured**: hand it the question once, in the foreground (`subagent({ agent: "researcher", task: ..., async: false })`), and wait for it to return before anything else launches. It carries its own research brief and its own web tools, so it loads no skill and needs none handed to it.
- **You are the parent and no such agent is configured**: do the research yourself in this session with whatever web tools you have. The job above is what binds, not the delegation.

## Who writes the file

The parent owns everything durable: the findings file, any commit, any issue. A delegated researcher only gathers: it receives the question and what the answer is waiting on, and returns a cited brief. The parent writes that brief into the Markdown file, where the repo keeps such notes, and says where it put it. Researching directly, you are both, so write the file as you go.

Either way the artifact is the same: one Markdown file, every claim linked to the source that owns it. A brief with no citations, or one that leaves the question unanswered, is not done: record the contradictions and the missing evidence in it rather than smoothing them over.
