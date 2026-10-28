---
name: diagnosing-bugs
description: Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow.
---

# Diagnosing Bugs

A discipline for hard bugs. Skip phases only when explicitly justified.

When exploring the codebase, read `GLOSSARY.md` (if it exists) to get a clear mental model of the relevant modules, and check ADRs in the area you're touching.

## Redact

This skill has you show commands, outputs and captured artifacts. **Redact every secret first**: write `<REDACTED>` in its place. Build loops against env vars, so the credential stays in the environment rather than in what you show. Captured artifacts carry auth headers: quote only the lines that carry the signal.

If the redacted output is not enough to diagnose the bug, say so and ask the user.

## Pi execution and authorization

This fork runs one inference slot. The constraint is on model sessions, not on the commands you run.

- **One live model request at a time.** No delegated agents, no background agent inference, no second model session beside this one.
- **Test and process concurrency is allowed and expected.** Running the loop, looping a flaky trigger, running old-version and new-version side by side, and running a parallel test runner are ordinary shell work. Nothing here forbids them.
- **Bound the expensive loops.** For stress testing, fuzzing, repeated flaky reproduction, and performance measurement: choose an iteration or time bound appropriate to the task before you start (there is no universal number), put a timeout on each run so a hang cannot stall the session, seed any randomness and report the seed, and report the observed reproduction rate and the measurement conditions (repetitions, machine noise, what else was running) rather than assuming them. A flake measured at 40 reds in 100 runs is a 40% reproduction rate, and a fix verified against that repro is verified at that rate, not as a certainty.
- **Do not interfere with what the human owns.** Do not kill, restart, or take over a server, process, port, or terminal the human started. Ask them for the command, the port, or the state they have.

**Investigating is authorized; editing persistent files is not.** A request to diagnose a bug authorizes reading, running loops, and building bounded experiments in scratch space: a temp directory, a throwaway harness, a replayed capture, a copied module. It does not authorize editing tracked source, a test file, or project configuration. Before the first such edit, including Phase 4 instrumentation that lands inside project code, state the write set once: the files you intend to change, and which Phase 3 prediction or Phase 5 fix each one serves. Wait for the human's answer. One approval covers the whole set; do not re-ask per edit inside it. Where the answer has not arrived, stop at the diagnosis and hand over the findings plus the intended write set.

**Bisection needs explicit authorization.** `git bisect` moves the working tree across commits and leaves the repository mid-operation. Do not enter or run a bisect sequence unless the human authorized it. Before asking them: report `git status --short` and the current branch, name exactly which Git state will change, and give the cleanup (`git bisect reset`, plus anything else you touched). Prefer a manual "boot at state X, check, repeat" harness that runs without moving the tree. No force-push, no amend, no branch created or switched, and no destructive Git operation without the human's approval.

## Phase 1: Build a feedback loop

**This is the skill.** Everything else is mechanical. If you have a **tight** pass/fail signal for the bug (one that goes red on _this_ bug), you will find the cause; bisection, hypothesis-testing, and instrumentation all just consume it. If you don't have one, no amount of staring at code will save you.

Spend disproportionate effort here. **Be aggressive. Be creative. Refuse to give up.**

### Ways to construct one, in roughly this order

