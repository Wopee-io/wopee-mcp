// Run with: node --test src/utils/getConfig.test.ts
import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  getConfig,
  notConnectedMessage,
  parseDotenv,
  requireProjectUuid,
  setWorkspaceRoots,
} from "./getConfig.ts";

const NAMES = [
  "WOPEE_API_URL",
  "WOPEE_API_KEY",
  "WOPEE_PROJECT_UUID",
  "WOPEE_AUTH_TOKEN",
  "WOPEE_ENV_FILE",
  "XDG_CONFIG_HOME",
] as const;
const saved = Object.fromEntries(NAMES.map((n) => [n, process.env[n]]));
const savedCwd = process.cwd();

const UUID_A = "1f2113a9-0000-4000-8000-00000000000a";
const UUID_B = "1f2113a9-0000-4000-8000-00000000000b";

let base: string;
let workspace: string;
let configHome: string;

const write = (path: string, text: string) => {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, text);
};

// Every test runs in empty folders: no developer .env and no real ~/.config/wopee can leak in.
beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), "wopee-mcp-config-"));
  workspace = join(base, "repo");
  configHome = join(base, "config");
  mkdirSync(workspace);
  mkdirSync(join(base, "cwd"));
  process.chdir(join(base, "cwd"));
  for (const n of NAMES) delete process.env[n];
  process.env.XDG_CONFIG_HOME = configHome;
  setWorkspaceRoots([workspace]);
});

afterEach(() => {
  setWorkspaceRoots([]);
  process.chdir(savedCwd);
  rmSync(base, { recursive: true, force: true });
  for (const n of NAMES) {
    if (saved[n] === undefined) delete process.env[n];
    else process.env[n] = saved[n];
  }
});

test("an unset WOPEE_API_URL falls back to the public api", () => {
  assert.equal(getConfig().WOPEE_API_URL, "https://api.wopee.io");
});

test("an empty WOPEE_API_URL, as an unset ${WOPEE_API_URL} expands to, counts as unset", () => {
  process.env.WOPEE_API_URL = "";
  assert.equal(getConfig().WOPEE_API_URL, "https://api.wopee.io");

  process.env.WOPEE_API_URL = "   ";
  assert.equal(getConfig().WOPEE_API_URL, "https://api.wopee.io");
});

test("a set WOPEE_API_URL is used as given", () => {
  process.env.WOPEE_API_URL = "https://api.example.wopee.io";
  assert.equal(getConfig().WOPEE_API_URL, "https://api.example.wopee.io");
});

test("empty key, project and token values count as unset", () => {
  process.env.WOPEE_API_KEY = "";
  process.env.WOPEE_PROJECT_UUID = "";
  process.env.WOPEE_AUTH_TOKEN = "";

  const config = getConfig();
  assert.equal(config.WOPEE_API_KEY, null);
  assert.equal(config.WOPEE_PROJECT_UUID, null);
  assert.equal(config.WOPEE_AUTH_TOKEN, null);
});

test("reads the key and project from the workspace .env when the env has none", () => {
  write(
    join(workspace, ".env"),
    `WOPEE_API_KEY=file-key\nWOPEE_PROJECT_UUID=${UUID_A}\n`,
  );
  const config = getConfig();
  assert.equal(config.WOPEE_API_KEY, "file-key");
  assert.equal(config.WOPEE_PROJECT_UUID, UUID_A);
  assert.equal(config.WOPEE_API_URL, "https://api.wopee.io");
});

test("the process env beats .env, value by value", () => {
  write(
    join(workspace, ".env"),
    `WOPEE_API_KEY=file-key\nWOPEE_PROJECT_UUID=${UUID_A}\n`,
  );
  process.env.WOPEE_API_KEY = "env-key";
  const config = getConfig();
  assert.equal(config.WOPEE_API_KEY, "env-key");
  assert.equal(config.WOPEE_PROJECT_UUID, UUID_A);
});

test("an empty env value falls through to .env", () => {
  write(
    join(workspace, ".env"),
    "WOPEE_API_KEY=file-key\nWOPEE_API_URL=https://api.dev.wopee.io\n",
  );
  process.env.WOPEE_API_KEY = "";
  process.env.WOPEE_API_URL = " ";
  const config = getConfig();
  assert.equal(config.WOPEE_API_KEY, "file-key");
  assert.equal(config.WOPEE_API_URL, "https://api.dev.wopee.io");
});

