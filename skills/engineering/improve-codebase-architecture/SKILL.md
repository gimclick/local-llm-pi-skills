---
name: improve-codebase-architecture
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
disable-model-invocation: true
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities**: refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

This command is _informed_ by the project's domain model and built on a shared design vocabulary:

- Call the Skill tool with "codebase-design" for the architecture vocabulary (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**) and its principles (the deletion test, "the interface is the test surface", "one adapter = hypothetical seam, two = real"). Use these terms exactly in every suggestion, and don't drift into "component," "service," "API," or "boundary."
- The domain language in `GLOSSARY.md` gives names to good seams; ADRs in `docs/adr/` record decisions this command should not re-litigate.

## Pi execution and authorization

This fork runs one live model request at a time, and Pi has no Skill tool. Where this skill says to call the Skill tool or to spawn a sub-agent, the rules below replace that instruction. Every other step, and every report requirement, is upstream's.

- **Load a named skill through Pi's registry, not through a path.** The four `Call the Skill tool with "…"` sites name model-invoked skills: `codebase-design` (the vocabulary bullet and the design-it-twice bullet), `grilling`, and `domain-modeling`. Check the name in the agent's `<available_skills>` block, then read that skill's `SKILL.md` at the path Pi advertises there and follow the methodology that loaded file carries. Never resolve a skill name against the project under review, and never against a path in this repository: the code being surveyed is usually not this checkout. A name that is not registered is a missing dependency: name the step that cannot proceed, keep the work that does not need it, and report the gap rather than improvising the missing methodology or claiming to have followed it.
- **Explore in the foreground.** Where this skill says to spawn a sub-agent to walk the codebase, walk it in this session. No automatic delegation, and never two live model requests. A foreground walk is not an independent-context analysis and must not be presented as one. A single delegated explorer is optional, only when the human authorizes it for this run and its effective permissions are read-only for this purpose; check which agents exist with `subagent({ action: "list" })` rather than assuming one.
- **Design It Twice stays in `codebase-design`.** The design-it-twice bullet runs that skill's own `DESIGN-IT-TWICE.md`, which already carries this fork's sequential fallback and states its independence limit. Do not recreate that pattern here.
- **The bundled template is skill-relative.** `HTML-REPORT.md` lives beside this `SKILL.md`. Resolve it against the directory holding the loaded skill, never the working directory of the project under review.
- **The report is the only expected artifact.** Write it to the OS temp directory as Phase 2 says, and give the human the absolute path. Where no browser can be launched, say so: inspect the file statically (it exists, and the cards, badges and top recommendation are present), give the human the command to open it on their own machine, and keep structural inspection separate from rendered inspection. Never claim to have seen the page rendered.
- **Persistent writes need the human.** `GLOSSARY.md` and ADR files are tracked project files. Before the first one, state the write set: each file, and which decision each change serves. Wait for the answer. One approval covers the whole set, and no approval means stop at the findings and hand them over. The temp report needs no such gate.
- **A candidate authorizes nothing.** A deepening opportunity is a recommendation, not a licence to refactor, to design an interface, to create a branch, to commit, to push, or to open a pull request. That work is separately authorized, in a later session.
- **Keep the upstream stop.** After the report, ask which candidate the human wants to explore. Do not start the grilling loop, propose interfaces, or grill an idea before the report is written and the human has chosen; weaker models are reported to skip straight to the interview.

## Process

### 1. Explore

**Scope before you scan: YAGNI.** Deepening a module pays off by making future changes to it easier, so put extra weight on the parts of the codebase that have recently changed. Decide *where* to look before you look:

- If the user named a direction (a module, a subsystem, a pain point), take it, and skip the inference below.
- Otherwise, walk back a good stretch of the commit history (`git log --oneline`) to find the codebase's hot spots, the files and areas that keep coming up, and let those paths pull your attention first. If the changes are scattered with no clear hot spot, widen the net.

Read the project's domain glossary (`GLOSSARY.md`) and any ADRs in the area you're touching first.

Then spawn a sub-agent to walk the codebase. Don't follow rigid heuristics; explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow**, with an interface nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts of the codebase are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.

### 2. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/architecture-review-<timestamp>.html` so each run gets a fresh file. Open it for the user (`xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows) and tell them the absolute path.

The report uses **Tailwind via CDN** for layout and styling, and **Mermaid via CDN** for diagrams where a graph/flow/sequence reliably communicates the structure. Mix Mermaid with hand-crafted CSS/SVG visuals: use Mermaid when relationships are graph-shaped (call graphs, dependencies, sequences), and hand-built divs/SVG when you want something more editorial (mass diagrams, cross-sections, collapse animations). Each candidate gets a **before/after visualisation**. Be visual.

For each candidate, render a card with:

- **Files**: which files/modules are involved
- **Problem**: why the current architecture is causing friction
- **Solution**: plain English description of what would change
- **Benefits**: explained in terms of locality and leverage, and how tests would improve
- **Before / After diagram**: side-by-side, custom-drawn, illustrating the shallowness and the deepening
- **Recommendation strength**: one of `Strong`, `Worth exploring`, `Speculative`, rendered as a badge

End the report with a **Top recommendation** section: which candidate you'd tackle first and why.

**Use GLOSSARY.md vocabulary for the domain, and the `/codebase-design` vocabulary for the architecture.** If `GLOSSARY.md` defines "Order," talk about "the Order intake module," not "the FooBarHandler," and not "the Order service."

**ADR conflicts**: if a candidate contradicts an existing ADR, only surface it when the friction is real enough to warrant revisiting the ADR. Mark it clearly in the card (e.g. a warning callout: _"contradicts ADR-0007, but worth reopening because…"_). Don't list every theoretical refactor an ADR forbids.

See [HTML-REPORT.md](HTML-REPORT.md) for the full HTML scaffold, diagram patterns, and styling guidance.

Do NOT propose interfaces yet. After the file is written, ask the user: "Which of these would you like to explore?"

### 3. Grilling loop

Once the user picks a candidate, call the Skill tool with "grilling" to walk the decision tree with them: constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

Side effects happen inline as decisions crystallize; call the Skill tool with "domain-modeling" to keep the domain model current as you go:

- **Naming a deepened module after a concept not in `GLOSSARY.md`?** Add the term to `GLOSSARY.md`. Create the file lazily if it doesn't exist.
- **Sharpening a fuzzy term during the conversation?** Update `GLOSSARY.md` right there.
- **User rejects the candidate with a load-bearing reason?** Offer an ADR, framed as: _"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ Only offer when the reason would actually be needed by a future explorer to avoid re-suggesting the same thing; skip ephemeral reasons ("not worth it right now") and self-evident ones.
- **Want to explore alternative interfaces for the deepened module?** Call the Skill tool with "codebase-design" and use its design-it-twice parallel sub-agent pattern.
