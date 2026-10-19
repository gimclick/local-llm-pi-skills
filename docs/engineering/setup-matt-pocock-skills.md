> **This fork (Pi adaptation):** this skill is user-invoked — type `/skill:setup-matt-pocock-skills`; no agent can fire it. Its GitHub tracker template is adapted (explicit target repo, capability checks, gated label writes) and **has been exercised end to end on GitHub**: tracker setup, labels, map children published as native sub-issues, blocking edges read back, a ticket resolved and closed, and publication of the cleared map through `/skill:to-spec` all ran. Other tracker backends remain untested. The shared runtime contract is in [the README](../../README.md).

## What it does

Upstream, `setup-matt-pocock-skills` answers three questions about one repo: where issues live, what the triage labels are called, and where the domain docs sit. It records the answers as markdown files under `docs/agents/`. This fork adds a fourth — the `wayfinder` label vocabulary — and records the confirmed target repository with the tracker choice.

Those files are the only thing that varies between repos. The skills themselves are identical everywhere. They read `docs/agents/issue-tracker.md` at run time and do what it says. That is why the set is not tied to GitHub, and why you never edit a skill file to point it at another tracker. Invoking it with "link the skills to a custom issue tracker" works with anything you can connect to programmatically, with no changes to the skills.

It is a prompt-driven skill, not a deterministic script. It reads your `git remote`, `CLAUDE.md` and `GLOSSARY.md`, proposes what it found, and waits for you to confirm before it writes anything. In this fork it also reads a **GitHub capability check** (`gh repo view <owner>/<repo> --json hasIssuesEnabled,viewerPermission,viewerCanAdminister`) before it proposes GitHub, and it reads an existing partial `docs/agents/` set file by file rather than assuming a missing file means "not started".

## When to reach for it

You invoke this by typing `/skill:setup-matt-pocock-skills` in Pi; the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) won't reach for it on its own. Its metadata marks it non-invokable on purpose (`disable-model-invocation: true`), so no other skill can fire it for you — in Pi that also means it is absent from the agent's `<available_skills>` block, so nothing but a human typing the command can load it.

