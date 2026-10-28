import { fetch } from "undici";
import { ToolName } from "../shared/types.js";
import { formatHits, parseFullText, parseLlmsIndex, searchSections, type DocSection } from "./search.js";
import { WopeeSearchDocsInput, WopeeSearchDocsInputSchema } from "./schema.js";

const DOCS_URL = "https://docs.wopee.io";
const CACHE_MS = 60 * 60 * 1000;
const EXCERPT_CHARS = 1500;

let cache: { at: number; sections: DocSection[] } | null = null;

const textResult = (text: string) => ({
  content: [{ type: "text" as const, text }],
});

async function getText(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`);
  return res.text();
}

async function loadSections(): Promise<DocSection[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.sections;
  const [index, full] = await Promise.all([
    getText(`${DOCS_URL}/llms.txt`),
    getText(`${DOCS_URL}/llms-full.txt`),
  ]);
  const sections = parseFullText(full, parseLlmsIndex(index));
  cache = { at: Date.now(), sections };
  return sections;
}

export const wopeeSearchDocs = {
  name: ToolName.WOPEE_SEARCH_DOCS,
  config: {
    title: "Search the Wopee.io docs",
    description:
      "Search the Wopee.io documentation (docs.wopee.io, from its llms-full.txt) and return the best matching sections with their page URL. Use it for questions about setup, configuration, environment variables, integrations (Playwright, Cypress, WebdriverIO, Robot Framework), MCP clients, CI, concepts and troubleshooting, before guessing. Read-only, needs no API key, and does not touch the project. Results are cached for an hour.",
    inputSchema: WopeeSearchDocsInputSchema.shape,
  },
  handler: async (input: WopeeSearchDocsInput) => {
    try {
      const sections = await loadSections();
      const hits = searchSections(sections, input.query, input.maxResults ?? 5);
      if (!hits.length)
        return textResult(
          `No section of the Wopee.io docs matches "${input.query}". Try other words, or browse ${DOCS_URL}/llms.txt.`,
        );
      return textResult(formatHits(hits, EXCERPT_CHARS));
    } catch (error) {
      return textResult(
        `Could not search the Wopee.io docs: ${error instanceof Error ? error.message : String(error)}. The docs are at ${DOCS_URL}.`,
      );
    }
  },
};
