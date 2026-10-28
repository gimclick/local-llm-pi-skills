#!/usr/bin/env node
// Checks this fork's Pi registration invariants. Dependency-free: node:fs only.
// Reads package.json's `pi.skills` array and the skill folders it names on disk.
// Only reads: it changes nothing, and it never runs another harness's CLI.
// Exit 0 when every invariant holds, 1 with each failure listed.
//
// The metadata reads below are line scans, not a YAML parser. They are scoped
// to the shapes this repo actually uses, and every path through them fails
// closed: an unrecognised or duplicated value is reported as a failure, never
// defaulted to "model-invoked", which is the silent answer a loose regex gives.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const fail = (message) => {
  failures.push(message);
};

// --- metadata helpers -------------------------------------------------

const splitLines = (text) => text.replace(/^\uFEFF/, "").split(/\r?\n/);

// The frontmatter block: lines between the opening `---` on the first line and
// the next line that is `---` on its own. null when absent or unterminated.
function frontmatter(lines) {
  if (lines.length < 3 || !/^---[ \t]*$/.test(lines[0])) return null;
  for (let i = 1; i < lines.length; i += 1) {
    if (/^---[ \t]*$/.test(lines[i])) return lines.slice(1, i);
  }
  return null;
}

// Every `key: value` occurrence in a block, indent-tolerant, with its index.
function collect(lines, key) {
  const pattern = new RegExp(`^[ \\t]*${key}:[ \\t]*(.*)$`);
  const found = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = pattern.exec(lines[i]);
    if (match) found.push({ index: i, raw: match[1] });
  }
  return found;
}

// A line that carries indented text: a block-scalar body, in this repo's shape.
const hasIndentedText = (line) => /^[ \t]+\S/.test(line);

// A YAML boolean, tolerating one layer of quotes. null means "not a boolean".
function parseBool(raw) {
  const value = raw.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

// The `policy:` blocks of agents/openai.yaml: `policy:` at column 0 plus the
// blank and indented lines under it. Scoped so a stray key elsewhere in the
// file cannot decide the answer.
function policyBlocks(lines) {
  const blocks = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^policy:[ \t]*$/.test(lines[i])) continue;
    const block = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      if (/^[ \t]*$/.test(lines[j]) || /^[ \t]/.test(lines[j])) block.push(lines[j]);
      else break;
    }
    blocks.push(block);
  }
  return blocks;
}

// Read one boolean out of a block. Returns true or false for the parsed value,
// "absent" when the key is missing (the caller decides what that means), or
// null when it is unreadable, in which case the reason is recorded.
function readBool(lines, key, where) {
  const found = collect(lines, key);
  if (found.length === 0) return "absent";
  if (found.length > 1) {
    fail(`${key} appears ${found.length} times in ${where}; the invocation pairing cannot be read from a duplicate key.`);
    return null;
  }
  const value = parseBool(found[0].raw);
  if (value === null) {
    fail(`${key} in ${where} is "${found[0].raw.trim()}", which is neither true nor false; refusing to guess the invocation.`);
  }
  return value;
}

// --- 1. package.json parses, and declares pi.skills as an array of strings.

let pkg;
try {
  pkg = JSON.parse(readFileSync(join(repo, "package.json"), "utf8"));
} catch (err) {
  console.error(`package.json is not readable JSON: ${err.message}`);
  process.exit(1);
}

const declared = pkg.pi && pkg.pi.skills;
if (!declared) {
  console.error("package.json declares no pi.skills array. This fork must register its Pi skills.");
  process.exit(1);
}
if (!Array.isArray(declared)) {
  console.error("package.json pi.skills is not an array.");
  process.exit(1);
}
if (declared.length === 0) {
  console.error("package.json pi.skills is empty. This fork must register its Pi skills.");
  process.exit(1);
}
if (declared.some((entry) => typeof entry !== "string")) {
  console.error("package.json pi.skills contains a non-string entry.");
  process.exit(1);
}

// --- 2. Registered paths are explicit, repo-relative, inside the repo, unique.
// Pi accepts globs and `!exclusions` in this array, but a glob cannot be
// checked against disk here, so this fork keeps every entry explicit.

