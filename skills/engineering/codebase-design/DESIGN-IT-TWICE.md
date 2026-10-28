# Design It Twice

When the user wants to explore alternative interfaces for a chosen deepening candidate, use this parallel sub-agent pattern. Based on "Design It Twice" (Ousterhout): your first idea is unlikely to be the best.

Uses the vocabulary in [SKILL.md](SKILL.md): **module**, **interface**, **seam**, **adapter**, **leverage**.

## Process

### 1. Frame the problem space

Before spawning sub-agents, write a user-facing explanation of the problem space for the chosen candidate:

- The constraints any new interface would need to satisfy
- The dependencies it would rely on, and which category they fall into (see [DEEPENING.md](DEEPENING.md))
- A rough illustrative code sketch to ground the constraints, not a proposal, just a way to make the constraints concrete

Show this to the user, then immediately proceed to Step 2. The user reads and thinks while the sub-agents work in parallel.

### 2. Spawn sub-agents

Spawn 3+ sub-agents in parallel. Each must produce a **radically different** interface for the deepened module.

Prompt each sub-agent with a separate technical brief (file paths, coupling details, dependency category from [DEEPENING.md](DEEPENING.md), what sits behind the seam). The brief is independent of the user-facing problem-space explanation in Step 1. Give each agent a different design constraint:

- Agent 1: "Minimize the interface: aim for 1–3 entry points max. Maximise leverage per entry point."
- Agent 2: "Maximise flexibility: support many use cases and extension."
- Agent 3: "Optimise for the most common caller: make the default case trivial."
- Agent 4 (if applicable): "Design around ports & adapters for cross-seam dependencies."

Include both [SKILL.md](SKILL.md) vocabulary and GLOSSARY.md vocabulary in the brief so each sub-agent names things consistently with the architecture language and the project's domain language.

Each sub-agent outputs:

1. Interface (types, methods, params, plus invariants, ordering, error modes)
2. Usage example showing how callers use it
3. What the implementation hides behind the seam
4. Dependency strategy and adapters (see [DEEPENING.md](DEEPENING.md))
5. Trade-offs: where leverage is high, where it's thin

### 3. Present and compare

Present designs sequentially so the user can absorb each one, then compare them in prose. Contrast by **depth** (leverage at the interface), **locality** (where change concentrates), and **seam placement**.

After comparing, give your own recommendation: which design you think is strongest and why. If elements from different designs would combine well, propose a hybrid. Be opinionated: the user wants a strong read, not a menu.

## Running it where parallel sub-agents are unavailable (Pi, this fork)

The method above is upstream's, and it is what to run wherever the harness gives each sub-agent its own independent context. Where it does not, keep the same shape and run the alternatives sequentially in the current session:

- Keep three or more **radically different** interfaces, and keep a different design constraint on each one: minimize the interface, maximize flexibility, optimize the most common caller, and design around ports and adapters where a cross-seam dependency exists.
- Keep the same output contract per alternative: the interface (types, methods and params, plus invariants, ordering and error modes), a usage example, what the implementation hides behind the seam, the dependency strategy and adapters from [DEEPENING.md](DEEPENING.md), and where leverage is thin.
- Present, compare, recommend and hybridize exactly as Step 3 says, on **depth**, **locality** and **seam placement**, with the same opinionated read.

State the limit rather than paper over it. Alternatives written in one session are **not independent**: each later one is written with the earlier ones already in the window, and separate context windows are what buy the radical difference this technique asks for. Say the run is a sequential fallback, not upstream's method, and never present it as equivalent to it.

A single delegated agent, run one at a time, is an optional way to get one genuinely separate perspective. It is authorized per design task by the human, never automatic here, and one agent yields two independent designs rather than upstream's three or more.