1. **Failing test** at whatever seam reaches the bug: unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture input, diffing stdout against a known-good snapshot.
4. **Headless browser script** (Playwright / Puppeteer) that drives the UI and asserts on DOM/console/network.
5. **Replay a captured trace.** Save a real network request / payload / event log to disk; replay it through the code path in isolation.
6. **Throwaway harness.** Spin up a minimal subset of the system (one service, mocked deps) that exercises the bug code path with a single function call.
7. **Property / fuzz loop.** If the bug is "sometimes wrong output", run 1000 random inputs and look for the failure mode.
8. **Bisection harness.** If the bug appeared between two known states (commit, dataset, version), automate "boot at state X, check, repeat" so you can `git bisect run` it.
9. **Differential loop.** Run the same input through old-version vs new-version (or two configs) and diff outputs.
10. **HITL bash script.** Last resort. If a human must click, drive _them_ with the template beside this skill so the loop is still structured. Captured output feeds back to you. See [HITL capture in Pi](#hitl-capture-in-pi) for how to run it here.

Build the right feedback loop, and the bug is 90% fixed.

### Tighten the loop

Treat the loop as a product. Once you have _a_ loop, **tighten** it:

- Can I make it faster? (Cache setup, skip unrelated init, narrow the test scope.)
- Can I make the signal sharper? (Assert on the specific symptom, not "didn't crash".)
- Can I make it more deterministic? (Pin time, seed RNG, isolate filesystem, freeze network.)

A 30-second flaky loop is barely better than no loop; a 2-second deterministic one is tight, a debugging superpower.

### Non-deterministic bugs

The goal is not a clean repro but a **higher reproduction rate**. Loop the trigger 100×, parallelise, add stress, narrow timing windows, inject sleeps. A 50%-flake bug is debuggable; 1% is not, so keep raising the rate until it's debuggable.

Stay inside the bounds above: pick the count before you start, seed the randomness and report the seed, and state the rate you actually observed. The rate is evidence, not an expectation.

### HITL capture in Pi

The template lives beside this skill: `scripts/hitl-loop.template.sh` relative to the directory holding this `SKILL.md`. Resolve it against that directory, never against the current working directory: the project under debug is usually not this repository.

Pi's agent shell is non-interactive. The template reads from stdin with `read -r -p` under `set -euo pipefail`, so running it through the agent's shell gets EOF, aborts the script, and captures nothing. Do not run it there, and do not feed it simulated input.

Instead:

1. Copy or edit the template's steps into the one scenario you need, and give the human the exact command to run in their own terminal: `bash <resolved-script-path>`.
2. Take the captured `KEY=VALUE` block back from them through the conversation, redacted as above.
3. Where one round-trip is enough, ask that one question in chat and keep the script as the structure of the capture.

A captured value is evidence the human supplied. Never invent one, never predict one, and never paraphrase one as if it were observed.

### When you genuinely cannot build a loop

Stop and say so explicitly. List what you tried. Ask the user for: (a) access to whatever environment reproduces it, (b) a redacted captured artifact (HAR file, log dump, core dump, screen recording with timestamps), or (c) permission to add temporary production instrumentation. Do **not** proceed to hypothesise without a loop.

### Completion criterion: a tight loop that goes red

Phase 1 is done when the loop is **tight** and **red-capable**: you can name **one command** (a script path, a test invocation, a curl) that you have **already run at least once** (show the invocation and its output, redacted), and that is:

- [ ] **Red-capable**: it drives the actual bug code path and asserts the **user's exact symptom**, so it can go red on this bug and green once fixed. Not "runs without erroring"; it must be able to _catch this specific bug_.
- [ ] **Deterministic**: same verdict every run (flaky bugs: a pinned, high reproduction rate, per above).
- [ ] **Fast**: seconds, not minutes.
- [ ] **Agent-runnable**: you can run it unattended; a human in the loop only through the HITL capture above.

If you catch yourself reading code to build a theory before this command exists, **stop: jumping straight to a hypothesis is the exact failure this skill prevents.** No red-capable command, no Phase 2.

## Phase 2: Reproduce + minimise

Run the loop. Watch it go red as the bug appears.

Confirm:

- [ ] The loop produces the failure mode the **user** described, not a different failure that happens to be nearby. Wrong bug = wrong fix.
- [ ] The failure is reproducible across multiple runs (or, for non-deterministic bugs, reproducible at a high enough rate to debug against).
- [ ] You have captured the exact symptom (error message, wrong output, slow timing) so later phases can verify the fix actually addresses it.

### Minimise

Once it's red, shrink the repro to the **smallest scenario that still goes red**. Cut inputs, callers, config, data, and steps **one at a time**, re-running the loop after each cut, and keep only what's load-bearing for the failure.

Why bother: a minimal repro shrinks the hypothesis space in Phase 3 (fewer moving parts left to suspect) and becomes the clean regression test in Phase 5.

Done when **every remaining element is load-bearing**: removing any one of them makes the loop go green.

Do not proceed until you have reproduced **and** minimised.

## Phase 3: Hypothesise

Generate **3–5 ranked hypotheses** before testing any of them. Single-hypothesis generation anchors on the first plausible idea.

Each hypothesis must be **falsifiable**: state the prediction it makes.

> Format: "If <X> is the cause, then <changing Y> will make the bug disappear / <changing Z> will make it worse."

If you cannot state the prediction, the hypothesis is a vibe: discard or sharpen it.

**Show the ranked list to the user before testing.** They often have domain knowledge that re-ranks instantly ("we just deployed a change to #3"), or know hypotheses they've already ruled out. Cheap checkpoint, big time saver. Don't block on it; proceed with your ranking if the user is AFK.

## Phase 4: Instrument

Each probe must map to a specific prediction from Phase 3. **Change one variable at a time.**

Tool preference:

1. **Debugger / REPL inspection** if the env supports it. One breakpoint beats ten logs.
2. **Targeted logs** at the boundaries that distinguish hypotheses.
3. Never "log everything and grep".

**Tag every debug log** with a unique prefix, e.g. `[DEBUG-a4f2]`. Cleanup at the end becomes a single grep. Untagged logs survive; tagged logs die.

**A probe inside project code is a persistent edit.** It belongs to the write set the human approved before the first edit, like any other change to tracked source. A probe that can live in a scratch harness, a copied module, or a wrapper without touching project files is the cheaper move: prefer it, and say where each probe landed, so the human can see what is temporary and what is not.

**Perf branch.** For performance regressions, logs are usually wrong. Instead: establish a baseline measurement (timing harness, `performance.now()`, profiler, query plan), then bisect. Measure first, fix second.

## Phase 5: Fix + regression test

Write the regression test **before the fix**, but only if there is a **correct seam** for it.

A correct seam is one where the test exercises the **real bug pattern** as it occurs at the call site. If the only available seam is too shallow (single-caller test when the bug needs multiple callers, unit test that can't replicate the chain that triggered the bug), a regression test there gives false confidence.

**If no correct seam exists, that itself is the finding.** Note it. The codebase architecture is preventing the bug from being locked down. Flag this for the next phase.

If a correct seam exists:

1. Turn the minimised repro into a failing test at that seam.
2. Watch it fail. If you forced the red by mutating code or a fixture, `diff` against a pristine copy to prove the mutation landed before you trust it.
3. Apply the fix.
4. Watch it pass.
5. Re-run the Phase 1 feedback loop against the original (un-minimised) scenario.

The test file and the fix are persistent edits: they sit in the write set, and its approval comes before the first of them, not after. Where no approval has arrived, stop at the diagnosis: report the ranked hypotheses, the one the evidence supports, the repro command, and the write set the fix would need.

## Phase 6: Cleanup

Required before declaring done:

- [ ] Original repro no longer reproduces (re-run the Phase 1 loop)
- [ ] Regression test passes (or absence of seam is documented)
- [ ] All `[DEBUG-...]` instrumentation removed (`grep` the prefix)
- [ ] Throwaway prototypes deleted (or moved to a clearly-marked debug location)
- [ ] The hypothesis that turned out correct is stated in the commit / PR message, so the next debugger learns

The run ends there. A proposed commit message is part of the report; the commit itself, a push, and a pull request are each separately authorized, and none of them happens because the diagnosis finished.
