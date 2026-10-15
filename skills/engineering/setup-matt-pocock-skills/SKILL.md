---
name: setup-matt-pocock-skills
description: "Configure this repo for the engineering skills: set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills."
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker**: where issues live (GitHub by default; local markdown is also supported out of the box)
- **Triage labels**: the strings used for the five canonical triage roles
- **Domain docs**: where `GLOSSARY.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` and `.git/config`: which GitHub repos do the remotes point at? A fork normally has `origin` (the fork) plus `upstream` (the original), and issues belong to one of them, not either automatically. Note which remote the current branch pushes to.
- GitHub capability, when a GitHub remote exists: `gh repo view <owner>/<repo> --json hasIssuesEnabled,viewerPermission,viewerCanAdminister` — is Issues enabled on that repo, and can the signed-in account write? (`gh repo view` takes the repo as an argument, not `-R`.)
- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist? Is there already an `## Agent skills` section in either?
- `GLOSSARY.md` and `GLOSSARY-MAP.md` at the repo root
- `docs/adr/` and any `src/*/docs/adr/` directories
- `docs/agents/`: read what is actually there, file by file. A partial set (only `triage-labels.md`, say) is **not** completed setup: the sections whose files are missing are still unconfigured, and the ones present may hold choices that differ from the seed templates. Read them before re-offering a section.
- `.scratch/`: a sign that a local-markdown issue tracker convention is already in use
- Is the `triage` skill installed? (a `triage` skill folder alongside this one, or `triage` in your available skills.) This decides whether Section B runs at all.
- Monorepo signals: a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. These are present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order. One section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the section entirely when exploration already settled it (Section B when `triage` isn't installed, Section C when there's no monorepo).

**Section A: Issue tracker.**

> Explainer: The "issue tracker" is where issues live for this repo. Skills like `to-tickets`, `triage`, and `to-spec` read from and write to it. They need to know whether to call `gh issue create`, write a markdown file under `.scratch/`, or follow some other workflow you describe. Pick the place you actually track work for this repo.

Default posture: these skills were designed for GitHub. If a `git remote` points at GitHub, propose that — but **name the `OWNER/REPO` you are proposing and have the user confirm it** before anything else in this section. When several remotes point at GitHub, `origin` is the usual answer for a fork (issues live on the fork, not on `upstream`), but ambiguity is the user's to settle, never yours to guess.

Before proposing GitHub, check it can take issues: `gh repo view <owner>/<repo> --json hasIssuesEnabled,viewerPermission,viewerCanAdminister`. If `hasIssuesEnabled` is false — **forks start with Issues disabled**, so expect this on one — say so and offer the user a choice: enable them (a repository settings change, `gh repo edit <owner>/<repo> --enable-issues`, only with explicit approval) or use the local-markdown tracker. If the account cannot write, GitHub is not available to it: report the permission and offer local markdown.

Then offer:

- **GitHub**: issues live in the repo's GitHub Issues (uses the `gh` CLI)
- **GitLab**: issues live in the repo's GitLab Issues (uses the [`glab`](https://gitlab.com/gitlab-org/cli) CLI)
- **Local markdown**: issues live as files under `.scratch/<feature>/` in this repo (good for solo projects or repos without a remote)
- **Other** (Jira, Linear, etc.): ask the user to describe the workflow in one paragraph; the skill will record it as freeform prose

Record the choice in `docs/agents/issue-tracker.md`, and record the confirmed `OWNER/REPO` in the GitHub/GitLab templates' **Target repository** line — downstream skills pass it as `-R` instead of re-inferring it from the remotes. The GitHub and GitLab templates carry a "PRs as a request surface" flag, defaulted **off**. Leave it off and don't raise it: a user who wants external PRs in the triage queue can flip the flag in the file later.

**Section B: Triage label vocabulary.** Skip this section entirely if the `triage` skill isn't installed (exploration told you), since an uninstalled skill needs no labels.

If it is installed, ask exactly one question:

> Do you want to keep the default triage labels? (recommended: **yes**)

The defaults are the five canonical roles, each label string equal to its name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. On **yes**, write them as-is. Only if the user says no, usually because their tracker already uses other names (e.g. `bug:triage` for `needs-triage`), collect the overrides so `triage` applies existing labels instead of creating duplicates.

**Section B1: Wayfinder labels.** Skip this section entirely when the `wayfinder` skill isn't installed. Wayfinder's map and tickets carry labels of their own — `wayfinder:map` plus `wayfinder:<type>` for `research`/`prototype`/`grilling`/`task` — never a triage label. Read what the tracker already has (`gh label list -R <owner>/<repo> --json name --jq '[.[].name]'`, or the matching `glab` command), name the missing ones to the user, and create them **only** once the user has approved tracker setup and the Section A check showed the account can create labels. Ask before creating; a label is a permanent addition to the tracker.

**Section C: Domain docs.** Default to **single-context** (one `GLOSSARY.md` + `docs/adr/` at the repo root). This fits almost every repo; write it without asking.

Offer **multi-context** (a root `GLOSSARY-MAP.md` pointing to per-context `GLOSSARY.md` files) only when exploration found monorepo signals. Then confirm which layout they want.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited (see step 4 for selection rules)
- The contents of `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, and `docs/agents/triage-labels.md` (the last only when `triage` is installed)

Let them edit before writing.

### 4. Write

**Pick the file to edit:**

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, ask the user which one to create; don't pick for them.

Never create `AGENTS.md` when `CLAUDE.md` already exists (or vice versa); always edit the one that's already there.

If an `## Agent skills` block already exists in the chosen file, update its contents in-place rather than appending a duplicate. Don't overwrite user edits to the surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

Include the `### Triage labels` sub-block, and write `docs/agents/triage-labels.md`, only when `triage` is installed and Section B ran. When it isn't, both are omitted.

Labels are writes, so gate them: create only the ones the tracker lacks, only after the user has approved tracker setup, and only where the Section A check showed the account can create labels — otherwise report the permission and leave the vocabulary in `docs/agents/` for the user to apply later. This covers both the triage vocabulary from Section B and the Wayfinder labels from Section B1. On GitHub pass the target explicitly: `gh label create -R <owner>/<repo> <name> -c <6-hex>` (or `gh label edit` to recolour an existing one); on GitLab use the matching `glab` label command.

If the clone has more than one GitHub remote, ask the user before running `gh repo set-default <owner>/<repo>`: it pins the target in `.git/config`, which is a change to the clone, not just a note in the docs.

Then write the docs files using the seed templates in this skill folder as a starting point:

- [issue-tracker-github.md](./issue-tracker-github.md): GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md): GitLab issue tracker
- [issue-tracker-local.md](./issue-tracker-local.md): local-markdown issue tracker
- [triage-labels.md](./triage-labels.md): label mapping (only if `triage` is installed)
- [domain.md](./domain.md): domain doc consumer rules + layout

For "other" issue trackers, write `docs/agents/issue-tracker.md` from scratch using the user's description.

Fill each template's **Target repository** line with the confirmed `OWNER/REPO`, and mark any capability the setup could not check — GitHub sub-issues and native blocking have no preflight that avoids touching a real issue — as **unverified** in the file rather than assuming it works. The templates carry fallbacks for exactly that case; an unverified capability runs through them until the first real ticket proves it.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit `docs/agents/*.md` directly later; re-running this skill is only necessary if they want to switch issue trackers or restart from scratch.
