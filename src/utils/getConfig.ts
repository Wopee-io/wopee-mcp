// Where wopee-mcp finds its credentials, so an agent's MCP config can be a key-free
// `npx -y wopee-mcp`. Only node: imports, so it loads under `node --test` in strip-only mode.
import { AsyncLocalStorage } from "node:async_hooks";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";

const DEFAULT_API_URL = "https://api.wopee.io";
const FILE_KEYS = [
  "WOPEE_API_URL",
  "WOPEE_API_KEY",
  "WOPEE_PROJECT_UUID",
  "WOPEE_SETUP_REF",
] as const;
type FileKey = (typeof FILE_KEYS)[number];
type Values = Partial<Record<FileKey, string>>;

// Client configs pass unset variables through as "" (e.g. "${WOPEE_API_URL}" in mcp.json), so an
// empty value means "not set", never "use an empty URL". The same holds for every file below.
const present = (value: string | undefined): string | null =>
  value?.trim() || null;
const fromEnv = (name: string): string | null => present(process.env[name]);

/**
 * One request of the remote (HTTP) server: the caller's bearer token (an MCP access token or a
 * project API key), the api to send it to, and the project the api said it belongs to. Inside one,
 * getConfig() answers from it alone: never from the process env, a .env file, the client's roots
 * or ~/.config/wopee, which belong to whoever runs the server, not to the caller.
 */
export interface RemoteContext {
  authToken: string;
  apiUrl: string;
  projectUuid: string;
}

const remote = new AsyncLocalStorage<RemoteContext>();
let remoteOnly = false;

/**
 * For the HTTP server: from now on a config read outside a request is an error, so a lost context
 * can never fall back to this process's own credentials.
 */
export function setRemoteOnly(value: boolean): void {
  remoteOnly = value;
}

/** Runs `fn` (and everything it awaits) as one remote request. */
export function runWithRemoteContext<T>(context: RemoteContext, fn: () => T): T {
  return remote.run(context, fn);
}

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
  const context = remote.getStore();
  if (context) {
    return {
      WOPEE_API_URL: context.apiUrl,
      WOPEE_API_KEY: null,
      WOPEE_PROJECT_UUID: context.projectUuid,
      WOPEE_AUTH_TOKEN: context.authToken,
      WOPEE_SETUP_REF: null,
      WOPEE_REMOTE: true,
      WOPEE_INSIDE_COMMANDER: false,
    };
  }
  if (remoteOnly) throw new Error("No connection for this request.");

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

  const WOPEE_AUTH_TOKEN = fromEnv("WOPEE_AUTH_TOKEN");
  return {
    WOPEE_API_URL: WOPEE_API_URL ?? DEFAULT_API_URL,
    WOPEE_API_KEY,
    WOPEE_PROJECT_UUID,
    WOPEE_AUTH_TOKEN,
    WOPEE_SETUP_REF: lookup("WOPEE_SETUP_REF"),
    WOPEE_REMOTE: false,
    // Commander's Assistant runs this server with the user's session token: its runs post their
    // results to chat. A remote client's token never means that.
    WOPEE_INSIDE_COMMANDER: Boolean(WOPEE_AUTH_TOKEN),
  };
};

/** What a tool says when it has no credentials: how to connect, never "paste your key". */
export function notConnectedMessage(missing: string[]): string {
  if (remote.getStore()) {
    return `Wopee.io is not connected: no ${missing.join(" or ")} for this connection. Reconnect the Wopee.io server from your MCP client, then try again.`;
  }
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
