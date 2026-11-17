#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { RootsListChangedNotificationSchema } from "@modelcontextprotocol/sdk/types.js";
import { fileURLToPath } from "node:url";

import { createServer } from "./server.js";
import { setWorkspaceRoots } from "./utils/getConfig.js";
import { setClientInfo } from "./utils/clientInfo.js";
import { useProxyFromEnv } from "./utils/proxy.js";

useProxyFromEnv();

const server = createServer();

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

// One handler: the client names itself in `initialize` (the api logs it per API key as
// x-wopee-client), and its roots are where the workspace .env is looked up.
server.server.oninitialized = () => {
  setClientInfo(server.server.getClientVersion());
  void refreshWorkspaceRoots();
};
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