Reach for it once per repo, before the first use of any other engineering skill. If [triage](https://aihero.dev/skills-triage), [to-spec](https://aihero.dev/skills-to-spec), [to-tickets](https://aihero.dev/skills-to-tickets) or [wayfinder](https://aihero.dev/skills-wayfinder) start guessing where your issues go, or apply labels your tracker doesn't have, this repo has not been set up yet. You can run it in a repo halfway through a project. The skill reads what is already there, so no earlier work is lost.

## Prerequisites

It writes into the repo you run it in:

| It writes | Where |
| --- | --- |
| `issue-tracker.md` | `docs/agents/` |
| `domain.md` | `docs/agents/` |
| `triage-labels.md` | `docs/agents/`, only when the `triage` skill is installed |
| An `## Agent skills` block | whichever of `CLAUDE.md` or `AGENTS.md` already exists |

In this fork, `issue-tracker.md` also carries a **Target repository** line (`owner/repo`) that you confirm during setup, and any capability the setup could not check is marked **unverified** in the file. That marker is a placeholder for an observation: when a real operation proves the capability on this repo, the file records the command and what it returned in place of the marker, one capability at a time, and the other warnings and fallbacks stay put. Downstream skills pass the target as `-R` instead of re-inferring it from the remotes.

You commit all of it as markdown. There is no user-level or global mode. The config lives in the repo, so every repo gets its own copy.

## The decisions it makes

It starts each section with the recommended answer, and skips any question its exploration already answered. Most runs need only two confirmations.

| Decision | What it proposes | When it asks |
| --- | --- | --- |
| **Issue tracker** | the one matching your `git remote` | always, because this is the one real choice |
| **Triage labels** | keep the five canonical names (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) | only if the `triage` skill is installed |
| **Wayfinder labels** | `wayfinder:map` plus `wayfinder:<type>` for `research`/`prototype`/`grilling`/`task` | only if the `wayfinder` skill is installed (this fork's Section B1) |
| **Domain docs** | single-context: one `GLOSSARY.md` plus `docs/adr/` at the root | only if it spots monorepo signals, and then it offers a multi-context `GLOSSARY-MAP.md` |

The tracker options:

| Option | Where issues live | Needs |
| --- | --- | --- |
| **GitHub** | the repo's GitHub Issues | the `gh` CLI, Issues enabled on the named repo, and an account that can write |
| **GitLab** | the repo's GitLab Issues | the `glab` CLI |
| **Local markdown** | files under `.scratch/<feature>/` in this repo | nothing, not even a remote |
| **Other** | wherever you say | one paragraph from you describing the workflow |

The first three ship as templates in the skill and work out of the box. Local markdown is a full option, not a fallback. The skill supports a solo project with no remote. One caveat: don't use local markdown if you use GitHub. They are alternatives, so pick one.

In this fork, GitHub is proposed only after two checks you confirm rather than assume. First, **name the `owner/repo`** and have you confirm it: a fork normally has `origin` (the fork, where its issues live) plus `upstream` (the original, where they do not), and ambiguity is yours to settle, never the agent's to guess. Second, **can that repo take issues**: `hasIssuesEnabled` is false on a fresh fork, so expect it on one. Enabling them (`gh repo edit <owner>/<repo> --enable-issues`) is a repository settings change and needs your approval; where Issues are off or the account cannot write, local markdown is the supported fallback.

"Other" is a full option too. It is how Jira, Linear, Azure DevOps and Beads all work. You describe the workflow, the skill records your prose in `docs/agents/issue-tracker.md`, and the downstream skills follow the prose. Users have already built this: a Jira-over-[MCP](https://www.aihero.dev/ai-coding-dictionary/mcp) variant, a Gitea CLI shaped like `gh`, a hand-built local dashboard.

## Common questions

**Do I have to use GitHub?**

No. GitHub, GitLab and local markdown under `.scratch/` all ship as ready-made templates, and anything else works through the "other" path. This is the most-repeated question, in roughly these words: *"hard locked to github"*, *"can I use GitLab / Jira"*, *"what about Azure DevOps"*. The answer is always the same: setup chooses the tracker, not the skill.

**Do I need to re-run it after updating the skills?**

The direct answer after v1.1 was yes. The skill's own closing message is softer. It tells you to re-run only to switch trackers or start over. Both are defensible. The seed templates change between versions, so a `docs/agents/issue-tracker.md` from an older release can go out of date against the skills that now read it. If a downstream skill does something different from what the docs describe, re-run setup. It is cheap.

**It wrote to `CLAUDE.md`, but I'm on Codex.**

This is a known gap, and still open. The file-selection rule is "edit `CLAUDE.md` if it exists, else `AGENTS.md`". It checks which file exists, not which [harness](https://www.aihero.dev/ai-coding-dictionary/harness) is running. In a repo with a `CLAUDE.md` left over from Claude Code, the skill writes its `## Agent skills` block to a file Codex never reads. Users have two workarounds: move the block to `AGENTS.md` by hand, or keep `AGENTS.md` canonical and make `CLAUDE.md` a one-line pointer at it. If neither file exists, the skill asks you which to create instead of picking one. This has confused people who expected it to decide.

**It didn't create my triage labels.**

Upstream it doesn't. `docs/agents/triage-labels.md` is a *mapping*: it tells `/triage` which strings in your tracker correspond to the five canonical roles, and it does not run `gh label create`. On a fresh GitHub repo the labels do not exist yet, and users have filed this as a bug more than once. Two consequences upstream:

- If your tracker already uses the canonical names, the mapping is an identity table and there is nothing to configure. That is the intended common case, not a missing step.
- Upstream also creates none of [wayfinder](https://aihero.dev/skills-wayfinder)'s `wayfinder:map` or `wayfinder:<type>` labels, and `gh issue create --label <missing>` fails instead of creating one. People create them by hand before the first wayfinder run.

**In this fork it does create them, behind a gate.** Labels are writes, so they are gated three ways: only the labels the tracker already lacks, only after you have approved tracker setup, and only where the capability check showed the account can create labels. Otherwise it reports the permission and leaves the vocabulary in `docs/agents/` for you to apply later. This covers both the triage vocabulary and the Wayfinder labels (this fork's Section B1, which runs only when `wayfinder` is installed). On GitHub the target is passed explicitly: `gh label create -R <owner>/<repo> <name> -c <6-hex>`.

One more fork-only gate: with more than one GitHub remote, it asks before running `gh repo set-default <owner>/<repo>`, because that pins the target in `.git/config` — a change to the clone, not just a note in the docs.

**GitHub sub-issues and blocking came out marked unverified. Do I re-run setup to clear that?**

No. GitHub has no switch that reports whether sub-issues or native blocking are on for a repo, and no preflight that avoids touching a real issue, so setup records the honest state instead of guessing. The marker clears the first time a real operation proves the capability on that repo: the operation, the issue it ran against, and the field that came back are written into `docs/agents/issue-tracker.md` in place of that marker, one capability at a time, with the file's other warnings and fallbacks left intact. An operation that errors proves nothing and leaves the marker in place. Re-run setup only to switch trackers or start over.

**Can I configure the other skills' behaviour here ([grilling](https://www.aihero.dev/ai-coding-dictionary/grilling) cadence, question format, tone)?**

No. It configures the tracker, the label vocabularies (triage, and Wayfinder's in this fork), and the doc layout — plus the target repository the tracker writes into. Users have asked to make it the place for per-user preferences. The answer is that skills stay opinionated and take no per-user config. Preferences belong in your `CLAUDE.md` as plain instructions, which every skill already reads.

**Can I keep the config in `~/.claude` instead of committing it to every repo?**

Not today. A user who runs the skills across many repos has an open request for this, but no user-level mode exists. Every repo carries its own `docs/agents/`.

**Isn't it strange to have a skill that configures the other skills?**

One long-standing complaint says yes, in these words: *"having a skill to set up the other skill does not feel right to me: that means the LLM is configuring its own skills."* The trade-off is real. Without a setup step, every skill that touches issues would need its own copy of the tracker instructions. The output is markdown you can read and edit, and that limits the risk. You can read every file it wrote and change it by hand. Make day-to-day changes that way, not with another run.

## It's working if

- `docs/agents/issue-tracker.md` and `docs/agents/domain.md` exist, plus `triage-labels.md` if `triage` is installed.
- An `## Agent skills` section appears in the instruction file your harness reads, with a one-line summary pointing at each of those files.
- The tracker it proposed matches the remote you use, its **Target repository** line names the `owner/repo` you confirmed, and the label strings match labels that exist in your tracker.
- Any capability setup could not check (GitHub sub-issues and native blocking have no preflight that avoids touching a real issue) is marked **unverified** in the file, not assumed to work, and becomes a recorded observation the first time a real operation proves it.
- Afterwards, `/to-tickets` publishes without asking you where issues live, and `/triage` applies labels rather than inventing them.
- Nothing in the skill files themselves changed. If setup edited a `SKILL.md`, something went wrong.

## Where it fits

`setup-matt-pocock-skills` is the **run-once setup** for the engineering flow, the precondition everything else assumes rather than a step in the chain. Its neighbours are its readers: [triage](https://aihero.dev/skills-triage), which applies the label vocabulary written here; [to-spec](https://aihero.dev/skills-to-spec) and [to-tickets](https://aihero.dev/skills-to-tickets), which publish into the tracker named here; and [wayfinder](https://aihero.dev/skills-wayfinder), which reads the "Wayfinding operations" section of the same tracker file to learn how to store maps and child [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket). [domain-modeling](https://aihero.dev/skills-domain-modeling) later fills in the domain-doc layout that setup records. It creates `GLOSSARY.md` and ADRs only when you resolve a term or decision, so a repo with no domain docs after setup is normal. For which skill to reach for next, [ask-matt](https://aihero.dev/skills-ask-matt) routes the whole set.
