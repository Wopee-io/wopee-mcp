#!/usr/bin/env node
import { setGlobalDispatcher, ProxyAgent } from "undici";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { RootsListChangedNotificationSchema } from "@modelcontextprotocol/sdk/types.js";
import { fileURLToPath } from "node:url";

import { TOOLS } from "./tools/index.js";
import { PROMPTS } from "./prompts/index.js";
import { packageVersion } from "./utils/packageVersion.js";
import { setWorkspaceRoots } from "./utils/getConfig.js";

const proxyUrl =
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy;

if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  console.error(`[WOPEE]: Using proxy ${proxyUrl}`);
}

const server = new McpServer({
  name: "wopee-mcp",
  version: packageVersion(),
});

for (const { name, config, handler } of TOOLS) {
  server.registerTool(
    name,
    config as Parameters<typeof server.registerTool>[1],
    handler as Parameters<typeof server.registerTool>[2]
  );
}

for (const { name, config, handler } of PROMPTS) {
  server.registerPrompt(
    name,
    config as Parameters<typeof server.registerPrompt>[1],
    handler as Parameters<typeof server.registerPrompt>[2]
  );
}

// The workspace .env is looked up in the client's roots when it offers them (else the working
// directory), so a key-free `npx -y wopee-mcp` entry finds the repo's credentials.
async function refreshWorkspaceRoots() {
  if (!server.server.getClientCapabilities()?.roots) return;
  try {
    const { roots } = await server.server.listRoots();
    setWorkspaceRoots(
      roots
        .filter((root) => root.uri.startsWith("file:"))
        .map((root) => fileURLToPath(root.uri)),
    );
  } catch (error) {
    console.error(
      `[WOPEE]: Could not list the client's workspace roots, using the working directory: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

server.server.oninitialized = () => void refreshWorkspaceRoots();
server.server.setNotificationHandler(
  RootsListChangedNotificationSchema,
  refreshWorkspaceRoots,
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Wopee MCP server running on stdio");
}

main().catch((error) => {
  console.error("Error starting Wopee MCP server:", error);
  process.exit(1);
});
