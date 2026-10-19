# Repository instructions

`AGENTS.md` is the contributor-instruction entry point for the harnesses that read it: Pi, Codex, and other harnesses that follow the `AGENTS.md` convention. Claude Code reads [CLAUDE.md](./CLAUDE.md) instead, and never this file. Each file points at the other, so the shared rules are reachable from either.

**Identify the harness you are actually running in before you act, and do not assume it.** The sections below are labelled **all harnesses** or **Pi only**. A Pi-only rule applies when the running harness is Pi; in any other harness it does not, and the shared upstream guidance applies instead. This fork's target harness is Pi (see [README.md](./README.md)), so most maintenance here happens in Pi, but a session can open this repo in another harness, and a rule that belongs to Pi must not be applied there.

This file is fork-local. Upstream keeps `AGENTS.md` as a symlink to `CLAUDE.md`; this fork replaced that symlink with the harness-aware instructions above, and left `CLAUDE.md` upstream's own, unchanged.

## Shared upstream instructions (all harnesses)

[CLAUDE.md](./CLAUDE.md) holds the upstream contributor rules for this repo. Read it before editing; it owns the bucket layout, the promoted-set rule, the README and bucket README format, the docs-page requirement and its template, the `ask-matt` router rule, the no-em-dash rule, and the triage-label note. This file does not restate those rules and does not replace them.

Do not delete, rewrite, or trim `CLAUDE.md`: it is upstream's, and Claude plugin compatibility depends on it.

**Precedence:** where a rule in `CLAUDE.md` names a Claude Code workflow that does not apply to the harness you are running in, the rule here wins. That happens in three places, and only these three. Everywhere else `CLAUDE.md` applies unchanged, in every harness.

1. **Manifest validation (all harnesses).** `CLAUDE.md` says to run `claude plugin validate . --strict` after touching either Claude manifest. That command validates the Claude registration surface only, and needs the Claude CLI. Run it only when the change actually touches a Claude artifact (`.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, or skill frontmatter the Claude plugin reads), and only when `command -v claude` finds the CLI. Never install the CLI, and never treat its absence as a failure of this fork: a missing Claude CLI is not a validation failure here. Say that it was skipped and why.
2. **Skill registration (all harnesses).** `CLAUDE.md` describes one registration surface, `.claude-plugin/plugin.json`. This fork has two, below.
3. **Execution (Pi only).** Upstream instructions and skill text assume a harness that can fan out subagents. Pi sessions in this fork run under one inference slot, below.

## Two registration surfaces (all harnesses)

| Surface | Harness | Selects | Now |
| --- | --- | --- | --- |
| `package.json` → `pi.skills` | Pi | this fork's Pi skills | 11 |
| `.claude-plugin/plugin.json` → `skills` | Claude Code, and Codex/Copilot/VS Code reading the same manifests | the promoted set | 27 |

They are independent lists. A skill in one is not in the other: Pi loads eleven, Claude ships 27, and the gap is deliberate, not drift. Changing one does not license changing the other, and a change in this fork does not add or remove Claude skills just to keep the lists aligned. Counts move only when a change deliberately registers or promotes a skill; name the list that changed in the changeset. [README.md](./README.md) lists the Pi set; the bucket READMEs and `README.md` list the promoted set.

## Validation

- **Running in Pi (always):** `node scripts/check-pi-registration.mjs`, or `npm run check-pi-registration`. It reads `package.json` and the folders `pi.skills` names, and checks that the manifest parses as an array of strings, that every path is explicit, repo-relative, inside the repo, and unique, that each path holds a `SKILL.md`, that each frontmatter `name` matches its folder and carries a description, and that the invocation pairing agrees across `disable-model-invocation` in the frontmatter and `policy.allow_implicit_invocation` in that skill's `agents/openai.yaml`. It only reads, needs nothing beyond Node, and fails closed: an unterminated frontmatter, a duplicated key, or a value that is not a clean boolean is reported rather than defaulted.
- **Claude artifacts (any harness, conditional):** `claude plugin validate . --strict`, per `CLAUDE.md`, only under the rule above.
- **Release/version (all harnesses):** `npm run check-plugin-version` keeps `package.json` and `.claude-plugin/plugin.json` on the same version. [ADR 0002](./.agents/adr/0002-ship-as-a-claude-code-plugin.md) records why that invariant exists.

## Pi only: execution constraint

Local inference here is limited to **one active model session at a time**. Do the work in this session, sequentially. Do not delegate to subagents by default: no fan-out, no background runs, no parallel children. Where a skill's own text describes delegation, treat it as one foreground run that this session waits for, and where the reading is small do the reading in the parent instead. Never let two model sessions be live at once.

## Pi only: skill loading

- Skill availability is checked, not assumed: ask Pi for its resolved skill list rather than inferring from a `SKILL.md` on disk or from the `<available_skills>` block, which hides user-invoked skills.
- A model-invoked skill is loaded by reading its `SKILL.md`; a user-invoked skill (`disable-model-invocation: true`) is reachable only by the human typing `/skill:<name>`. Pi has no Skill tool.

## Fork-specific (all harnesses)

- This fork's Pi manifest is `package.json` → `pi.skills`; the eleven skills it names are listed in [README.md](./README.md). The skills it does not name are present in the tree as upstream material and are not loaded in Pi.
- Do not probe for Claude, Codex, or any other harness executable to satisfy a check this fork does not need.
