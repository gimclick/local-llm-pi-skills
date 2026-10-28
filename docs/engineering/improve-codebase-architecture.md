> **This fork (Pi adaptation):** `improve-codebase-architecture` is user-invoked and **registered in this fork's Pi manifest** as the nineteenth skill, so Pi keeps it out of the agent's `<available_skills>` block and only the human can fire it, by typing `/skill:improve-codebase-architecture` with an optional module, subsystem or pain point after it (upstream harnesses type `/improve-codebase-architecture`). Its frontmatter keeps `disable-model-invocation: true` and its `agents/openai.yaml` keeps `policy.allow_implicit_invocation: false`, the pairing this fork's registration check reads as user-invoked. `HTML-REPORT.md` and `agents/openai.yaml` are byte-identical to upstream, so the report scaffold, the diagram patterns, the Mermaid and Tailwind CDN setup, the badge colours, the dependency-category tags, the card fields and the exact-vocabulary rule are upstream's, and the unmerged upstream Mermaid edge-label change is not folded in. The three phases are upstream's: scope before scanning, read the project glossary and the ADRs in the touched area, explore for friction and run the deletion test, present the candidates as one self-contained HTML report in the OS temp directory, then stop and ask which candidate to explore. One section is appended to `SKILL.md`, `## Pi execution and authorization`, and it replaces only the harness-specific instructions: Pi has no Skill tool, so the four `Call the Skill tool with "…"` sites (`codebase-design` twice, `grilling`, `domain-modeling`) load by checking the name in the agent's `<available_skills>` block and reading its `SKILL.md` at the path Pi advertises there, never a path in the project under review, and a name that is not registered is reported as a missing dependency with the step it blocks rather than improvised. Exploration runs in the foreground session, with no automatic delegation, never two live model requests, and no claim that a foreground walk carries the independence a separate context would give; a single delegated explorer is optional and only on the human's authorization for that run, after its effective permissions are checked. `DESIGN-IT-TWICE.md` is not duplicated here, since the design-it-twice bullet runs `codebase-design`'s own already-adapted sequential fallback. The bundled `HTML-REPORT.md` resolves against the directory holding the loaded `SKILL.md`. Where no browser can be launched the report is still written and inspected statically, the absolute path and the human's own open command are given, and structural inspection is kept separate from rendered inspection. Persistent writes are gated: the temp report needs no approval, while `GLOSSARY.md` and ADR files are tracked project files whose write set is stated per decision and held for one human approval, and a candidate authorizes no refactor, interface, branch, commit, push or pull request. It is **Validated** in the README's maturity categories under a stated scope. Two fresh Pi sessions on 2026-10-28 each fired the installed skill with `/skill:improve-codebase-architecture` and completed a survey end to end. Run 1 ran in `~/projects/wayfinder-test` at `6ed279f`, a project that carries no skill file anywhere in its tree, and every path that run resolved sat in the installed package clone: the dependency loads, the fired target, and `HTML-REPORT.md` beside it. That run's honest result was two `Speculative` cards and a top recommendation that nothing was worth tackling, which is the expected outcome for a one-module project. Run 2 ran in this repository at `b43044c` against `scripts/` and produced four cards, one `Strong`, two `Worth exploring`, one `Speculative`, a top recommendation, and one observed fork defect it found by reading: `skills/in-progress/chief-of-staff/SKILL.md` carries no row in its bucket README. What the scope does not cover, and no claim is made for it: the `grilling` and `domain-modeling` load sites in the appended section were never entered, so two of the four sites are closed by runtime and two by statics only; no rendered inspection occurred in either run, both inspected the report structurally; automatic model-invoked discovery does not apply to this skill at all, since its frontmatter keeps it user-invoked and only the human can fire it; the figure "seven entry points over 69 lines" in Run 2's second candidate did not reproduce and is not repeated here; upstream body identity is step 7's parity evidence, not a runtime claim; and the context cost figures are byte measurements with an arithmetic estimate, not a measured window count. The shared runtime contract, including the maturity categories, is in [the README](../../README.md).

## What it does

