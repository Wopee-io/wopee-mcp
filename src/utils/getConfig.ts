// Where wopee-mcp finds its credentials, so an agent's MCP config can be a key-free
// `npx -y wopee-mcp`. Only node: imports, so it loads under `node --test` in strip-only mode.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";

const DEFAULT_API_URL = "https://api.wopee.io";
const FILE_KEYS = [
  "WOPEE_API_URL",
  "WOPEE_API_KEY",
  "WOPEE_PROJECT_UUID",
] as const;
type FileKey = (typeof FILE_KEYS)[number];
type Values = Partial<Record<FileKey, string>>;

// Client configs pass unset variables through as "" (e.g. "${WOPEE_API_URL}" in mcp.json), so an
// empty value means "not set", never "use an empty URL". The same holds for every file below.
const present = (value: string | undefined): string | null =>
  value?.trim() || null;
const fromEnv = (name: string): string | null => present(process.env[name]);

// The client's workspace folders (MCP roots), when it offers them; else the working directory.
let workspaceRoots: string[] = [];

export function setWorkspaceRoots(paths: string[]): void {
  workspaceRoots = [...paths];
}

const LINE_RE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/;

function unquote(raw: string): string {
  const quote = raw[0];
  if ((quote === '"' || quote === "'") && raw.length >= 2) {
    const end = raw.indexOf(quote, 1);
    if (end > 0) {
      const inner = raw.slice(1, end);
      return quote === '"'
        ? inner.replace(/\\n/g, "\n").replace(/\\(["\\])/g, "$1")
        : inner;
    }
  }
  // Unquoted: an inline comment starts at " #".
  const hash = raw.search(/\s#/);
  return (hash >= 0 ? raw.slice(0, hash) : raw).trim();
}

/** Parses dotenv text without touching process.env. A later line wins, as in dotenv. */
export function parseDotenv(text: string): Map<string, string> {
  const values = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(#|$)/.test(line)) continue;
    const match = LINE_RE.exec(line);
    if (match) values.set(match[1], unquote(match[2]));
  }
  return values;
}

function readText(path: string): string | null {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

function readEnvFile(path: string): Values {
  const text = readText(path);
  if (text === null) return {};
  const parsed = parseDotenv(text);
  const values: Values = {};
  for (const key of FILE_KEYS) {
    const value = present(parsed.get(key));
    if (value) values[key] = value;
  }
  return values;
}

interface UserCredentials {
  default?: string;
  projects?: Record<string, { apiKey?: string; apiUrl?: string }>;
}

/** `~/.config/wopee/credentials.json` (or under XDG_CONFIG_HOME), written by @wopee-io/init. */
function readUserCredentials(): UserCredentials {
  const dir =
    present(process.env.XDG_CONFIG_HOME) ?? join(homedir(), ".config");
  const text = readText(join(dir, "wopee", "credentials.json"));
  if (text === null) return {};
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as UserCredentials)
      : {};
  } catch {
    return {};
  }
}

/** Every env-file layer, most important first. */
function envFileLayers(): Values[] {
  const dirs = [
    ...new Set([...workspaceRoots, process.cwd()].map((d) => resolve(d))),
  ];
  const layers: Values[] = [];

  const named = present(process.env.WOPEE_ENV_FILE);
  if (named)
    layers.push(readEnvFile(isAbsolute(named) ? named : join(dirs[0], named)));

  for (const dir of dirs) {
    layers.push(
      readEnvFile(join(dir, ".env.local")),
      readEnvFile(join(dir, ".env")),
    );
  }
  return layers;
}

/**
 * Each value comes from the first place that has it: the process env, then WOPEE_ENV_FILE, then
 * `.env.local` and `.env` in each workspace root (then the working directory), then the user's
 * credentials file for that project. WOPEE_AUTH_TOKEN (set by Commander) is read from the env only.
 */
export const getConfig = () => {
  const layers = envFileLayers();
  const lookup = (key: FileKey): string | null =>
    fromEnv(key) ?? layers.map((l) => l[key]).find(Boolean) ?? null;

  let WOPEE_PROJECT_UUID = lookup("WOPEE_PROJECT_UUID");
  let WOPEE_API_KEY = lookup("WOPEE_API_KEY");
  let WOPEE_API_URL = lookup("WOPEE_API_URL");

  if (!WOPEE_API_KEY || !WOPEE_PROJECT_UUID || !WOPEE_API_URL) {
    const user = readUserCredentials();
    const project = WOPEE_PROJECT_UUID ?? present(user.default);
    const entry = project ? user.projects?.[project] : undefined;
    if (project && entry) {
      WOPEE_PROJECT_UUID ??= project;
      WOPEE_API_KEY ??= present(entry.apiKey);
      WOPEE_API_URL ??= present(entry.apiUrl);
    }
  }

  return {
    WOPEE_API_URL: WOPEE_API_URL ?? DEFAULT_API_URL,
    WOPEE_API_KEY,
    WOPEE_PROJECT_UUID,
    WOPEE_AUTH_TOKEN: fromEnv("WOPEE_AUTH_TOKEN"),
  };
};

/** What a tool says when it has no credentials: how to connect, never "paste your key". */
export function notConnectedMessage(missing: string[]): string {
  return `Wopee.io is not connected: no ${missing.join(" or ")} in the environment, the workspace .env.local or .env, or ~/.config/wopee/credentials.json. Run \`npx -y @wopee-io/init\` in this repo, then try again (no restart needed).`;
}

export class NotConnectedError extends Error {
  constructor(missing: string[]) {
    super(notConnectedMessage(missing));
    this.name = "NotConnectedError";
  }
}

export function requireProjectUuid(): string {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new NotConnectedError(["WOPEE_PROJECT_UUID"]);
  return WOPEE_PROJECT_UUID;
}
