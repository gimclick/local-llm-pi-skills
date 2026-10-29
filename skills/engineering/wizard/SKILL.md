---
name: wizard
description: Generate an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover. Don't invoke this for steps the agent can perform itself.
---

# Wizard

A **wizard** is a bash script that walks a human, step by step, through a manual procedure that's tedious to do by hand and tedious to re-explain to an AI every time. It opens each URL, says exactly what to click and copy, captures the values, writes them where they belong (`.env`, GitHub secrets), confirms at every stage, and shows how many stages are left. It might configure third-party services, run a one-off migration, or move the project from one state to another.

The delightful UX is already solved by [template.sh](template.sh): stage-by-stage progress, confirmation gates, cross-platform URL opening (including WSL), hidden secret entry, idempotent `.env` upserts, `gh secret`/`gh variable` writes, and a closing summary. **Your job is only to scope the procedure and author its stages.** The library above the `STAGES` marker is identical in every wizard; that consistency is the point: never hand-edit it.

A wizard is ephemeral by default: built for one run, saved to a scratch or `scripts/` path, deleted when the job's done. Commit it only when the user wants a repeatable setup path that should live in the repo.

## Process

### 1. Scope the procedure

Work out every manual step the human must take and every value that gets captured along the way. Read the repo first, don't ask cold:

- For setup: `.env`, `.env.example`, `.env.*`, `README`, `docker-compose*`, framework config, and `.github/workflows/*` (every `secrets.*` / `vars.*` reference is a value the wizard must produce).
- For a migration or transition: the current state, the target state, and the irreversible actions between them.

Then show the user the ordered list of stages and the values each produces, and confirm: they may add, drop, or reorder.

**Done when:** every stage is named in order, and for each captured value you know (a) where the human gets it, (b) where it's written (`.env`, a GitHub secret, both, or nowhere; some stages are pure actions), and (c) whether it's secret (hidden entry) or public.

### 2. Map each stage's journey

For each stage, write the precise path a human follows: which URL to open, what to do there, where a value is shown, which variable it fills: e.g. "Dashboard → Developers → API keys → Reveal test key → copy". Where you don't actually know the current UI or the exact command, say so and ask the user or check the docs: never invent steps that may not exist.

**Done when:** every stage traces to concrete instructions a stranger could follow.

### 3. Author the wizard

Copy `template.sh` to the target path. Replace the example stage with one `stage` per step, in dependency order. Use the library helpers: `stage`, `say`/`step`, `open_url`, `ask`/`ask_secret`, `write_env`, `set_secret`/`set_var`, `pause`/`confirm`. Set `TOTAL_STAGES` to the number of stages you wrote.

Hold the bar the template sets: open the URL before asking for its value, use `ask_secret` for anything secret, `write_env` every persisted value, `set_secret` only the values CI actually needs, and `confirm` before any irreversible action. Each `stage` clears the screen so only the current step is visible: keep a stage to one focused task so nothing the human needs scrolls away. Don't touch the library above the marker.

### 4. Verify and hand off

- `bash -n <script>`; run `shellcheck` if available.
- `chmod +x <script>`.
- Don't run it end-to-end yourself: it opens browsers and blocks on human input. Trace it statically instead: every value from step 1 is captured and lands where step 1 said, and every `set_secret` name exactly matches a `secrets.*` reference in CI.
- Tell the user how to run it. If it's a repeatable setup path, commit it and link it from the README so the next person runs the script instead of asking an AI.

## Pi execution and authorization

This skill writes a script and stops. It never runs one, and this fork's shell cannot run it: `ask`, `ask_secret`, `pause`, and `confirm` read from stdin, so in the agent's non-interactive shell they get EOF, `set -euo pipefail` aborts the run, and nothing is captured. Upstream's "Don't run it end-to-end yourself" stays upstream's rule; this section says only what Pi can and cannot do around it.

- **The run belongs to the human's terminal.** Hand over the exact command to run, and the directory to run it in. A partial run here is not a substitute for the real one: a stage that hits EOF fails quietly, so a trace run in this session proves nothing about a run there. What upstream's step 4 asks for here (`bash -n`, `shellcheck` where available, `chmod +x`) is non-interactive shell work, and it runs as written.
- **The script lands where the human will run it.** Upstream's "a scratch or `scripts/` path" resolves to the OS temp directory (`$TMPDIR`, else `/tmp`) for a throwaway wizard, or the target project's `scripts/` for one that is kept. Never this checkout, never the installed package clone, never beside the loaded `SKILL.md`.
- **The values land where the script is run, not where it was written.** `ENV_FILE="${ENV_FILE:-.env}"` is relative to the current directory, so the hand-off names the working directory as well as the command. The agent writes no `.env` and runs no `gh` itself.
- **The browser is the human's.** `open_url` opens in the human's shell. This session opens no URL and inspects no rendered page, so a stage's click path comes from the human or from the docs, which is upstream's rule in step 2, and no report claims a rendered inspection.
- **Persistent writes need the human.** Before the first file, state the write set: the script path, and where each captured value will go. Wait for the answer. Upstream's "commit it and link it from the README" is a commit plus a tracked-file edit: separately authorized, and not implied by this skill deciding the path is repeatable. `gh secret` and `gh variable` writes happen inside the human's run, so they stay the human's too.
- **Nothing here delegates.** One live model request at a time: scope, map, author, and verify in this session.
