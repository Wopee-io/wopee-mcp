// Run with: node --test src/tools/wopee_search_docs/search.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { parseFullText, parseLlmsIndex, searchSections, formatHits } from "./search.ts";

const LLMS = `# Wopee.io

## Get started

- [Quickstart](<https://docs.wopee.io/ai-agent/index.md>): first test
- [Playwright](<https://docs.wopee.io/playwright-visual-testing/index.md>): wopee.pw
`;

const FULL = `# Wopee.io

Intro text.

# Get started

# Getting started

Your first AI test.

## 1\\. Sign in to [Wopee Commander](<https://cmd.wopee.io>)

Sign in with GitHub, GitLab or Google.

# Playwright

Add visual checks.

## 3\\. Install

\`\`\`shell
# not a heading
npm i -D @wopee-io/wopee.pw
\`\`\`

## Configuration

Set WOPEE_PROJECT_UUID and WOPEE_API_KEY.
`;

test("parseLlmsIndex returns page URLs in order", () => {
  assert.deepEqual(parseLlmsIndex(LLMS), [
    "https://docs.wopee.io/ai-agent/",
    "https://docs.wopee.io/playwright-visual-testing/",
  ]);
});

test("parseFullText maps pages to URLs and ignores headings in code", () => {
  const sections = parseFullText(FULL, parseLlmsIndex(LLMS));
  assert.deepEqual(
    sections.map((s) => [s.pageTitle, s.heading, s.pageUrl]),
    [
      ["Getting started", "Getting started", "https://docs.wopee.io/ai-agent/"],
      ["Getting started", "1. Sign in to Wopee Commander", "https://docs.wopee.io/ai-agent/"],
      ["Playwright", "Playwright", "https://docs.wopee.io/playwright-visual-testing/"],
      ["Playwright", "3. Install", "https://docs.wopee.io/playwright-visual-testing/"],
      ["Playwright", "Configuration", "https://docs.wopee.io/playwright-visual-testing/"],
    ],
  );
  assert.match(sections[3].text, /# not a heading/);
});

test("parseFullText drops URLs when the page count does not match", () => {
  const sections = parseFullText(FULL, ["https://docs.wopee.io/ai-agent/"]);
  assert.ok(sections.every((s) => s.pageUrl === null));
});

test("searchSections ranks the section that names the term", () => {
  const sections = parseFullText(FULL, parseLlmsIndex(LLMS));
  const hits = searchSections(sections, "How do I set WOPEE_PROJECT_UUID?", 3);
  assert.equal(hits[0].heading, "Configuration");
  assert.equal(searchSections(sections, "install playwright", 1)[0].heading, "3. Install");
  assert.deepEqual(searchSections(sections, "the of and", 3), []);
});

test("formatHits prints title, source and a trimmed excerpt", () => {
  const sections = parseFullText(FULL, parseLlmsIndex(LLMS));
  const out = formatHits(searchSections(sections, "sign in", 1), 10);
  assert.match(out, /^## 1\. Getting started › 1\. Sign in to Wopee Commander\nSource: https:\/\/docs\.wopee\.io\/ai-agent\//);
  assert.match(out, / …$/);
});
