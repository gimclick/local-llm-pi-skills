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

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (database id, as in **Blocking** below). Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Blocking**: GitHub's **native issue dependencies**, the canonical, UI-visible representation. Add an edge with `gh issue create --blocked-by <n>,<n> ...` or `gh issue edit <child> --add-blocked-by <blocker>` (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Count open blockers**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` (open blockers only; 0 means startable). `gh issue view <n> --json blockedBy` also lists closed blockers, so filter it: `--jq '[.blockedBy.nodes[] | select(.state == "OPEN")] | length'`.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: post the explanation with `gh issue comment <number> --body "..."`, then `gh issue close <number>`. On an already-closed issue, `gh issue close --comment` drops the comment and still exits 0.
- **Create an issue**: `gh issue create -R <owner>/<repo> --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> -R <owner>/<repo> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list -R <owner>/<repo> --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> -R <owner>/<repo> --body "..."`
- **Edit an issue body**: `gh issue edit <number> -R <owner>/<repo> --body-file <file>` (`-F`; `-` reads standard input). The body replaces **whole**, so treat it as an edit and not a rewrite: read the current body first (`gh issue view <n> -R <owner>/<repo> --json body`), change only the section you mean, and pass the whole amended body back. Never pass a body written from memory, and never drop a section you did not read. `--body` (the inline string) is for a body short enough to hold exactly; a multi-line body goes through a file, with a heredoc when you are writing that file in the shell.
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

**Parentage is not one rule for every ticket.** The parent says what kind of ticket the child is:

- A `wayfinder:map` issue's children are **decision tickets**: questions whose answer is a decision. That is the whole membership of the map, and nothing else gets to join it.
- An **implementation ticket** is a child of the **spec it was cut from**, never of the Wayfinder map that spec was synthesised from. The map is the spec's origin, so cite and link it from the spec or the ticket body; do not re-parent. A build slice filed under the map reads as a decision the map made, and the map's Decisions-so-far would then claim the route walked through work it never took.
- Where the spec landed as a **committed file** rather than an issue, implementation tickets are **standalone issues**: there is no issue to file them under. Do not open one to hold them, and do not open one to duplicate the spec: the file is the spec, and a second copy on the tracker is a second document to keep in sync. Cite it from each ticket body with the repository-relative path plus a commit-pinned permalink to the version cut from.
- Never attach an implementation ticket to a `wayfinder:map` issue. The map's children are decision tickets only, and a build slice filed under the map reads as a decision the map made, so its Decisions-so-far would claim a route it never walked. The map is the spec's origin: cite and link it from the spec or the ticket body, do not re-parent.
- A separate **implementation umbrella** issue is allowed only when the user has explicitly approved it, and is never created automatically. When approved, it holds the tickets and names which spec file is canonical.
- Where the source was an **existing issue**, its tickets are children of it, as above. The one exception is a Wayfinder decision map, which never takes an implementation child.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number>`, then `gh pr view <number> --comments` (off a TTY, `--comments` prints only the comments, not the body), and `gh pr diff <number>` for the diff.
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
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Sub-issue** above). Only **decision tickets** belong here; the map never takes an implementation child (see **Parentage** above). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
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
- **Resolve**: `gh issue comment <n> -R <owner>/<repo> --body "<answer>"`, then `gh issue close <n> -R <owner>/<repo>`, then append a context pointer (gist + link) to the map's Decisions-so-far, using the **Edit an issue body** operation above so the rest of the map body survives unchanged.

## Capability validation

GitHub offers no switch to ask whether sub-issues or native blocking are on for a repo — both are validated by doing. Validate against a real issue: `gh issue view <n> -R <owner>/<repo> --json parent,subIssues,blockedBy` returns `{nodes: [], totalCount: 0}` when the field is supported and errors (401/404/451, or a "repository has disabled issues" message) when the repo or account cannot do it. A repo with no issues yet cannot be preflighted at all without creating a test issue; record the capability as **unverified** and let the fallbacks above carry it until the first real ticket proves it.

### Clearing a capability marker

A marker is a placeholder for an observation, and a real operation replaces it. When one succeeds, that capability is no longer unverified:

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Make an issue a sub-issue of a parent**). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: see **Blocking** under Conventions.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (see **Count open blockers**, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me`, the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.
- **What counts as proof:** the operation ran against a real issue and produced its effect, not merely an empty field. Creating a child and seeing it in the parent's `subIssues`, adding a blocking edge and reading it back in `blockedBy` or `blocking`, taking the live gate from `issue_dependencies_summary`, publishing a map child, closing a ticket with its resolution comment.
- **How to record it:** in the **unverified** note for that capability, replace the marker with what was seen: the command, the issue it ran against, and the field that came back. Keep the note naming the capability, so a reader can still tell which operation the observation covers.
- **Clear one marker at a time.** Every other warning, fallback, and gate in this file stays put: a capability proven on this repo is not proven on the next one, and the fallbacks are what carry an unproven repo. An operation that errors proves nothing; record the error and leave the marker in place.