`improve-codebase-architecture` surveys a codebase for **deepening opportunities**. These are places where a shallow module (an interface nearly as complex as the thing it hides) could become a deep one. It writes them up as a self-contained HTML report, and then [grills](https://www.aihero.dev/ai-coding-dictionary/grilling) you through the one you pick.

It never changes the code. The whole run produces a conversation and one HTML file in your OS temp directory. You do the refactor later, in a separate [session](https://www.aihero.dev/ai-coding-dictionary/session), through the normal build flow. This makes it a survey, not a refactoring tool, so you can run it on a codebase you are not ready to touch yet.

Two filters stop the report from becoming generic cleanup advice. First, every candidate must pass the **deletion test**: if you removed this module, would its complexity move behind a smaller interface, or spread across the callers? Only the first case gets a card. Second, unless you point it at a specific area, it reads recent commit history first and focuses the scan on paths that change often. A deepening in code that nobody touches is a refactor that never pays back.

## When to reach for it

Type `/skill:improve-codebase-architecture` in Pi (upstream harnesses type `/improve-codebase-architecture`); the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) will not reach for it on its own.

It is not a step in the main build loop. You run it periodically to queue up more work that improves the codebase. People use it in four situations:

| Situation | How it is used |
| --- | --- |
| Routine upkeep | Run it every few days, or when you have a spare moment, so the structure does not decay between features. |
| Before a big build | Point it at the [spec](https://www.aihero.dev/ai-coding-dictionary/spec) and ask "how can we make this change easy?" This is the most effective prompt for it. |
| Brownfield audit | Run it on a large, unstructured or [vibe-coded](https://www.aihero.dev/ai-coding-dictionary/vibe-coding) repo to find out what shape it is in. |
| Legacy test work | Use it to find the missing seams before you write tests against untestable code. |

Where it is confusable with siblings:

- To design one module you have already chosen, use [codebase-design](https://aihero.dev/skills-codebase-design). This skill finds the module to work on, and `codebase-design` is where you design it.
- For a whole effort too big to hold in one session, use [wayfinder](https://aihero.dev/skills-wayfinder).
- For "this specific thing is broken," use [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs). It sends you back here when the real finding is that there is no good seam to lock the bug down.

## Prerequisites

None to run it. If `GLOSSARY.md` or ADRs in `docs/adr/` exist, it reads them and uses your domain's own nouns. A candidate then reads as "deepen the Order intake module," not "refactor the FooBarHandler."

It writes in two places. The report goes to `<tmpdir>/architecture-review-<timestamp>.html`, outside the repo. During the grilling loop it adds or sharpens terms in `GLOSSARY.md`, and creates that file if it does not exist. It also offers to record a rejected candidate as an ADR, so a future run does not suggest it again. In this fork the two project files are gated: the skill names the write set, one file per decision each change serves, and waits for the human's approval before the first edit, so a run that gets no approval stops at the findings and leaves the repository untouched. The temp report needs no such gate.

## Depth, and the report that hunts for it

The skill rests on one idea: **depth**. A deep module puts a lot of behaviour behind a small, stable interface. A shallow module exposes its implementation through an interface nearly as wide as the code beneath it. The report looks for three forms of shallowness:

- Pure functions extracted only for testability, while the real bugs are in how callers use them (no **locality**).
- Modules that leak across their **seams**.
- A concept you cannot understand without opening five files.

For each one, it proposes the deepening that fixes it.

Each candidate is a card with the files involved, the friction, a plain-English solution, the benefit in terms of **locality** and **leverage**, a before/after diagram, and a strength badge.

| Badge | What it means for you |
| --- | --- |
| `Strong` | The deletion test passes clearly and the friction is real. Take these seriously. |
| `Worth exploring` | Plausible deepening, but the payoff depends on where the code is going next. |
| `Speculative` | Included for completeness. You can ignore most of these. |

The report ends with a **Top recommendation**, the candidate it would do first. Then the skill stops and asks which candidate you want to explore. At that point you have decided nothing, and no code has changed.

## What happens after you pick one

When you pick a candidate, a [grilling](https://aihero.dev/skills-grilling) session starts on it. It covers the constraints, what goes behind the seam, which tests survive, and what the deepened interface should look like. The output of that session is a decision, not a diff. From there the normal flow applies: take the decision into [to-spec](https://aihero.dev/skills-to-spec), then [to-tickets](https://aihero.dev/skills-to-tickets), then [implement](https://aihero.dev/skills-implement).

## Common questions

**It grilled me for an hour about one idea instead of showing me options. Can I turn that off?**

Yes. Say so when you invoke it ("don't grill me, just show the report"). This is the most common complaint about the skill. One user liked it as "a convenient way to get a thorough analysis of improvements," but after the grilling loop was added, found it "borderline unusable." In their sessions it proposed a single solution and then asked "10's or 100's of questions." The design intent is that the report comes first, and the grilling starts only on a candidate you chose. But weaker [models](https://www.aihero.dev/ai-coding-dictionary/model) skip straight to an interview about the first idea they had. Results in that thread vary a lot by model. It is an open issue, and the skill does not yet have a documented no-grill mode.

**The report opened as unstyled raw HTML with no diagrams. What happened?**

The report loads Tailwind and Mermaid from CDNs, so it needs network access when you open it. If something blocks those scripts, the page breaks with no error. In the reported case, a security hook required SRI hashes. The agent added them, but the CDN served different bytes to the browser than to the `curl` that computed the hash, so the browser blocked the script. Offline and locked-down environments have the same problem. The agent cannot see it, because it never renders the page. As a workaround, ask for inline CSS and hand-built SVG diagrams instead of the CDN setup. This is an open issue. In Pi the same limitation shows up twice, and the adapted skill says so rather than working around it: the agent never renders the page, and a headless session has no browser to open it, so the run writes the file, inspects it statically (the file exists, and the cards, badges and top recommendation are present), hands over the absolute path and the command the human would run on their own machine, and keeps structural inspection separate from rendered inspection.

**It gave me twelve candidates. Do I work through them in the same session or start a new one?**

Use one candidate per session. If you work through several in one conversation, the [context window](https://www.aihero.dev/ai-coding-dictionary/context-window) fills with the report, the grilling, the domain-model edits and the code changes all at once. The report is only a temp file, so carry the candidate forward, not the file. Pick one, grill it, and take the decision into `/to-spec`. Turn the rest into [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket) that you can pick up separately later. Put the chosen improvement into a spec instead of going straight to implementation. People ask this often, and the skill itself documents no workflow for it.

**How should I prompt it?**

Prompt it with the next thing you are building. If a big build is coming up, point it at the spec and ask "how can we make this change easy?" A run with no prompt looks for hot spots on its own. That is fine for routine upkeep, but a direction makes the report actionable.

**Does it work on a large legacy codebase?**

Partly. It works well on big existing codebases that lack consistent structure, and it is the recommended upkeep tool after any one-time structural setup. But users with out-of-control projects report it "helped a little but still doesn't seem to cut it." One developer with an eight-year-old legacy codebase reported that the model went in circles, though the same skill produces a clean graph on a tidy repo. There is no dedicated `/refactor` skill for that case yet. If the codebase has no shared vocabulary, run [grill-with-docs](https://aihero.dev/skills-grill-with-docs) first to create one. That usually makes this skill's output much better.

**How is this different from `/codebase-design`?**

`/codebase-design` is a reference, not a session driver. It supplies the vocabulary (module, interface, depth, seam, adapter, leverage, locality), and this skill uses it. If you give a fresh agent `/codebase-design` as the task, it fails in a known way. It has no process of its own to follow, so the agent invents one, explores the code again, and runs for a very long time before it asks you anything. Run this skill, and let it use that one.

**Will it ever tell me the codebase is fine?**

Rarely, so know that before you start. The skill exists to output findings, so it tends to produce candidates instead of concluding that nothing is wrong. Use the strength badges to correct for this. If every candidate in a report is `Speculative`, the skill found nothing.

**Does it work in Codex or another harness?**

Partly. Upstream's text now asks for a sub-agent in harness-neutral terms, so a harness with its own exploration mechanism can use it, and this fork's Pi adaptation runs the same walk in the foreground session instead, since one model request is live at a time. Nothing is delegated on its own, and a foreground walk is named as a foreground walk rather than presented as the independent-context scan a separate agent would give. The scan is one context rather than a separate one; the scope rules, the friction questions, the deletion test and the report contract are the same either way.

**How do I actually implement deep modules in TypeScript?**

The skill does not ship a good answer. People often ask for a `TYPESCRIPT.md` with concrete file and module layouts for the principles, and it does not exist. The skill tells you where a deepening belongs and what goes behind the seam. You must turn that into a package or directory structure yourself.

## It's working if

- The candidates name your domain's concepts, not invented class names: "the Order intake module," not "the FooBarHandler."
- The candidates are in files you edited recently, not in parts of the repo nobody touches.
- No code changed during the run. The only new file is the HTML report in your temp directory.
- It stops after the report and asks which candidate you want. It does not continue on its own.
- Each card explains the payoff as locality or leverage, and says which tests get simpler, not just "this is cleaner."
- When you reject a candidate for a lasting reason, it offers to record an ADR, so the next run does not suggest it again.

## Where it fits

`improve-codebase-architecture` is **periodic maintenance**. You run it every few days, outside any chain, to queue up work, not to do it. Its neighbours:

- [codebase-design](https://aihero.dev/skills-codebase-design) owns the depth-and-seam vocabulary that every candidate uses.
- [grilling](https://aihero.dev/skills-grilling) walks the decision tree after you choose a candidate.
- [domain-modeling](https://aihero.dev/skills-domain-modeling) keeps `GLOSSARY.md` and the ADRs current as you make the decision.

Its output is an idea, which goes back into the main build flow at [grill-with-docs](https://aihero.dev/skills-grill-with-docs) or [to-spec](https://aihero.dev/skills-to-spec). Its counterpart at the end of the main flow is [retro](https://aihero.dev/skills-retro). This skill improves the code the agent works in, and `retro` improves the environment around it (checks, standards, steering files) after a build. For which skill fits a situation, [ask-matt](https://aihero.dev/skills-ask-matt) is the router over the whole set.
