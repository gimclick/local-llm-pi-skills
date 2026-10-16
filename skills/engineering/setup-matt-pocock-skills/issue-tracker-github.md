# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Target repository

**Target repository: `<owner>/<repo>`** _(filled in by `/setup-matt-pocock-skills`, with the user confirming the repo — leave the placeholder alone until it is.)_

- Pass it explicitly on every issue, PR, and label command: `-R <owner>/<repo>`. It costs nothing, and it stops a mis-pointed remote from writing into the wrong repo.
- A fork usually carries two GitHub remotes: `origin` (the fork, where its issues live) and `upstream` (the original, where they do not). Prefer `origin`; when the remotes disagree about which repo is meant, ask — never pick silently.
- `gh` resolves the repo from the remotes when `-R` is omitted, and several GitHub remotes make that ambiguous. Pin it once, with the user's approval: `gh repo set-default <owner>/<repo>`.
- `gh repo view` is the exception: it takes the repo as an argument (`gh repo view <owner>/<repo>`), not `-R`.
- **Issues availability**: `gh repo view <owner>/<repo> --json hasIssuesEnabled,viewerPermission,viewerCanAdminister`. Forks start with Issues disabled, so `hasIssuesEnabled: false` is normal on one; enabling them (`gh repo edit <owner>/<repo> --enable-issues`) is a repository settings change and needs the user's approval. Where Issues are off or the account cannot write, the local-markdown tracker is the supported fallback.

## Conventions

- **Create an issue**: `gh issue create -R <owner>/<repo> --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> -R <owner>/<repo> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list -R <owner>/<repo> --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> -R <owner>/<repo> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> -R <owner>/<repo> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> -R <owner>/<repo> --comment "..."`
- **Read the labels that exist**: `gh label list -R <owner>/<repo> --json name --jq '[.[].name]'`. Create only what the tracker lacks, and only once the user has approved it: `gh label create -R <owner>/<repo> <name> -c <6-hex>` (`gh label edit` recolours an existing one). Needs an account that can write; report the permission instead of trying when it cannot.

## Dependencies

Sub-issue linking and native blocking belong to the tracker, not to wayfinding alone: `/to-tickets` publishes implementation tickets in the same shape (each a sub-issue of its source issue, blockers as native edges). Keep these operations here so every ticket skill reuses one definition.

- **Sub-issue**: `gh issue create -R <owner>/<repo> --parent <parent> ...` at creation, or `gh issue edit -R <owner>/<repo> <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+; check `gh --version` when in doubt). Both take issue **numbers or URLs**. Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-database-id>`. Without sub-issues, put `Part of #<parent>` at the top of the child body and list the child in the parent's task list.
- **Blocking edge**: `gh issue edit -R <owner>/<repo> <child> --add-blocked-by <blocker>`, or `--blocked-by` / `--blocking` on `gh issue create`. Numbers or URLs — no database ids. Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-database-id>`, where the database id comes from `gh api repos/<owner>/<repo>/issues/<n> --jq .id` (not the `#number`, not the `node_id`). Where native blocking is unavailable, put a `Blocked by: #<n>, #<n>` line at the top of the child body.
- **Read the edges**: `gh issue view <n> -R <owner>/<repo> --json blockedBy,blocking,parent,subIssues,subIssuesSummary` — `blockedBy`, `blocking`, and `subIssues` each come back as `{nodes, totalCount}`; `subIssuesSummary` as `{total, completed, percentCompleted}`. `gh issue list --json` carries the same fields.
- **`totalCount` is an edge count, not a live gate**: `gh` asks GitHub for `blockedBy(first:50)` with no state argument, so `blockedBy.totalCount` counts **every** dependency edge — closed blockers included. It is never the number of unresolved blockers. Each node carries `state`, so the open-only count is `[.blockedBy.nodes[] | select(.state == "OPEN")] | length`: a ticket is blocked only while that is ≥ 1, and `0` means startable. Keep closed edges in place — they record what was resolved; deleting an edge to make a ticket ready erases the dependency.
- **The exact gate**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` — open blockers only, `0` means startable (`total_blocked_by` beside it is the all-edges count, closed included). Prefer this over counting `--json` nodes: `gh`'s selection is capped at 50 nodes (`first:50`), so when `totalCount > 50` the `nodes` array is truncated and the OPEN filter silently undercounts. Guard with `(nodes | length) >= totalCount`; when that fails, read the gate from `issue_dependencies_summary` or page the edges with `gh api --paginate "repos/<owner>/<repo>/issues/<n>/dependencies/blocked_by"`.
- A ticket is unblocked when every blocker is closed.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets; the **Sub-issue** and **Blocking edge** operations above are the ones it uses, with the map as parent.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create -R <owner>/<repo> --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Sub-issue** above). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitHub's **native issue dependencies**, the canonical, UI-visible representation — the **Blocking edge** operation above, applied to map children. `blockedBy` is **not** the live gate: it lists every edge, closed blockers included, and `blockedBy.totalCount` counts them all. The gate is the open-only count — `[.blockedBy.nodes[] | select(.state == "OPEN")] | length`, or `issue_dependencies_summary.blocked_by` from `gh api` — and a ticket is blocked while that is ≥ 1. Where dependencies aren't available, fall back to the `Blocked by: #<n>, #<n>` body line. A ticket is unblocked when every blocker is closed; the closed edges stay in place.
- **Frontier query**: the candidates are **this map's children only**. Never a bare `gh issue list` — it returns the repo's open issues, map and unrelated issues alike, and stops at its `--limit` default of 30 with no `--paginate`, so it silently drops children. Retrieve the children, then filter:

  ```bash
  # children of <map>: every page, in the map's own sub-issue order
  gh api --paginate "repos/<owner>/<repo>/issues/<map>/sub_issues" \
    --jq '[ .[] | select(.state == "open") | select((.assignees | length) == 0) | {number, title} ]'
  ```

  `--paginate` walks every page (the endpoint pages at 100). The endpoint returns only children, so the map issue itself can never enter the frontier — and never offer it as a ticket. Keep the returned order: it is the map's order, and the first survivor wins.
  Then drop each survivor that is still blocked, one gate per number: `gh api repos/<owner>/<repo>/issues/<child> --jq .issue_dependencies_summary.blocked_by` — drop the child when it is > 0. Where sub-issues aren't enabled, page the body convention instead: `gh api --paginate -X GET search/issues -f q='is:issue is:open repo:<owner>/<repo> "Part of #<map>" in:body'`, ordered by the map body's task list, and read the `Blocked by` line for the gate. The search API caps at 1000 results: if it hits the cap, say so and stop rather than assume the frontier is complete.
- **Claim**: `gh issue edit <n> -R <owner>/<repo> --add-assignee @me`, the session's first write.
- **Resolve**: `gh issue comment <n> -R <owner>/<repo> --body "<answer>"`, then `gh issue close <n> -R <owner>/<repo>`, then append a context pointer (gist + link) to the map's Decisions-so-far.

## Capability validation

GitHub offers no switch to ask whether sub-issues or native blocking are on for a repo — both are validated by doing. Validate against a real issue: `gh issue view <n> -R <owner>/<repo> --json parent,subIssues,blockedBy` returns `{nodes: [], totalCount: 0}` when the field is supported and errors (401/404/451, or a "repository has disabled issues" message) when the repo or account cannot do it. A repo with no issues yet cannot be preflighted at all without creating a test issue; record the capability as **unverified** and let the fallbacks above carry it until the first real ticket proves it.