const firstIndexOf = new Map();
const valid = [];
for (let i = 0; i < declared.length; i += 1) {
  const entry = declared[i];
  if (!entry.startsWith("./")) {
    fail(`pi.skills entry "${entry}" is not a repo-relative path (must start with "./").`);
    continue;
  }
  if (/[!*?[\]]/.test(entry)) {
    fail(`pi.skills entry "${entry}" is a glob or exclusion; this fork registers explicit paths, which are the only ones this check can verify.`);
    continue;
  }
  const abs = join(repo, entry.slice(1));
  if (abs !== repo && !abs.startsWith(repo + "/")) {
    fail(`pi.skills entry "${entry}" resolves outside the repository (${abs}).`);
    continue;
  }
  if (firstIndexOf.has(entry)) {
    fail(`pi.skills registers "${entry}" twice (rows ${firstIndexOf.get(entry) + 1} and ${i + 1}).`);
    continue;
  }
  firstIndexOf.set(entry, i);
  valid.push({ entry, abs });
}

// --- 3. Each path holds a SKILL.md whose frontmatter carries the name Pi
// advertises and a description it routes on.
// --- 4. Invocation metadata agrees across SKILL.md frontmatter and openai.yaml.

let userInvoked = 0;
let modelInvoked = 0;
for (const { entry, abs } of valid) {
  const skillMd = join(abs, "SKILL.md");

  let raw;
  try {
    raw = readFileSync(skillMd, "utf8");
  } catch (err) {
    fail(`pi.skills entry "${entry}" has no readable SKILL.md at ${skillMd}.`);
    continue;
  }

  const folder = abs.slice(repo.length + 1).split("/").pop();
  const block = frontmatter(splitLines(raw));
  if (block === null) {
    fail(`${entry} SKILL.md has no frontmatter block, or one left unterminated; Pi advertises it by name and description.`);
    continue;
  }

  const names = collect(block, "name");
  if (names.length === 0) {
    fail(`${entry} SKILL.md frontmatter has no name field.`);
  } else if (names.length > 1) {
    fail(`${entry} SKILL.md frontmatter has ${names.length} name fields; the invocation pairing cannot be read from a duplicate.`);
  } else {
    const name = names[0].raw.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
    if (name === "") {
      fail(`${entry} SKILL.md frontmatter has an empty name field.`);
    } else if (name !== folder) {
      fail(`${entry} SKILL.md name "${name}" does not match its folder "${folder}"; Pi advertises the name, so the registered path and the loaded skill disagree.`);
    }
  }

  const descs = collect(block, "description");
  if (descs.length === 0) {
    fail(`${entry} SKILL.md frontmatter has no description field; Pi routes on it.`);
  } else if (descs.length > 1) {
    fail(`${entry} SKILL.md frontmatter has ${descs.length} description fields.`);
  } else {
    const value = descs[0].raw.trim();
    const hasBlockBody = block.slice(descs[0].index + 1).some(hasIndentedText);
    if (value === "" || (/^[|>]/.test(value) && !hasBlockBody)) {
      fail(`${entry} SKILL.md description carries no text; Pi routes on it, so an empty one is a failure.`);
    }
  }

  const dm = readBool(block, "disable-model-invocation", `${entry} SKILL.md frontmatter`);
  if (dm === null) continue; // unreadable: already reported, and not counted
  const userInvokedHere = dm === true;

  const yamlPath = join(abs, "agents", "openai.yaml");
  let yaml;
  try {
    yaml = readFileSync(yamlPath, "utf8");
  } catch (err) {
    fail(`${entry} has no agents/openai.yaml; every skill carries Codex UI metadata beside its SKILL.md.`);
    continue;
  }
  const yamlLines = splitLines(yaml);
  const blocks = policyBlocks(yamlLines);
  const policyLines = blocks.flat();
  const ai = readBool(policyLines, "allow_implicit_invocation", `${entry} agents/openai.yaml policy block`);
  if (ai === null) continue;
  const stray = collect(yamlLines, "allow_implicit_invocation").length - collect(policyLines, "allow_implicit_invocation").length;
  if (stray > 0) {
    fail(`${entry} agents/openai.yaml carries allow_implicit_invocation outside a policy: block; the pairing is unreadable.`);
    continue;
  }
  // The key reads the other way round: allow_implicit_invocation: false is what
  // makes a skill user-invoked. Absent means the model can reach it.
  const yamlUserInvoked = ai === false;

  if (userInvokedHere !== yamlUserInvoked) {
    fail(`${entry} disagrees with itself: SKILL.md says ${userInvokedHere ? "user-invoked" : "model-invoked"}, agents/openai.yaml says the other. A skill is user-invoked in both or neither.`);
  }
  if (userInvokedHere) userInvoked += 1;
  else modelInvoked += 1;
}

console.log(`pi.skills: ${declared.length} registered (${userInvoked} user-invoked, ${modelInvoked} model-invoked).`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Pi registration invariants hold: manifest parses, paths unique and explicit, each SKILL.md present with matching name, description and invocation metadata.");
console.log("This check covers Pi only. Claude plugin validation is a separate, conditional step (see AGENTS.md).");