test(".env.local beats .env, and an empty line in .env.local does not hide .env", () => {
  write(
    join(workspace, ".env"),
    `WOPEE_API_KEY=env-file-key\nWOPEE_PROJECT_UUID=${UUID_A}\n`,
  );
  write(
    join(workspace, ".env.local"),
    "WOPEE_API_KEY=local-key\nWOPEE_PROJECT_UUID=\n",
  );
  const config = getConfig();
  assert.equal(config.WOPEE_API_KEY, "local-key");
  assert.equal(config.WOPEE_PROJECT_UUID, UUID_A);
});

test("WOPEE_ENV_FILE beats the workspace files; a relative path is read from the workspace", () => {
  write(join(workspace, ".env"), "WOPEE_API_KEY=workspace-key\n");
  write(join(workspace, "config", "wopee.env"), "WOPEE_API_KEY=named-key\n");
  process.env.WOPEE_ENV_FILE = join("config", "wopee.env");
  assert.equal(getConfig().WOPEE_API_KEY, "named-key");
});

test("the first workspace root with a value wins; the working directory is the fallback", () => {
  const second = join(base, "second");
  write(join(second, ".env"), "WOPEE_API_KEY=second-key\n");
  setWorkspaceRoots([workspace, second]);
  assert.equal(getConfig().WOPEE_API_KEY, "second-key");

  setWorkspaceRoots([]);
  process.chdir(second);
  assert.equal(getConfig().WOPEE_API_KEY, "second-key");
});

test(".env beats the user credentials file, which is keyed by project", () => {
  write(
    join(configHome, "wopee", "credentials.json"),
    JSON.stringify({
      default: UUID_B,
      projects: {
        [UUID_A]: { apiKey: "user-key-a", apiUrl: "https://api.dev.wopee.io" },
        [UUID_B]: { apiKey: "user-key-b" },
      },
    }),
  );

  // Nothing in the workspace: the default project and its key.
  let config = getConfig();
  assert.equal(config.WOPEE_PROJECT_UUID, UUID_B);
  assert.equal(config.WOPEE_API_KEY, "user-key-b");

  // The workspace names the project: that project's key and api.
  write(join(workspace, ".env"), `WOPEE_PROJECT_UUID=${UUID_A}\n`);
  config = getConfig();
  assert.equal(config.WOPEE_API_KEY, "user-key-a");
  assert.equal(config.WOPEE_API_URL, "https://api.dev.wopee.io");

  // A key in the workspace beats the user file.
  write(
    join(workspace, ".env"),
    `WOPEE_PROJECT_UUID=${UUID_A}\nWOPEE_API_KEY=workspace-key\n`,
  );
  assert.equal(getConfig().WOPEE_API_KEY, "workspace-key");
});

test("an unreadable credentials file is ignored", () => {
  write(join(configHome, "wopee", "credentials.json"), "{ not json");
  assert.equal(getConfig().WOPEE_API_KEY, null);
});

test("reading never changes process.env", () => {
  write(join(workspace, ".env"), "WOPEE_API_KEY=file-key\nOTHER_VAR=x\n");
  getConfig();
  assert.equal(process.env.WOPEE_API_KEY, undefined);
  assert.equal(process.env.OTHER_VAR, undefined);
});

test("WOPEE_AUTH_TOKEN comes from the process env only", () => {
  write(join(workspace, ".env"), "WOPEE_AUTH_TOKEN=file-token\n");
  assert.equal(getConfig().WOPEE_AUTH_TOKEN, null);
});

test("dotenv parsing: comments, export, quotes, inline comments, CRLF", () => {
  const parsed = parseDotenv(
    "# c\nexport A=1\nB=\"two words\" \nC='x#y'\nD=plain # note\r\nE=\nA=override\n",
  );
  assert.deepEqual(Object.fromEntries(parsed), {
    A: "override",
    B: "two words",
    C: "x#y",
    D: "plain",
    E: "",
  });
});

test("missing credentials point to npx @wopee-io/init and never ask for a pasted key", () => {
  const message = notConnectedMessage(["WOPEE_API_KEY"]);
  assert.match(message, /Wopee\.io is not connected/);
  assert.match(message, /npx -y @wopee-io\/init/);
  assert.doesNotMatch(message, /paste/i);

  assert.throws(
    () => requireProjectUuid(),
    (e: Error) => {
      assert.match(e.message, /WOPEE_PROJECT_UUID/);
      assert.match(e.message, /npx -y @wopee-io\/init/);
      return true;
    },
  );
  write(join(workspace, ".env"), `WOPEE_PROJECT_UUID=${UUID_A}\n`);
  assert.equal(requireProjectUuid(), UUID_A);
});
