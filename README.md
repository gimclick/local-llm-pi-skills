<p>
  <a href="https://www.aihero.dev/s/skills-newsletter">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://res.cloudinary.com/total-typescript/image/upload/v1777382277/skills-repo-dark_2x.png">
      <source media="(prefers-color-scheme: light)" srcset="https://res.cloudinary.com/total-typescript/image/upload/v1777382277/skill-repo-light_2x.png">
      <img alt="Skills" src="https://res.cloudinary.com/total-typescript/image/upload/v1777382277/skill-repo-light_2x.png" width="369">
    </picture>
  </a>
</p>

# Skills For Real Engineers

[![skills.sh](https://skills.sh/b/mattpocock/skills)](https://skills.sh/mattpocock/skills)

> ## About this fork — read before using
>
> **This is an unofficial fork.** Everything below documents the original
> [mattpocock/skills](https://github.com/mattpocock/skills) repository by Matt Pocock
> (AI Hero). This fork is not published, maintained, or endorsed by Matt Pocock or AI Hero.
> Upstream authorship and the MIT license are preserved unchanged (see [LICENSE](./LICENSE)).
>
> **Purpose:** a Pi-compatible adaptation of those skills for **local LLMs** and
> **constrained inference** — small context windows, tight tool budgets, quantised models.
> The intended audience is developers running Pi coding agents on their own hardware.
>
> **Goals of the adaptation:**
>
> - **Sequential, foreground delegation** — subagents run one at a time in the foreground,
>   rather than parallel or background fan-out.
> - **Reduced context waste** — fewer duplicated instructions and less tool output per turn.
> - **Resumable multi-session development** — work spread across independent Pi sessions,
>   with a reviewable baseline kept in Git.
>
> **Dependencies:** Hound and `pi-subagents` are **separate, optional dependencies**.
> They are not vendored, forked, or bundled in this repository. Install them yourself if you want them.
>
> **Runtime requirements (what the adapted skills assume):**
>
> - **Foreground subagents.** A delegated run is started and waited for; nothing is backgrounded.
> - **Sequential execution.** One inference slot at a time: at most one subagent runs, and the next
>   launches only once the previous one has returned. No fan-out across children.
> - **An optional `researcher` subagent** (provided by `pi-subagents`, Hound-backed). Where it is not
>   configured, the parent does the reading itself with whatever web tools it has — the job binds,
>   not the delegation.
> - **Pi skill invocation.** Pi has no Skill tool. A model-invoked skill is loaded by reading its
>   `SKILL.md`, advertised by name, description and path in the agent's `<available_skills>` block.
>   A user-invoked skill (`disable-model-invocation: true` in frontmatter) is absent from that block,
>   so no agent can load it: only the human can, by typing `/skill:<name>`.
> - **Skill availability is checked, not assumed.** A skill another skill routes to may not be loaded
>   in this run, so the routing skill asks Pi for its resolved skill list and reports a missing skill
>   rather than improvising the methodology that skill carries.
>
> **Maturity status.** Every skill in this repo sits in one of three Pi categories:
>
> - **Not Implemented**: an upstream skill that has not yet been adapted and registered for Pi.
> - **Implemented**: a skill adapted and registered for Pi, but not yet exercised in a representative runtime workflow.
> - **Validated**: a skill adapted and registered for Pi that has been exercised successfully in at least one representative runtime workflow.
>
> Validated does not mean exhaustively tested, free of bugs, or that every optional path has been exercised. The category of each of the twenty-two Pi skills is shown in the [Pi skill status and invocation table](#pi-skill-status) under Installation; every skill in this checkout that is not in `package.json` → `pi.skills` is **Not Implemented** for Pi.
>
> **Known limitation:** only the GitHub issue-tracker backend has been exercised here. GitLab, local markdown, and any other tracker follow upstream behaviour until exercised.
>
> **Upstream policy:** changes to `mattpocock/skills` are reviewed before being merged in.
> Upstream history is never rewritten; our changes sit on top as separate commits.
> Upstream baseline at the time of this fork: [`49dd158d1076134a641b33efb035946536778336`](https://github.com/mattpocock/skills/commit/49dd158d1076134a641b33efb035946536778336).

---

My agent skills that I use every day to do real engineering - not vibe coding.

Developing real applications is hard. Approaches like GSD, BMAD, and Spec-Kit try to help by owning the process. But while doing so, they take away your control and make bugs in the process hard to resolve.

These skills are designed to be small, easy to adapt, and composable. They work with any model. They're based on decades of engineering experience. Hack around with them. Make them your own. Enjoy.

If you want to keep up with changes to these skills, and any new ones I create, you can join ~60,000 other devs on my newsletter:

[Sign Up To The Newsletter](https://www.aihero.dev/s/skills-newsletter)

## Installation (30-second setup)

A plugin updates itself. [skills.sh](https://skills.sh/mattpocock/skills) copies editable files into your project, and you update them by hand. Pick one per agent, because installing both gives you every skill twice.

### 1. Get the skills

<details>
<summary><strong>Claude Code</strong></summary>

```bash
claude plugin install mattpocock-skills@claude-plugins-official
```

Updates itself by default.

</details>

<details>
<summary><strong>Codex</strong></summary>

```bash
codex plugin marketplace add mattpocock/skills
codex plugin add mattpocock-skills@mattpocock
```

Updates itself at startup.

</details>

<details>
<summary><strong>GitHub Copilot</strong> (CLI and VS Code)</summary>

```bash
copilot plugin marketplace add mattpocock/skills
copilot plugin install mattpocock-skills@mattpocock
```

Then, once, add to `~/.copilot/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "mattpocock": { "source": { "source": "github", "repo": "mattpocock/skills" }, "autoUpdate": true }
  }
}
```

In VS Code, run **Chat: Install Plugin From Source** and enter `https://github.com/mattpocock/skills`. It updates daily.

</details>

<details>
<summary><strong>Gemini CLI</strong> (manual updates)</summary>

```bash
gemini skills install https://github.com/mattpocock/skills.git --path skills/engineering
gemini skills install https://github.com/mattpocock/skills.git --path skills/productivity
```

Re-run both commands to update.

</details>

<details>
<summary><strong>Pi</strong> (manual updates)</summary>

```bash
pi install git:github.com/gimclick/local-llm-pi-skills
```

Refresh with `pi update git:github.com/gimclick/local-llm-pi-skills`. Pi loads only the skills `package.json` → `pi.skills` names, so `misc/` and `in-progress/` are not loaded. Do not also run `npx skills add mattpocock/skills -a pi`: two surfaces carrying the same skill name print a `[Skill conflicts]` block at startup, and Pi keeps the first skill it discovers and skips the rest.

</details>

<details>
<summary><strong>Any other agent, or editable files</strong> (manual updates)</summary>

```bash
npx skills@latest add mattpocock/skills -a <agent>  # cursor, opencode, devin, windsurf, amp; omit -a to choose
```

When the installer asks which skills to take, include `setup-matt-pocock-skills`. To update, run `npx skills@latest update`, and re-run `add` to pick up new skills.

</details>

<a id="pi-skill-status"></a>

<details open>
<summary><strong>Pi</strong> (this fork's target)</summary>

Pi discovers skills by scanning its configured skill directories for folders that contain `SKILL.md`; it advertises each one's name, description and path, and loads the full instructions only when a task calls for them. Force a load with `/skill:<name>`.

This fork's Pi route is the package install above: `pi install git:github.com/gimclick/local-llm-pi-skills`, refreshed with `pi update git:github.com/gimclick/local-llm-pi-skills`. The clone carries the whole tree, including `misc/` and `in-progress/`, but only the names `pi.skills` declares are loaded.

This fork carries a `pi.skills` manifest in `package.json` that selects the twenty-two skills this fork loads: the adapted Wayfinder flow, the ticket step that cuts a build from the spec that flow produces, the build step that works one ticket of that spec in a fresh session, the red → green reference that build runs against, the two-axis review that checks what the build produced, the shape of the body that publishes what the build produced, the on-ramp for issue work that arrives from outside, the document that carries work in flight to a session somewhere else, the reference for writing the documents every one of them reads, the retrospective that improves the environment those skills run in, the deep-module vocabulary the design questions speak in, the diagnosis discipline for a defect whose symptom you can name, and the survey that finds the deepening candidates those design questions then work on, and the one-session interview that sharpens a plan or design while writing its glossary and ADRs into the repo as it goes, and the one-line corrective that re-pitches the message that did not land, in the register and the vocabulary you were missing, and the interview that turns a decision you cannot answer alone into a questionnaire for the one person who holds what you are missing. Each row also carries the skill's Pi status (see **Maturity status** above): the twelve skills in the planning-to-implementation pipeline and the pull-request body that publishes its output are **Validated**, as are `writing-for-agents`, `retro`, `handoff`, `diagnosing-bugs`, `codebase-design`, and `improve-codebase-architecture` each under the scope stated below, so twenty-one of the twenty-two are **Validated** and only `triage` sits in **Implemented** until a representative run of it has been exercised here.

| Skill | Invocation in Pi | Pi status |
| --- | --- | --- |
| `setup-matt-pocock-skills` | user-invoked (`disable-model-invocation: true`) — type `/skill:setup-matt-pocock-skills` | Validated |
| `wayfinder` | user-invoked — type `/skill:wayfinder` | Validated |
| `to-spec` | user-invoked, type `/skill:to-spec`, with an optional map reference after it | Validated |
| `grilling` | model-invoked — reached for when the task fits, or forced with `/skill:grilling` | Validated |
| `domain-modeling` | model-invoked | Validated |
| `research` | model-invoked | Validated |
| `prototype` | model-invoked | Validated (see qualification below) |
| `tdd` | model-invoked | Validated |
| `code-review` | model-invoked | Validated |
| `to-tickets` | user-invoked, type `/skill:to-tickets`, with an optional spec file path or issue reference after it | Validated |
| `implement` | user-invoked, type `/skill:implement`, with an optional issue reference or spec file path after it | Validated |
| `pr` | model-invoked, reached for when the task fits, or forced with `/skill:pr` | Validated |
| `triage` | user-invoked, type `/skill:triage`, with the issue or PR to work on described in natural language after it | Implemented |
| `writing-for-agents` | model-invoked, reached for when the task fits, or forced with `/skill:writing-for-agents` | Validated (see qualification below) |
| `retro` | user-invoked, type `/skill:retro`, with the session to look back on named after it (the current one by default, or a path or a session ID) | Validated (see qualification below) |
| `handoff` | user-invoked, type `/skill:handoff`, with what the next session will be used for after it | Validated (see qualification below) |
| `diagnosing-bugs` | model-invoked, reached for when the task fits, or forced with `/skill:diagnosing-bugs` | Validated (see qualification below) |
| `codebase-design` | model-invoked, reached for when the task fits, or forced with `/skill:codebase-design` | Validated (see qualification below) |
| `improve-codebase-architecture` | user-invoked, type `/skill:improve-codebase-architecture`, with an optional module, subsystem or pain point after it | Validated (see qualification below) |
| `grill-with-docs` | user-invoked, type `/skill:grill-with-docs` (no argument) | Validated (see qualification below) |
| `wait-what` | user-invoked, type `/skill:wait-what` (no argument) | Validated (see qualification below) |
| `to-questionnaire` | user-invoked, type `/skill:to-questionnaire`, with the decision it is about in natural language after it | Validated (see qualification below) |

The twelve user-invoked skills are **not** in the agent's `<available_skills>` block, so no other skill and no agent can fire them. Everything in this fork that needs them says so in the docs, and the skills themselves say which command to name.

`wayfinder` routes a ticket to whichever skill its type names, and checks that the skill is loaded before it reaches for it: a name in the agent's `<available_skills>` block for a model-invoked skill, Pi's resolved skill list for a user-invoked one. A skill sitting in this checkout but not loaded is reported on the ticket, which stays open, rather than worked with generic reasoning in place of the missing methodology. When the map clears, wayfinder hands off by naming the command: it tells the human to run `/skill:to-spec` with the map reference, and does not load that skill, close the map, or start the build.

`prototype` is in the manifest, so a `wayfinder:prototype` ticket has a methodology to load: wayfinder reads its `SKILL.md` in the parent session and builds the artifact there, since the exchange needs the human present and no delegated agent can hold it. The artifact lands on a throwaway `prototype/<name>` branch, pushed with no PR and never merged, and the ticket carries a durable reference to it (branch, artifact path, commit identifier). The ticket stays open until the human gives a verdict on the artifact, and inside a map the prototype's code is never folded into production: the demonstration and the confirmed decision are what the map keeps. Standalone `prototype`, outside a map, keeps upstream's behaviour, including folding a validated result into the real code. `prototype` is **Validated** for artifact generation; secondary paths remain unverified: the human's verdict that resolves a prototype ticket, the UI-variants branch, and whether an artifact was useful enough to inform the decision that followed.

`to-tickets` is registered as the eighth skill, and it is user-invoked: type `/skill:to-tickets`, with an optional repository-relative spec path or issue reference after it. Its upstream methodology is preserved: codebase exploration and prefactoring, small independently verifiable vertical slices, dependency analysis, expand/contract sequencing for wide refactors, the human quiz and approval before anything is published, blockers-first publication, and the local markdown tracker's one-file-per-ticket layout. What this fork adds is traceability, not new behaviour. When the source is a committed spec file, the skill reads that file from the repository, names the commit that holds the authoritative version, and reports whether the working copy differs from it; it does not build tickets from uncommitted changes or conversation memory, and it stops to ask which source is authoritative before publishing when the source is ambiguous. Each ticket cites the spec it was cut from (repository-relative path plus a commit-pinned permalink) and names the acceptance criteria and fixture identifiers it owns, so a fresh session can pick it up without the whole spec. Every required acceptance fixture gets one primary owner, or is recorded as already passing; a later ticket may reference an earlier fixture for regression coverage, which is not a second implementation deliverable.

Parentage follows the source. A spec committed as a Markdown file yields **standalone** implementation issues: no issue is opened to duplicate the spec, and implementation tickets are never attached to a `wayfinder:map` issue, whose children stay decision tickets. An implementation umbrella issue is allowed only when the user approves one, and it is never created automatically. An existing source issue keeps upstream's sub-issue behaviour. Labels are conditional: `ready-for-agent` is applied only when the configured triage-label document maps that role and the label already exists, and when it does not the skill reports that and publishes without it, so an unavailable label cannot fail a publication. Nothing is delegated, and independent tickets do not imply parallel execution: the skill publishes an artifact, and the work is one focused fresh session at a time, in dependency order. `implement` is now registered as the eleventh skill and is the session that works those tickets; `implement-spec` stays out of this fork's manifest.

`tdd` is registered as the ninth skill and stays model-invoked: it sits in the agent's `<available_skills>` block, so Pi loads it by reading its `SKILL.md`, and the human can force it with `/skill:tdd`. Its methodology is upstream's, unchanged: public test seams, the seam-confirmation gate, vertical slices, red → green, no coupling to internals, mocking only at system boundaries, and refactoring kept out of the loop (it belongs to `code-review`, which this fork now registers). One instruction is adapted: where upstream calls the Claude Skill tool for `codebase-design`, the skill reads the `SKILL.md` at the path Pi advertises for it in the agent's `<available_skills>` block, only when an interface's shape is genuinely in question, and reports when the skill is not in that list rather than improvising the vocabulary. `codebase-design` is now registered as the eighteenth skill, so it is reachable, but `tdd` still treats it as vocabulary to consult and keeps its `DESIGN-IT-TWICE.md` alternative-interface pattern out of the loop. Two clarifications were added to the same file: a seam already recorded as human-approved is reused without re-asking, while an inferred one still needs the human's answer (acceptance criteria name behaviour, not seams, so they are never approval on their own), and expected values come from acceptance criteria and a commit-pinned spec rather than from what the implementation returns. `tdd` is **Validated**.

`code-review` is registered as the tenth skill and stays model-invoked: it sits in the agent's `<available_skills>` block, so Pi loads it by reading its `SKILL.md`, and the human can force it with `/skill:code-review`. The two axes are upstream's and are unchanged. **Standards** reads the repo's documented standards plus the twelve-smell Fowler baseline, a documented repo standard overriding the baseline; **Spec** reads the originating issue or spec and reports missing or partial requirements, scope creep, and requirements that look implemented but are wrong. Every finding carries a citation (a rule and its file, a named smell plus its hunk, or a line of the spec), each reviewer stays under 400 words, and the report ends with a worst issue per axis and no winner across axes, because a blended verdict lets one axis hide the other. The skill reviews only: it implements nothing, commits nothing, pushes nothing, and writes nothing to a tracker.

What is adapted is execution. Upstream issues both sub-agent calls together; this fork runs one inference slot, so the two reviews run sequentially, one fresh context each. The parent launches the Standards reviewer in the foreground and waits for it to return, then launches the Spec reviewer as a separate call, and never has two model requests live at once. Neither reviewer sees the other's brief or findings. Pi's packaged `reviewer` agent is read-only and has no shell, so it cannot run `git diff`: the parent collects the diff text and hands it over, together with the pinned range and the axis-specific evidence (the standards files for Standards, the spec for Spec), and checks the evidence is complete before delegating rather than truncating the diff or substituting a summary for code. Where no suitable reviewer agent is configured, the skill says so and runs both axes in the foreground, labelled as a foreground-only review that lost the independent contexts and may carry the author's reasoning; it is never presented as an independent review.

The fixed point is the user's, never guessed. The skill records the reference they supplied, the merge-base SHA and the reviewed HEAD SHA, and runs the diff and the commit list on those SHAs, which keeps upstream's three-dot merge-base semantics while making the reviewed range immutable. It fails closed on a bad reference, an unresolvable comparison or an empty diff before any reviewer is launched, names staged, unstaged and untracked changes as outside the committed range, and refuses to review history a positional reference happens to have pulled in without saying so. The SHAs are repeated in the report, so findings stay checkable after HEAD moves. A later correction pass is a **delta review** from the previous reviewed HEAD SHA to the new one, labelled as a delta rather than a reapproval of the whole codebase. Upstream's guard line against nested `/code-review` spawns is not copied here: Pi's harness already keeps a child from fanning out on its own. The upstream setup pointer is now Pi syntax, naming `/skill:setup-matt-pocock-skills` without invoking that user-invoked skill. `code-review` is **Validated**.

`implement` is registered as the eleventh skill and stays user-invoked: its frontmatter carries `disable-model-invocation: true` and its `agents/openai.yaml` keeps `policy.allow_implicit_invocation: false`, so it is absent from the agent's `<available_skills>` block and only the human can fire it, by typing `/skill:implement` with an optional issue reference or repository-relative spec path after it. Its `agents/openai.yaml` is otherwise unchanged, and no skill and no agent can start a build on the human's behalf.

The upstream lifecycle is preserved: consume the work the user, spec or ticket describes, fetch an explicitly referenced issue and state its title before implementing, drive `tdd` at approved seams, typecheck and run focused test files regularly, run the full available suite once near the end, review the implementation, and commit to the human-selected branch. One invocation is one ticket in one fresh session. The skill is not a ticket scheduler and not an orchestrator: it dispatches no frontier, picks no next ticket, and runs no two sessions side by side, which is why `implement-spec` stays out of the manifest.

What this fork adds is authority and a stopping rule. An issue reference is resolved through `docs/agents/issue-tracker.md` and, on GitHub, against the tracker doc's **Target repository** line with `-R` passed explicitly rather than re-inferred from the remotes. The issue is the scoped task and the specification is authoritative for behaviour: the skill reads the spec at the exact commit the ticket's citation pins, reports when the working copy differs and asks which source is authoritative before implementing, and keeps acceptance criteria, output messages byte for byte, exit codes and the spec's own fixture identifiers literal. A genuine conflict between the issue and the spec is reported, not settled by quietly changing a requirement. Before editing, the skill reads the native blocking gate (open blockers only, with the tracker doc's fallbacks where the capability is marked unverified) and refuses to start a ticket with unresolved blockers unless the human resolves the situation; it inspects the branch, the working tree and any partial implementation already present; and it asks the human to confirm the branch or worktree the work lands on. It never creates or switches a branch, amends, force-pushes, or runs a destructive Git operation, and it never runs two implementation sessions in one checkout.

The review order is corrected. Upstream runs `code-review` before committing, so `git diff <fixed-point>...HEAD` has nothing to review unless an interim commit already exists; that defect is reported upstream and unfixed there. This fork records the fixed point on the confirmed branch before any edit, commits the implementation, resolves the committed HEAD SHA, checks that the base-to-HEAD range is non-empty and names the ticket's work, and only then loads `code-review` in the session and hands it that pinned fixed point. The two axes stay separate and diagnostic: findings are reported rather than applied, and a correction the human approves is committed separately and reviewed as a **delta** from the previous reviewed HEAD SHA, never as a loop until the report comes back clean. Both dependencies are checked at the point of use: `tdd` and `code-review` are model-invoked, so their names are looked for in the `<available_skills>` block and their `SKILL.md` files read in this session, and a missing one is reported as a missing dependency rather than improvised with generic advice. The run ends at a local commit and a review report: it pushes nothing, opens no pull request, closes or comments on no issue, changes no label and ticks no acceptance box, and starts no next ticket. Publication and ticket completion stay the human's, which is also why a dependency chain stays stalled until they close the ticket. `implement` is **Validated**.

`pr` is registered as the twelfth skill and stays model-invoked: its frontmatter carries no `disable-model-invocation` and its `agents/openai.yaml` carries no `policy` block, so Pi advertises it by name, description and path in the agent's `<available_skills>` block, loads it by reading its `SKILL.md`, and the human can force it with `/skill:pr`. The upstream methodology is preserved: the three-section body template (**Summary**, **Evidence**, **Merge Danger**), the six Summary views and the rule to pick the smallest useful one, the before/after evidence tiers, the one-way or two-way door call and its blast radius, and the `GLOSSARY.md` line that asks for the repo's own words.

What this fork adds is input authority, not a workflow. The draft is grounded in the change it was asked to describe: where that change is a branch, the body names the pinned fixed-point and head SHAs rather than a moving name, the evidence is quoted output the session actually has, and every commit inside the described range is included, with a post-review correction labelled as a delta rather than left out. Observed output, a claim, and an assumption are kept apart, so "the tests pass" with no run beside it is labelled a claim, and a door or a blast radius that nothing checked is reported as unverified rather than presented as settled. Nothing is invented: no test result, screenshot, review finding, or rollback guarantee is written that the session did not observe, and evidence a section asks for that is unavailable is named as missing. Where a build run left a closing report behind, the skill takes the range, the pinned spec, the test results, and the review findings from it; that report is a source, not a requirement, and work that did not come from a build run gathers the same things itself and says which it has. The skill still writes the body and nothing else: it pushes no branch, opens or edits no pull request, commits nothing, and changes no issue, so `implement`'s stopping boundary stays intact and publication remains a separately authorized action. `pr` is **Validated**: its drafting workflow has been exercised here successfully, in that it drafted its own pull-request body from pinned Git changes and observed validation output, and that body was merged. Automatic model-invoked discovery remains unverified, so the claim covers explicit drafting only.

`triage` is registered as the thirteenth skill and stays user-invoked: its frontmatter carries `disable-model-invocation: true` and its `agents/openai.yaml` keeps `policy.allow_implicit_invocation: false`, so it is absent from the agent's `<available_skills>` block and only the human can fire it, by typing `/skill:triage` and describing the work in natural language. Its upstream lifecycle is preserved: gather the full issue or PR context including comments and any prior triage notes, search for redundant work and for a matching `.out-of-scope/` rejection, recommend a category and a state with reasoning and stop for the maintainer's direction, verify the claim by reproducing it before anything reaches `ready-for-agent`, grill with `grilling` and `domain-modeling` when the request needs fleshing out, then apply only the approved outcome. The state machine is upstream's unchanged: two category roles and five state roles, exactly one of each per item, the same transitions, the same quick override, the same resumability, and the same rule that every posted comment starts with the AI disclosure. It is an on-ramp for work that arrives from outside, not a step in the pipeline above: tickets that `to-tickets` published are already agent-ready, and running triage over them re-does work that was done.

What this fork adds is configuration authority and two guards, not a workflow. Tracker operations resolve through `docs/agents/issue-tracker.md` and role mappings through `docs/agents/triage-labels.md`; when either is missing the skill names `/skill:setup-matt-pocock-skills` and stops rather than attempting that user-invoked skill. Before any label write it reads the mapped label string and checks that label exists on the tracker, reporting a missing one instead of creating, renaming, or substituting a replacement, so an unmapped role cannot silently produce a different write. The second guard is separate from upstream's classification and adds no role, state, or label: before recommending or applying `ready-for-agent` it reads the issue's open blockers through the gate the tracker doc documents (on GitHub `issue_dependencies_summary.blocked_by`, open-only, with the documented fallbacks where the capability is marked unverified), reports them by number, and refuses to present the issue as immediately startable while blockers remain open. A verified open blocker means the role is not applied at all, and no approval lifts that: approval can authorize continuing the investigation, posting a brief without the role, or resolving a blocker as a separate authorized operation, after which the gate is re-read before the role becomes possible. It removes no blocker, reorders no edge, closes no dependency, and reports readiness as **unverified** where the capability is unverified, applying the role automatically on neither an open blocker nor an unread gate. The write set (labels added and removed, the comment posted, closure, any `.out-of-scope/` file) is stated and waits for approval before anything is applied. Triage creates no issue, edits no issue body, changes no parent or sub-issue relationship, and assigns nothing, so it cannot advance a dependency chain: closing a blocker stays the human's, which is the same boundary `implement` already holds. Nothing is delegated and nothing runs in parallel: `grilling` and `domain-modeling` are model-invoked and registered, so triage checks each name in the `<available_skills>` block at the point of use and reads its `SKILL.md` in this session, and a name that is not loaded is reported as a missing dependency rather than improvised. `triage` is **Implemented**: registered and adapted here, with no intake run exercised yet, so no claim of an exercised triage pass is made anywhere in this fork.

`writing-for-agents` is registered as the fourteenth skill and stays model-invoked: its frontmatter carries no `disable-model-invocation` and its `agents/openai.yaml` carries no `policy` block, so Pi advertises it by name, description and path in the agent's `<available_skills>` block, loads it by reading its `SKILL.md`, and the human can force it with `/skill:writing-for-agents`. This is a registration, not an adaptation: its `SKILL.md`, its `SKILL-MECHANICS.md`, and its `agents/openai.yaml` are upstream's, unchanged, so the 103-character description that carries its trigger branches, the context-pointer rules, the two loads, the levers, the pruning tests, and the conditional pointer to `SKILL-MECHANICS.md` for the skill-specific branch all read as they did upstream. Nothing was added to it for Pi, and no Pi-specific rule was introduced merely for consistency with the earlier adaptations. It is the reference every other skill in this set was written against, so registering it is what makes that reference reachable on a local model, and it is what the Retro adaptation registered here loads before that skill evaluates agent instructions. `writing-for-agents` is **Validated** under a stated scope: its methodology has been exercised here once, read-only, against a real adapted skill. The reference was loaded by path, `SKILL-MECHANICS.md` was loaded through its conditional pointer because the review subject was a skill, and the pass named failure modes in the reference's own vocabulary with citations checkable against disk: a **cache** where three `gh` spellings in `triage` are byte-identical to the tracker doc that skill is told to read first, **sediment** where the missing-configuration stop is stated twice with different bounds, a step with no **completion criterion** and its write-set successor visible below it, restated outcome menus, and a synonym inside a prohibition. Every behavioural consequence from that pass was labelled speculative, since no triage run has been exercised here, and none of the findings was applied: `triage` stays **Implemented**. What the scope does not cover is automatic model-invoked discovery: the pass read the `SKILL.md` by path, so nothing has shown the local model reaching for the reference from its description.

`retro` is registered as the fifteenth skill and stays user-invoked: its frontmatter carries `disable-model-invocation: true` and its `agents/openai.yaml` keeps `policy.allow_implicit_invocation: false`, so it is absent from the agent's `<available_skills>` block and only the human can fire it, by typing `/skill:retro` and naming the session to look back on after it. Its `agents/openai.yaml` is otherwise unchanged, and no skill and no agent can start a retrospective on the human's behalf.

The upstream methodology survives whole. The seven candidate categories keep their `_Use when_` triggers: **Navigation** (a navigation pointer where the session struggled to find a file or a fact), **Automated checks** (read the repo's own check command first, so an existing check that sits unwired or silently broken is the finding rather than a reinvention, and a repo with no guardrail at all is a finding of its own), **Coding standards** (classify the violation first: a mechanical one gets a deterministic check in the repo's linter, a pre-commit hook, or a CI job, whichever the language and existing guardrail make cheapest, and `CODING_STANDARDS.md` is reserved for genuine judgement calls), **Global AGENTS.md** (steering that belongs in standards or a check instead), **Tool economy**, **No-ops**, and **Information access**. The reference survives with it: the implementation agent carries the most context pressure and the review agent the least, so a new standard goes where there is room to apply it, which is review, and never into an always-loaded instruction file, which is for navigation pointers and little else. `retro` remains an environment-improvement methodology: it is not a retrospective report on the code, and it is not a memory system, because the lesson lives in the check, the pointer, or the standard, or it is dropped.

What this fork adds is loading, evidence, and a boundary. Step 1's Claude Skill-tool call becomes Pi's explicit pattern: check `writing-for-agents` in the agent's `<available_skills>` block, read `skills/productivity/writing-for-agents/SKILL.md` in this checkout before any session evidence is read, and follow that file's own conditional pointer to `SKILL-MECHANICS.md` when the candidate being judged is a skill document. The load stays eager, which is upstream's decision and stays upstream here, because the reference carries the definitions of a no-op instruction and of a good skill, and those are the yardsticks the **No-ops** and **Skills** candidates are judged against; a retro that only reads and reports still needs them. A name that is not loaded is reported as a missing dependency and the run stops rather than judging the steering files with no yardstick. Nothing from the reference is restated inside `retro`, and the reference itself is untouched.

Session evidence is Pi's, not the model's memory. Upstream's default stands: the current session unless the user names another, which the user selects by path, by session ID, or from the `/resume` picker. A past session is read from its JSONL file, and a fresh session does not hold another session's conversation. The logs are large, so the skill identifies the selected session first, follows its actual entry structure (entries form a tree linked by `id`/`parentId`, and headers, tool results, and compaction entries are separate entry types), and searches by entry type, keyword, entry ID, or bounded range rather than loading a whole log into the model context. Observed stays apart from interpreted: a recorded tool call and its output are observations, a model's account of what it was doing and a compaction summary are interpretations, and a compaction summary can locate an event but is not proof of one. Reasoning that cannot be read is not reconstructed as evidence. A category the record does not support is reported as having no evidence rather than filled with a plausible finding, and every candidate names its source, with repository artifacts (committed diffs, test runs, the repo's own check scripts, CI workflows, hooks, steering files) used as corroboration where they apply.

The write boundary is now explicit rather than implied. `retro` writes nothing: no source code or project instruction edited, no other skill edited, no CI check or hook created or changed, no `CODING_STANDARDS.md` created, no Git configuration changed, no dependency installed, no commit or push, no issue or pull request opened or edited, and no external permission changed. It presents the candidates and stops for the human to pick, and a selected improvement is a separately authorized implementation task with its own review. A check that already exists is preferred over a duplicate, and a newly proposed blocking check is run against the project, including against changes that should pass, before it is allowed to block. A fork-specific rule sits with the Files reference: `CLAUDE.md` is upstream-controlled and must not be deleted, rewritten, or trimmed, and `AGENTS.md` is fork-local and harness-aware, so `retro` may name a no-op or a redundant instruction in either and recommend its removal or its move, but it edits neither, and it never proposes adding an instruction to an always-loaded file when a narrower surface the agent already reads would carry it. Nothing is delegated, nothing runs in parallel or in the background, and no other skill invokes `retro`: it stays an independently invoked workflow, not a step that `implement`, `code-review`, `pr`, or `triage` reaches for.

`retro` is **Validated** under a stated scope: its methodology has been exercised here once, read-only, against a real session. The adapted skill was loaded explicitly, a previous Pi session was identified from this fork's session directory and analyzed from its JSONL file rather than from memory, and the observations the run leaned on were checked back against the record and against repository artifacts on disk. That session was the one in which this fork's `triage` adaptation had been carried out, so the run reconstructed what a completed adaptation had actually done, evaluated all seven candidate categories, and returned improvement candidates each naming its evidence, with the categories the record did not support reported as having no evidence rather than filled with plausible findings. The recommendation-only boundary held throughout: nothing was applied, no check or hook was wired, and the run edited no file. What the scope does not cover is the invocation path and the cost of finding evidence. `/skill:retro` after a Pi install has not been exercised here, so nothing shows the human-invoked registration resolving end to end on a local model, and no session-discovery efficiency has been established, so the skill's selective reading of large logs is unmeasured. `retro`'s **Validated** is therefore a claim about methodology and evidence discipline, not about invocation or retrieval cost.

`handoff` is registered as the sixteenth skill and stays user-invoked: its frontmatter carries `disable-model-invocation: true` and its `agents/openai.yaml` keeps `policy.allow_implicit_invocation: false`, so it is absent from the agent's `<available_skills>` block and only the human can fire it, by typing `/skill:handoff` and naming what the next session will be used for after it. Its `agents/openai.yaml` is otherwise unchanged, and no skill and no agent can start a handoff on the human's behalf. The upstream methodology survives whole: one markdown file written to the OS temporary directory (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows) rather than into the workspace, a summary of what is in flight, why, and what comes next, references to existing artifacts instead of copies of them, redaction of secrets and personally identifying information, and a document tailored to the focus the user passed.

What this fork adds is one harness-aware branch inside the suggested-skills section, plus upstream's own size criterion stated where the skill runs. Upstream's Skill-tool instruction stays valid for Claude, and the frontmatter, the `argument-hint`, and the description are upstream's unchanged. For Pi, the section names only skills the receiving harness actually has, because a name it cannot find is a dead pointer, and writes the instruction the receiver can act on: a model-invoked skill is named together with its `SKILL.md` to read, whose path the next agent finds in its own `<available_skills>` block, and a user-invoked skill is written as a command for the human to type (`/skill:<name>`), never as something the next agent invokes. That split is `.agents/invocation.md`'s rule, which forbids any skill reaching a user-invoked one, restated for the document a Pi session hands over. The size rule (keep the document a small fraction of the conversation) sits beside the non-duplication instruction, because upstream carries that criterion only in its docs page and a local model with no bound on the summary can restate the session rather than point at it.

What is deliberately not added: no document template, no fixed length, no session-log reading, no durable project-memory location, and no automatic invocation. Pi already keeps each session as a resumable JSONL record and already compacts long contexts, so the file's unique value in Pi is reach: a document a different harness, a different directory, or a colleague can read. `handoff` is **Validated** under a stated scope: it was exercised end to end here, through native Pi `/skill:handoff` invocation by the human, creation of a temporary Markdown document in the OS temp directory, and independent consumption by a fresh Pi session that read that document alone, with no access to the generating session or to any other session record, and recovered the project state, the settled design decisions and their rationale, the read-only boundary, and the next steps. The suggested-skills section was checked for syntax and availability only: every skill it named is registered in this fork, each model-invoked name arrived with the `SKILL.md` path to read, and each user-invoked name arrived as a command for the human to type rather than as something an agent could invoke. What the scope does not cover: cross-harness portability, since the document was read back in Pi and never in Claude or Codex; the fork/branch round-trip workflow, since the consuming session continued in place and no side task was forked out and folded back; durability of the temporary file across a reboot or across sessions that clear temp; redaction under sensitive-input conditions, because the run carried no key, password, or identifying data, so the redaction instruction was never exercised against anything to redact; and any measured ratio of document size to conversation size, since the size rule was observed only as a document a fresh session could read cold. The suggestions themselves were not judged: some named skills would have taken the receiving session past its read-only authorization boundary, so the claim covers invocation syntax and availability, not the appropriateness of every suggestion.

`diagnosing-bugs` is registered as the seventeenth skill and stays model-invoked: its frontmatter carries no `disable-model-invocation` and its `agents/openai.yaml` carries no `policy` block, so Pi advertises it by name, description and path in the agent's `<available_skills>` block, loads it by reading its `SKILL.md`, and the human can force it with `/skill:diagnosing-bugs` (upstream harnesses type `/diagnosing-bugs`). Its description is upstream's unchanged, trigger phrasing included; over-triggering on a model with a lower activation threshold is a reported upstream problem, not something this fork changes before it has been observed here. The six-phase methodology survives whole and its gates are unchanged: a tight, red-capable feedback loop (one named command, already run at least once, that goes red on this bug and asserts the user's exact symptom) before any hypothesis, reproduce and minimise until every remaining element is load-bearing, three to five ranked falsifiable hypotheses each stating a prediction and shown before any is tested, probes mapped to those predictions with one variable at a time and every debug log tagged so one grep cleans them, a regression test at a correct seam written before the fix with the forced-mutation `diff` against a pristine copy before a manufactured red is trusted, and cleanup that re-runs the original repro, greps the tag, deletes the throwaways, and names the hypothesis that turned out correct in the commit or PR message. All ten loop recipes, the correct-seam criterion, the performance branch, the redaction rule, and the non-deterministic reproduction-rate rule are upstream's, and the Phase 1 gate is not weakened anywhere.

What is adapted is execution. Pi's agent shell is non-interactive, so the HITL last resort cannot be run through it: the template reads stdin with `read -r -p` under `set -euo pipefail` and aborts on EOF there without capturing anything. The skill now resolves `scripts/hitl-loop.template.sh` against the directory holding its own `SKILL.md` rather than the current working directory, since the project under debug is usually not this repository, and hands the human the command to run in their own terminal, taking the captured `KEY=VALUE` block back through the conversation, or a one-question-at-a-time chat capture where one round-trip is enough. The script itself is unchanged, including its recorded file mode. One inference slot governs model sessions, and the skill says so beside the fact that test and process concurrency is ordinary shell work and stays permitted: stress loops, differential pairs, and parallel test runners are how the reproduction-rate rule gets its rate. Expensive loops get a bound chosen for the task rather than a universal number, a timeout, a reported seed, and the observed reproduction rate and measurement conditions stated rather than assumed, so a probabilistic repro is verified at its measured rate and not as a certainty.

What this fork adds is authorization, not a workflow. Investigating a bug is authorized; editing persistent project files is not. Before the first edit to tracked source, a test file, or project configuration, including Phase 4 instrumentation that lands inside project code, the skill states the write set once and waits for the human's answer; one approval covers that set and is not re-asked per edit inside it, and an unapproved persistent edit is a stop rather than a proceed. `git bisect` is named as a state-changing operation that needs explicit human authorization, with the tree state, the state that will change, and the `git bisect reset` cleanup stated before it is asked for, and a manual boot-at-state-X harness preferred over moving the tree. Completion may propose a commit message; the commit, the push, and the pull request stay separately authorized.

`diagnosing-bugs` is **Validated** under a stated scope: its six-phase methodology has been applied successfully here once, in a fresh Pi session that read the adapted `SKILL.md` and completed a disposable Node.js debugging exercise. The observed run showed the whole sequence rather than parts of it: a command demonstrated the actual reported failure before any hypothesis was offered, the failure was reproduced and then minimised, five falsifiable hypotheses were generated and tested one at a time, targeted probes located an inclusive-versus-half-open contract mismatch, the regression test was placed at the correct composition boundary, a lower-level alternative fix was shown to break an existing second caller (the shallow-seam trap the skill names, caught rather than missed), the test went red and then green after the fix, the original un-minimised reproduction went green, and the temporary instrumentation was removed with nothing left behind. What the scope does not cover: automatic model-invoked discovery, since the session read the `SKILL.md` by path rather than reaching for it from its description; blind root-cause discovery, since the session constructed the fixture and so already knew the defect; the persistent-file approval checkpoint, which the run never reached because it changed no skills-repository file; and the HITL capture, the performance branch, and redaction under sensitive-input conditions, none of which the run exercised. One distinction is stated rather than chased: Pi loads this repo as an installed package checkout under `~/.pi/agent/git/`, pinned to `main`, so a session's `<available_skills>` reflects what `main` registers, not what an unmerged branch in a separate working checkout registers. The validation session therefore saw the eight model-invoked skills `main` carries, and `diagnosing-bugs` was not among them. That is a packaging reach question, not a skill defect, and this changeset does not attempt to solve discovery.

`codebase-design` is registered as the eighteenth skill and stays model-invoked: its frontmatter carries no `disable-model-invocation` and its `agents/openai.yaml` carries no `policy` block, which is the pairing this fork's registration check reads as model-invoked, so Pi advertises it by name, description and path in the agent's `<available_skills>` block, loads it by reading its `SKILL.md`, and the human can force it with `/skill:codebase-design` (upstream harnesses type `/codebase-design`). Its 265-character description and its trigger phrasing are upstream's unchanged, including the clause that names it as the vocabulary another skill reaches for.

The reference survives whole. The glossary keeps its terms and the word each one replaces (**module**, **interface**, **implementation**, **depth**, **seam**, **adapter**, **leverage**, **locality**, against unit, component, service, API, signature and boundary), the deep-versus-shallow diagrams, the three interface-design questions, the four principles (depth as a property of the interface, with internal seams alongside the external one; the deletion test; the interface as the test surface; one adapter a hypothetical seam, two a real one), the three testability rules, the relationships block and the three rejected framings are upstream's, as is the conditional loading of `DEEPENING.md` and `DESIGN-IT-TWICE.md` behind their own preconditions. `SKILL.md`, `DEEPENING.md` and `agents/openai.yaml` are byte-identical to upstream. It stays a reference: it runs no loop, produces no artifact, and loading it grants no permission to edit project files.

What is adapted is one execution alternative, in `DESIGN-IT-TWICE.md` only. Upstream's parallel-subagent method is kept as the method wherever the harness gives each sub-agent its own independent context. Pi here runs one model session at a time, so the file adds a sequential fallback that keeps the same three or more alternatives, the same design constraint on each, the same output contract, and the same comparison on depth, locality and seam placement with the same opinionated recommendation, and states the limit rather than papering it over: alternatives written in one session are not independent, since each later one is written with the earlier ones already in the window, and separate context windows are what buy the radical difference the technique asks for. A single delegated agent, run one at a time and authorized per design task by the human rather than automatic, is named as an optional way to get one separate perspective, which yields two independent designs rather than upstream's three or more. No delegated agent was run in this change.

`codebase-design` is **Validated** under a stated scope: a fresh Pi session loaded the current `SKILL.md` by path and applied the vocabulary to a real module in this repository, `scripts/check-pi-registration.mjs`, and the run identified the module's external interface together with the contracts a caller must actually honour, separated the external seam from the internal ones the module's own tests use, evaluated depth, leverage and locality for the module as it stands, ran the deletion test on one named helper against its real call sites, applied the one-adapter-versus-two rule and rejected the seams a single adapter would not justify, loaded `DEEPENING.md` on demand to classify the module's actual dependencies, compared two candidate interfaces and argued for keeping the existing implementation rather than replacing it, and kept source-grounded observations apart from assumptions. It produced no refactor, no artifact, no delegation and no exploration outside the named module, and it left the repository's tracked changes byte-identical. What the scope does not cover: automatic model-invoked discovery, since the session read the `SKILL.md` by path rather than reaching for it from its description; end-to-end use of the `DESIGN-IT-TWICE.md` sequential fallback, which the run never entered; genuine independence between designs generated in one context, which the run did not test and which the file states as a limit rather than a property; cross-project skill lookup through `tdd` from an unrelated working directory; and the optional single-delegated-agent alternative, which was not authorized and not run. Whether the reference alone starts a runaway exploration on a model with a lower activation threshold stays unobserved here for the same reason the description stays upstream's: native discovery was not exercised.

`improve-codebase-architecture` is registered as the nineteenth skill and stays user-invoked: its frontmatter carries `disable-model-invocation: true` and its `agents/openai.yaml` carries `policy.allow_implicit_invocation: false`, which is the pairing this fork's registration check reads as user-invoked, so Pi keeps it out of the agent's `<available_skills>` block and only the human can fire it, by typing `/skill:improve-codebase-architecture` with an optional module, subsystem or pain point after it (upstream harnesses type `/improve-codebase-architecture`). Its three phases are upstream's, unchanged in purpose: scope before scanning (a named direction, otherwise the hot spots in `git log --oneline`, with the net widened when changes are scattered), read the project's `GLOSSARY.md` and the ADRs in the touched area, explore organically for friction against the five questions and the deletion test, present the candidates as one self-contained HTML report in the OS temp directory carrying the card fields, the before/after diagrams, the dependency-category tags, the strength badges and the top recommendation, then stop and ask which candidate to explore. `HTML-REPORT.md` and `agents/openai.yaml` are byte-identical to upstream, so the scaffold, the five diagram patterns, the Mermaid and Tailwind CDN setup, the badge colours, the word limits and the exact-vocabulary rule are upstream's, and the unmerged upstream Mermaid edge-label change is not folded in.

What is adapted is one appended section, `## Pi execution and authorization`, and it replaces only the harness-specific instructions. Pi has no Skill tool, so the four `Call the Skill tool with "…"` sites (`codebase-design` twice, `grilling`, `domain-modeling`) load by registry: check the name in the agent's `<available_skills>` block, read its `SKILL.md` at the path Pi advertises there, and follow that loaded file, never a path in the project under review, since the code being surveyed is usually not this checkout. A name that is not registered is reported as a missing dependency together with the step it blocks, and the work that does not need it continues rather than being improvised. Exploration runs in the foreground session instead of through a dispatched sub-agent: no automatic delegation, never two live model requests, and a foreground walk is never presented as an independent-context analysis, with a single delegated explorer available only on the human's authorization for that run and only after its effective permissions are checked. `DESIGN-IT-TWICE.md` is not duplicated here; the design-it-twice bullet runs `codebase-design`'s own sequential fallback and states its independence limit. The bundled `HTML-REPORT.md` resolves against the directory holding the loaded `SKILL.md`. Where no browser can be launched the report is still written and inspected statically, the absolute path and the human's own open command are given, and structural inspection is kept separate from rendered inspection, since the agent never sees the page. Persistent writes are gated: the temp report needs no approval, while `GLOSSARY.md` and ADR files are tracked project files whose write set is stated per decision and held for one human approval, with no approval meaning stop at the findings. A candidate authorizes no refactor, interface, branch, commit, push or pull request, and the upstream stop after the report is kept, since weaker models are reported to skip straight to an interview. The no-change conclusion stays upstream's rather than a new rule: the deletion test gates a card and the `Speculative` badge is how a report that found nothing reads. `improve-codebase-architecture` is **Validated** under a stated scope. Two fresh Pi sessions on 2026-10-28 each fired the installed skill with `/skill:improve-codebase-architecture` and completed a survey end to end. Run 1 ran in `~/projects/wayfinder-test` at `6ed279f`, a project that carries no skill file anywhere in its tree, and every path that run resolved sat in the installed package clone: the dependency loads, the fired target, and `HTML-REPORT.md` beside it. That run's honest result was two `Speculative` cards and a top recommendation that nothing was worth tackling, which is the expected outcome for a one-module project. Run 2 ran in this repository at `b43044c` against `scripts/` and produced four cards, one `Strong`, two `Worth exploring`, one `Speculative`, a top recommendation, and one observed fork defect it found by reading: `skills/in-progress/chief-of-staff/SKILL.md` carries no row in its bucket README. What the scope does not cover, and no claim is made for it: the `grilling` and `domain-modeling` load sites in the appended section were never entered, so two of the four sites are closed by runtime and two by statics only; no rendered inspection occurred in either run, both inspected the report structurally; automatic model-invoked discovery does not apply to this skill at all, since its frontmatter keeps it user-invoked and only the human can fire it; the figure "seven entry points over 69 lines" in Run 2's second candidate did not reproduce and is not repeated here; upstream body identity is step 7's parity evidence, not a runtime claim; and the context cost figures are byte measurements with an arithmetic estimate, not a measured window count.

`grill-with-docs` is registered as the twentieth skill and stays user-invoked: its frontmatter carries `disable-model-invocation: true` and its `agents/openai.yaml` carries `policy.allow_implicit_invocation: false`, the pairing this fork's registration check reads as user-invoked, so Pi keeps it out of the agent's `<available_skills>` block and only the human can fire it, by typing `/skill:grill-with-docs` with no argument (upstream harnesses type `/grill-with-docs`). Its `SKILL.md` and its `agents/openai.yaml` are byte-identical to upstream at the pinned commit `447ca70872026d5b79d6073a546dac082117fed7`, so the one operative sentence, `Call the Skill tool twice, for "grilling" and "domain-modeling".`, is upstream's, and both skills it names are registered here and model-invoked, which is what makes the wrapper's two loads reachable on Pi at all. What is adapted is two appended sections, and neither restates either dependency's method, so both keep tracking upstream. `## Invocation` names the command and states that it takes no argument; `## Pi execution and authorization` replaces only the harness-specific instruction, because Pi has no Skill tool: each name is checked in the agent's `<available_skills>` block at the point of use and its `SKILL.md` read at the path Pi advertises there, never a path resolved against the project under review, the two loads are issued one at a time, and a name that is not loaded is reported as a missing dependency together with the step it blocks, since a missing `grilling` stops the interview and a missing `domain-modeling` stops the glossary and ADR writing. Files bundled with a loaded skill resolve against the directory holding that skill's loaded `SKILL.md`, which is what keeps `GLOSSARY-FORMAT.md` and `ADR-FORMAT.md` reachable when the survey runs in a project that carries no skills of its own. The writes this skill exists to produce are gated: `GLOSSARY.md` and `docs/adr/` are tracked project files, so the skill states its write set per resolved term or settled decision and holds it for one human approval, with no approval meaning stop at the interview and hand the findings over. A settled decision authorizes no refactor, branch, commit, push or pull request. The file grows from 247 bytes upstream to 2,681, and it costs only the sessions where the human types the command, since a user-invoked skill is never loaded automatically. `grill-with-docs` is **Validated** under a stated scope. Two interview runs on 2026-10-28 in `~/projects/wayfinder-test` at `6ed279f`, each started as a fresh session that fired the installed skill by typing `/skill:grill-with-docs`. Run 1 settled facts by probing the repo and the interpreter, argparse on CPython 3.14.8, ticket labels and blocking edges, git state, and asked eleven questions the human answered, and both dependency loads resolved to the installed package clone under `~/.pi/agent/git/github.com/gimclick/local-llm-pi-skills/`, one at a time, which is the adaptation this fork exists to make. Run 2 reached the write legs: `GLOSSARY.md` written at 3,572 bytes with fourteen entries, the three new ones carrying the `_Avoid_` lines the format demands, and `docs/adr/0001-argparse-owns-the-accepted-command.md` written at 1,750 bytes, one paragraph plus `## Considered options` plus `## Consequences` and no `Status`, the shape `ADR-FORMAT.md` prescribes for a decision whose rejected alternatives are worth remembering. The authorization boundary held in both runs, `git status --short` in the project stayed empty, its `GLOSSARY.md` stayed at 2,732 bytes, and no branch, commit, push or pull request was made there. Excluded from the claim, and unobserved: the writes landed in a scratch mirror at `~/projects/testing/wayfinder-linecount/` rather than in the project under review, so the skill's promise that the docs go into the repo is proven against a redirected target only; run 2's answers were steered from a sheet generated in this session, so the interview's human leg is proven for run 1's eleven answers and not for the later rounds; the missing-dependency report was never triggered, since both names were loaded; and the gate's refusal branch, where no approval means stopping at the interview, was not exercised. Closing the upstream-syntax pointer to this skill in `setup-matt-pocock-skills/domain.md` is a separate change to another registered skill's bundled file, not part of this registration.

`wait-what` is registered as the twenty-first skill and stays user-invoked: its frontmatter carries `disable-model-invocation: true` and its `agents/openai.yaml` carries `policy.allow_implicit_invocation: false`, the pairing this fork's registration check reads as user-invoked, so Pi keeps it out of the agent's `<available_skills>` block and only the human can fire it, by typing `/skill:wait-what` with no argument (upstream harnesses type `/wait-what`). Its `SKILL.md` carries the upstream 396-byte file byte-identical as its prefix at the pinned commit `59db609eb1e18aaf59b63284d0e52255aff0c63c`, and its `agents/openai.yaml` is byte-identical in full, so the one sentence, its leading word **wait**, the ASD-STE100 register, and the `GLOSSARY-MAP.md` pointer are upstream's. What is adapted is two appended sections, and neither restates a method: `## Invocation` names the command and states that it takes no argument, and `## Pi execution and authorization` states that the upstream sentence is the whole instruction, that the two glossary files resolve against the project under review rather than this checkout or the installed package clone, that a missing map means the root glossary and a missing glossary leaves the re-pitch running on register and context with the lost half named rather than a term invented, and that a re-pitch authorizes no edit, branch, commit, push, or tracker write. The file grows from 396 bytes upstream to 2,245, and it costs only the sessions where the human types the command, since a user-invoked skill is never loaded automatically. `wait-what` is **Validated** in the README's maturity categories under a stated scope: one re-pitch run on 2026-10-28 in `~/projects/wayfinder-test` at `6ed279f`, started as a fresh session in that project and fired by typing `/skill:wait-what` with no argument, the only route to a user-invoked skill on Pi. The run re-pitched a real answer about `linecount.py` into short active sentences in the ASD-STE100 register, carried all eleven terms of that project's own `GLOSSARY.md` (`Line`, `Line ending`, `Unterminated final line`, `Empty Line`, `Line count`, `File`, `Help request`, `Usage error`, `Read error`, `Supported environment`, `Unspecified`) and none of the words that file's `_Avoid_` lines rule out for them, settled facts by reading the code, the spec at `docs/specs/line-count.md` pinned at `0c6a1ee`, the harness, and the closed and open issues rather than recalling them, and named that the glossary it read belongs to the project under review and that no `GLOSSARY-MAP.md` means one context. Excluded from the claim: the branch where a project has no `GLOSSARY.md`, which was never taken, since that project has one; the branch where a `GLOSSARY-MAP.md` points at more than one glossary, and the tie-break that asks which one before re-pitching, since no project on this machine carries a map and creating one is an edit no task authorized; and the refusal branch of the authorization boundary, which the run stated in one sentence rather than tested, since the re-pitch asked for nothing. The run's own reading of the acceptance harness is part of the record: it ran `python3 -m unittest tests/test_linecount.py` in that project, which left an untracked `tests/__pycache__/` there, and no tracked file in that project changed.

`to-questionnaire` is registered as the twenty-second skill and stays user-invoked: its frontmatter carries `disable-model-invocation: true` and its `agents/openai.yaml` carries `policy.allow_implicit_invocation: false`, the pairing this fork's registration check reads as user-invoked, so Pi keeps it out of the agent's `<available_skills>` block and only the human can fire it, by typing `/skill:to-questionnaire` with the decision it is about in natural language after it (upstream harnesses type `/to-questionnaire`). Its `SKILL.md` carries upstream's 2,904-byte file byte-identical as its prefix at the pinned commit `59db609eb1e18aaf59b63284d0e52255aff0c63c`, and its `agents/openai.yaml` is byte-identical in full, so the three steps, the send-not-subject rule, the discovery-questionnaire shape, the most-important-first ordering and the inline `<questionnaire-template>` are upstream's. It names no other skill, so there is no load to translate and no missing-dependency split to draw; the adaptation is entirely appended, which is the narrowest shape this fork allows. `## Invocation` names the command and states that "Grill the send" is upstream's verb for the two exchanges inside this skill rather than the `grilling` skill, since a Pi session hearing that word can otherwise reach for the interview primitive this fork registers, and that interview is about the subject, which is what this skill's own first line rules out. `## Pi execution and authorization` states that the interview runs in this session with no delegation and no second model session, that the questionnaire file resolves against the project under review rather than this checkout or the installed package clone, that the one file is the only side effect with delivery left to the human, and that a fresh session holds no memory of the grilling this skill is meant to follow, so it has to be fired in the same session as that grilling or the topic is re-supplied by hand. The file grows from 2,904 bytes upstream to 4,654, and it costs only the sessions where the human types the command, since a user-invoked skill is never loaded automatically. `to-questionnaire` is **Validated** under a stated scope. One run on 2026-10-28, after PR #31 merged and the installed clone carried the port at 4,654 bytes: the human fired `/skill:to-questionnaire`, Pi loaded the installed copy, the skill ran the two-exchange interview about the send and stayed off the subject, and it drafted `to-questionnaire-teaching-a-friend.md`, 5,835 bytes, nineteen questions under four themed `##` groups plus `Context`, `How to answer`, and the closing catch-all, for a friend in a different Pi setup whose use case is asking their boss for direction. That run covers the invocation leg, the send-not-subject rule, the document structure, and the one-file side effect. Excluded from the claim: the portability leg, since the session ran in this skills checkout rather than a target project and the file landed there and was moved to `~/projects/testing` by hand afterwards rather than resolving to the project under review; the fresh-session boundary, since the run happened in the same session that did the porting work and so held its memory of it; and the meeting the questionnaire is for, which was never held, so nothing came back through it.

Every other skill in this repo is **Not Implemented** for Pi: it is upstream material, present in the tree and documented as upstream behaviour, but not in `package.json` → `pi.skills`, so Pi does not load it.

</details>

### 2. Run `/setup-matt-pocock-skills`

In your agent, run it once per repo. In Pi, type `/skill:setup-matt-pocock-skills` — the skill is marked `disable-model-invocation: true`, so no agent will reach for it. It will:

- Ask you which issue tracker you want to use (GitHub, GitLab, local files, or anything else you describe)
- Ask you what labels you apply to tickets when you triage them (`/triage` uses labels)
- Ask you where you want to save any docs we create

### 3. Bam - you're ready to go.

## Why These Skills Exist

I built these skills as a way to fix common failure modes I see with Claude Code, Codex, and other coding agents.

### #1: The Agent Didn't Do What I Want

> "No-one knows exactly what they want"
>
> David Thomas & Andrew Hunt, [The Pragmatic Programmer](https://www.amazon.co.uk/Pragmatic-Programmer-Anniversary-Journey-Mastery/dp/B0833F1T3V)

**The Problem**. The most common failure mode in software development is misalignment. You think the dev knows what you want. Then you see what they've built - and you realize it didn't understand you at all.

This is just the same in the AI age. There is a communication gap between you and the agent. The fix for this is a **grilling session** - getting the agent to ask you detailed questions about what you're building.

**The Fix** is to use:

- [`/grill-me`](./skills/productivity/grill-me/SKILL.md) - for non-code uses
- [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md) - same as [`/grill-me`](./skills/productivity/grill-me/SKILL.md), but adds more goodies (see below)

These are my most popular skills. They help you align with the agent before you get started, and think deeply about the change you're making. Use them _every_ time you want to make a change.

### #2: The Agent Is Way Too Verbose

> With a ubiquitous language, conversations among developers and expressions of the code are all derived from the same domain model.
>
> Eric Evans, [Domain-Driven-Design](https://www.amazon.co.uk/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)

**The Problem**: At the start of a project, devs and the people they're building the software for (the domain experts) are usually speaking different languages.

I felt the same tension with my agents. Agents are usually dropped into a project and asked to figure out the jargon as they go. So they use 20 words where 1 will do.

**The Fix** for this is a shared language. It's a document that helps agents decode the jargon used in the project.

<details>
<summary>
Example
</summary>

Here's an example [glossary](https://github.com/mattpocock/course-video-manager/blob/076a5a7a182db0fe1e62971dd7a68bcadf010f1c/CONTEXT.md) (still named `CONTEXT.md` at that pinned commit, from before the skills renamed the convention), from my `course-video-manager` repo. Which one is easier to read?

- **BEFORE**: "There's a problem when a lesson inside a section of a course is made 'real' (i.e. given a spot in the file system)"
- **AFTER**: "There's a problem with the materialization cascade"

This concision pays off session after session.

</details>

This is built into [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md). It's a grilling session, but that helps you build a shared language with the AI, and document hard-to-explain decisions in ADR's.

It's hard to explain how powerful this is. It might be the single coolest technique in this repo. Try it, and see.

> [!TIP]
> A shared language has many other benefits than reducing verbosity:
>
> - **Variables, functions and files are named consistently**, using the shared language
> - As a result, the **codebase is easier to navigate** for the agent
> - The agent also **spends fewer tokens on thinking**, because it has access to a more concise language

### #3: The Code Doesn't Work

> "Always take small, deliberate steps. The rate of feedback is your speed limit. Never take on a task that’s too big."
>
> David Thomas & Andrew Hunt, [The Pragmatic Programmer](https://www.amazon.co.uk/Pragmatic-Programmer-Anniversary-Journey-Mastery/dp/B0833F1T3V)

**The Problem**: Let's say that you and the agent are aligned on what to build. What happens when the agent _still_ produces crap?

It's time to look at your feedback loops. Without feedback on how the code it produces actually runs, the agent will be flying blind.

**The Fix**: You need the usual tranche of feedback loops: static types, browser access, and automated tests.

For automated tests, a red-green-refactor loop is critical. This is where the agent writes a failing test first, then fixes the test. This helps give the agent a consistent level of feedback that results in far better code.

I've built a **[`/tdd`](./skills/engineering/tdd/SKILL.md) skill** you can slot into any project. It encourages red-green-refactor and gives the agent plenty of guidance on what makes good and bad tests.

For debugging, I've also built a **[`/diagnosing-bugs`](./skills/engineering/diagnosing-bugs/SKILL.md)** skill that wraps best debugging practices into a disciplined loop, gated phase by phase.

### #4: We Built A Ball Of Mud

> "Invest in the design of the system _every day_."
>
> Kent Beck, [Extreme Programming Explained](https://www.amazon.co.uk/Extreme-Programming-Explained-Embrace-Change/dp/0321278658)

> "The best modules are deep. They allow a lot of functionality to be accessed through a simple interface."
>
> John Ousterhout, [A Philosophy Of Software Design](https://www.amazon.co.uk/Philosophy-Software-Design-2nd/dp/173210221X)

**The Problem**: Most apps built with agents are complex and hard to change. Because agents can radically speed up coding, they also accelerate software entropy. Codebases get more complex at an unprecedented rate.

**The Fix** for this is a radical new approach to AI-powered development: caring about the design of the code.

This is built in to every layer of these skills:

- [`/to-spec`](./skills/engineering/to-spec/SKILL.md) quizzes you about which modules you're touching before creating a spec

And crucially, [`/improve-codebase-architecture`](./skills/engineering/improve-codebase-architecture/SKILL.md) surveys a codebase for deepening opportunities and hands you the candidates. I recommend running it on your codebase once every few days. It is a survey, not a rescue: on a genuinely old codebase it will find real candidates, but it won't untangle the mud for you.

### Summary

Software engineering fundamentals matter more than ever. These skills are my best effort at condensing these fundamentals into repeatable practices, to help you ship the best apps of your career. Enjoy.

## Reference

This list is the full set of skills in the checkout, upstream's and this fork's. Only the twenty-two named in `package.json` → `pi.skills` are registered for Pi; the rest are **Not Implemented** for Pi and are not loaded (see the status table under Installation). Within that set, they split on one axis: who can invoke them. **User-invoked** skills are reachable only when you type them (e.g. `/grill-me`, or `/skill:grill-me` in Pi); their job is to orchestrate. **Model-invoked** skills can be invoked by you _or_ reached for automatically by the agent when the task fits; they hold the reusable discipline. A user-invoked skill may invoke model-invoked skills, but never another user-invoked one.

### Engineering

Skills I use daily for code work.

**User-invoked**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)**: Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)**: Grilling session that also builds your project's domain model, sharpening terminology and updating `GLOSSARY.md` and ADRs inline.
- **[triage](./skills/engineering/triage/SKILL.md)**: Move issues through a state machine of triage roles.
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)**: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **[setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md)**: Configure this repo for the engineering skills (issue tracker, triage labels, domain doc layout). Run once per repo before using the other engineering skills.
- **[to-spec](./skills/engineering/to-spec/SKILL.md)**: Turn the current conversation, or a cleared Wayfinder map, into a spec and land it: a committed file where the map's Destination names one, otherwise the issue tracker. No interview, just synthesis of what you've already decided (this fork; upstream always publishes to the tracker).
- **[to-tickets](./skills/engineering/to-tickets/SKILL.md)**: Break any plan, spec, or conversation into a set of tracer-bullet tickets, each declaring its blocking edges, written as text in a local file, or as native blocking links on a real tracker.
- **[implement](./skills/engineering/implement/SKILL.md)**: Build the work described by a spec or set of tickets, driving `/tdd` at approved seams, then committing and closing out with `/code-review` over the committed range.
- **[implement-spec](./skills/engineering/implement-spec/SKILL.md)**: Implement a whole spec on one integration branch. Works the tickets as a task graph, running implementer subagents across the ready frontier for maximum concurrency, then closes out with `/code-review`.
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)**: Plan a huge chunk of work, more than one agent session can hold, as a shared map of decision tickets on the issue tracker, and resolve them one at a time until the way to the destination is clear.
- **[retro](./skills/engineering/retro/SKILL.md)**: Suggest improvements to the coding agent's environment (navigation, automated checks, coding standards, steering files, tooling) after a session, most severe first.

**Model-invoked**

- **[prototype](./skills/engineering/prototype/SKILL.md)**: Build a throwaway prototype to answer a design question, either a single shareable HTML file for state/logic questions, or several radically different UI variations toggleable from one route.
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)**: Disciplined diagnosis loop for hard bugs and performance regressions: build a feedback loop that goes red on this bug → minimise → hypothesise → instrument → fix → regression-test.
- **[research](./skills/engineering/research/SKILL.md)**: Investigate a question against high-trust primary sources and capture the findings as a cited Markdown file in the repo, run as a single foreground subagent (this fork; upstream runs it as a background agent).
- **[tdd](./skills/engineering/tdd/SKILL.md)**: Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)**: Actively build and sharpen a project's domain model: challenge terms against the glossary, stress-test with edge-case scenarios, and update `GLOSSARY.md` and ADRs inline.
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)**: Shared discipline and vocabulary for designing deep modules: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface (registered for Pi; its Design It Twice alternatives run in parallel upstream, and sequentially in this fork).
- **[code-review](./skills/engineering/code-review/SKILL.md)**: Two-axis review of the diff since a fixed point: **Standards** (does it follow the repo's coding standards, plus a Fowler smell baseline?) and **Spec** (does it faithfully implement the originating issue/spec?), run as two separate fresh-context reviewers so neither pollutes the other (sequential in this fork; upstream runs them in parallel).
- **[pr](./skills/engineering/pr/SKILL.md)**: The shape a pull request body should take: a summary as the smallest visual that makes the change clear, before/after evidence that it works, and a merge-danger call (one-way or two-way door, plus blast radius).
- **[wizard](./skills/engineering/wizard/SKILL.md)**: Generate an interactive bash wizard that walks a human through steps only they can perform: provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover.

### Productivity

General workflow tools, not code-specific.

**User-invoked**

- **[grill-me](./skills/productivity/grill-me/SKILL.md)**: Get relentlessly interviewed about a plan or design until every branch of the design tree is resolved.
- **[handoff](./skills/productivity/handoff/SKILL.md)**: Compact the current conversation into a handoff document so another agent can continue the work.
- **[teach](./skills/productivity/teach/SKILL.md)**: Teach the user a new skill or concept over multiple sessions, using the current directory as a stateful teaching workspace.
- **[to-questionnaire](./skills/productivity/to-questionnaire/SKILL.md)**: Turn a decision you can't answer alone into a Markdown questionnaire for the one person who can, filled in async, or together over a meeting. It grills you about the send (who it's for, what you need back), not the subject.
- **[wait-what](./skills/productivity/wait-what/SKILL.md)**: Fire this the moment a message doesn't land. The agent re-pitches it with the context you're missing, in plain English, using your `GLOSSARY.md` vocabulary.

**Model-invoked**

- **[grilling](./skills/productivity/grilling/SKILL.md)**: Interview the user relentlessly about a plan, decision, or idea until every branch of the design tree is resolved. The reusable interview primitive behind `grill-me`, `grill-with-docs`, `triage`, `wayfinder` and `improve-codebase-architecture`.
- **[writing-for-agents](./skills/productivity/writing-for-agents/SKILL.md)**: Writing documents for agents: skills, AGENTS.md/CLAUDE.md, and any doc an agent reaches by a pointer.

## License & attribution

MIT License — Copyright (c) 2026 Matt Pocock. See [LICENSE](./LICENSE).

This repository is a fork of [mattpocock/skills](https://github.com/mattpocock/skills). The skills, documentation, and their commit history are upstream's; only the changes made in this fork are ours, and they are recorded as separate commits on top of the unmodified upstream history.
