// Writes the tool and prompt list of skills/wopee/SKILL.md from the definitions the server
// registers (build/tools, build/prompts). `--check` fails instead of writing when the file is
// stale. Run through `npm run skill` / `npm run check:skill`, which build first.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { TOOLS } from "../build/tools/index.js";
import { PROMPTS } from "../build/prompts/index.js";

const SKILL = fileURLToPath(new URL("../skills/wopee/SKILL.md", import.meta.url));
const START = "<!-- generated:tools start (npm run skill) -->";
const END = "<!-- generated:tools end -->";

/** The first sentence, not cut at "e.g." or "i.e.". */
const firstSentence = (text) => {
  const re = /\.(?:\s|$)/g;
  let m;
  while ((m = re.exec(text))) {
    const head = text.slice(0, m.index + 1);
    if (!/\b(?:e\.g|i\.e)\.$/.test(head)) return head;
  }
  return text.trim();
};

const access = (name) => (/^wopee_(fetch_|read_|setup_check$)/.test(name) ? "read" : "write");
const cell = (text) => text.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

const generated = [
  START,
  "",
  `### Tools (${TOOLS.length})`,
  "",
  "| Tool | Access | What it does |",
  "| --- | --- | --- |",
  ...TOOLS.map(
    ({ name, config }) =>
      `| \`${name}\` | ${access(name)} | ${cell(firstSentence(config.description))} |`,
  ),
  "",
  `### Prompts (${PROMPTS.length})`,
  "",
  "| Prompt | What it does |",
  "| --- | --- |",
  ...PROMPTS.map(
    ({ name, config }) => `| \`${name}\` | ${cell(firstSentence(config.description))} |`,
  ),
  "",
  END,
].join("\n");

const current = readFileSync(SKILL, "utf-8");
const start = current.indexOf(START);
const end = current.indexOf(END);
if (start === -1 || end === -1 || end < start) {
  console.error(`${SKILL}: the ${START} / ${END} markers are missing`);
  process.exit(1);
}
const next = current.slice(0, start) + generated + current.slice(end + END.length);

if (process.argv.includes("--check")) {
  if (next !== current) {
    console.error(
      "skills/wopee/SKILL.md lists tools or prompts that differ from src/. Run `npm run skill` and commit the result.",
    );
    process.exit(1);
  }
  console.log(`skills/wopee/SKILL.md is up to date (${TOOLS.length} tools, ${PROMPTS.length} prompts)`);
} else {
  writeFileSync(SKILL, next);
  console.log(`skills/wopee/SKILL.md written (${TOOLS.length} tools, ${PROMPTS.length} prompts)`);
}
