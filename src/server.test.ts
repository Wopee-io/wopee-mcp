// Run with: npm test (it starts build/index.js, which `pretest` builds).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SERVER = fileURLToPath(new URL("../build/index.js", import.meta.url));
const CHAT = ["wopee_send_chat_message", "wopee_read_chat_history"];

/** The tool names a stdio server started with this env answers tools/list with. */
async function listTools(env: Record<string, string>): Promise<string[]> {
  // An empty working directory, so no .env of this checkout is read.
  const cwd = mkdtempSync(join(tmpdir(), "wopee-mcp-server-"));
  // No Wopee.io setting of this shell either: only the ones the test names.
  const inherited = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith("WOPEE_")),
  );
  const child = spawn(process.execPath, [SERVER], {
    cwd,
    env: { ...inherited, XDG_CONFIG_HOME: cwd, ...env },
    stdio: ["pipe", "pipe", "ignore"],
  });
  const exited = new Promise((resolve) => child.on("exit", resolve));
  try {
    const send = (message: object) => child.stdin.write(`${JSON.stringify(message)}\n`);
    const reply = new Promise<string[]>((resolve, reject) => {
      let buffer = "";
      child.stdout.on("data", (chunk: Buffer) => {
        buffer += chunk;
        for (const line of buffer.split("\n").slice(0, -1)) {
          const message = JSON.parse(line);
          if (message.id === 2) resolve(message.result.tools.map((t: { name: string }) => t.name));
        }
        buffer = buffer.slice(buffer.lastIndexOf("\n") + 1);
      });
      child.on("exit", (code) => reject(new Error(`server exited with ${code}`)));
    });
    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } },
    });
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    return await reply;
  } finally {
    // Windows keeps the working directory locked until the process is gone.
    child.kill();
    await exited;
    rmSync(cwd, { recursive: true, force: true });
  }
}

test("over stdio with a project API key, tools/list has no chat tools", async () => {
  const tools = await listTools({ WOPEE_API_KEY: "key", WOPEE_PROJECT_UUID: "project" });

  assert.ok(tools.includes("wopee_fetch_artifact"));
  for (const name of CHAT) assert.equal(tools.includes(name), false, name);
});

test("over stdio inside the Commander Assistant, tools/list has both chat tools", async () => {
  const tools = await listTools({ WOPEE_AUTH_TOKEN: "session", WOPEE_PROJECT_UUID: "project" });

  for (const name of CHAT) assert.ok(tools.includes(name), name);
});
