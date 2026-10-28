export type DocSection = {
  pageTitle: string;
  pageUrl: string | null;
  heading: string;
  text: string;
};

export type DocHit = DocSection & { score: number };

const STOPWORDS = new Set(
  "a an and are as at be by can do does for from how i in is it of on or the to what when where which with you your my".split(
    " ",
  ),
);

const cleanHeading = (line: string) =>
  line
    .replace(/^#+\s*/, "")
    .replace(/\\\./g, ".")
    .replace(/\[([^\]]*)\]\(<?[^)>]*>?\)/g, "$1")
    .replace(/&amp;/g, "&")
    .trim();

// Page URLs from llms.txt, in file order: "- [Title](<https://…/page/index.md>): …"
export function parseLlmsIndex(llmsTxt: string): string[] {
  const urls: string[] = [];
  for (const line of llmsTxt.split("\n")) {
    const m = line.match(/^- \[[^\]]*\]\(<?([^)>\s]+)>?\)/);
    if (m) urls.push(m[1].replace(/index\.md$/, ""));
  }
  return urls;
}

// llms-full.txt is the site intro, then every page from llms.txt in order, each
// starting with its H1. Section labels from llms.txt are empty H1s and are skipped.
export function parseFullText(full: string, pageUrls: string[]): DocSection[] {
  const lines = full.split("\n");
  type Page = { title: string; lines: string[] };
  const pages: Page[] = [];
  let current: Page | null = null;
  let inFence = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && line.startsWith("# ")) {
      current = { title: cleanHeading(line), lines: [] };
      pages.push(current);
      continue;
    }
    current?.lines.push(line);
  }

  const nonEmpty = pages.filter((p) => p.lines.join("\n").trim());
  const [, ...docPages] = nonEmpty;
  const urlsMatch = docPages.length === pageUrls.length;

  const sections: DocSection[] = [];
  docPages.forEach((page, i) => {
    const pageUrl = urlsMatch ? pageUrls[i] : null;
    let heading = page.title;
    let buf: string[] = [];
    let fence = false;
    const flush = () => {
      const text = buf.join("\n").trim();
      if (text) sections.push({ pageTitle: page.title, pageUrl, heading, text });
      buf = [];
    };
    for (const line of page.lines) {
      if (/^\s*(```|~~~)/.test(line)) fence = !fence;
      if (!fence && /^#{2,3} /.test(line)) {
        flush();
        heading = cleanHeading(line);
        continue;
      }
      buf.push(line);
    }
    flush();
  });
  return sections;
}

export const tokenize = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9_.@/-]+/)
    .map((t) => t.replace(/^[.\-/]+|[.\-/]+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

export function searchSections(
  sections: DocSection[],
  query: string,
  maxResults: number,
): DocHit[] {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length) return [];

  const docs = sections.map((s) => ({
    s,
    title: tokenize(`${s.pageTitle} ${s.heading}`),
    body: tokenize(s.text),
  }));
  const n = docs.length;
  const df = new Map<string, number>();
  for (const t of terms)
    df.set(t, docs.filter((d) => d.title.includes(t) || d.body.includes(t)).length);

  const hits: DocHit[] = [];
  for (const d of docs) {
    let score = 0;
    let matched = 0;
    for (const t of terms) {
      const tf = d.body.filter((x) => x === t).length;
      const inTitle = d.title.includes(t);
      if (!tf && !inTitle) continue;
      matched++;
      const idf = Math.log(1 + n / (1 + (df.get(t) ?? 0)));
      score += idf * ((tf ? 1 + Math.log(tf) : 0) + (inTitle ? 3 : 0));
    }
    if (!matched) continue;
    score *= matched / terms.length;
    hits.push({ ...d.s, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

export function formatHits(hits: DocHit[], maxChars: number): string {
  return hits
    .map((h, i) => {
      const where = h.heading === h.pageTitle ? h.pageTitle : `${h.pageTitle} › ${h.heading}`;
      const text = h.text.length > maxChars ? `${h.text.slice(0, maxChars).trimEnd()} …` : h.text;
      return `## ${i + 1}. ${where}\n${h.pageUrl ? `Source: ${h.pageUrl}\n` : ""}\n${text}`;
    })
    .join("\n\n---\n\n");
}
