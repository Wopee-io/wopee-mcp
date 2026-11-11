#!/usr/bin/env node
import { setGlobalDispatcher, ProxyAgent } from "undici";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { TOOLS } from "./tools/index.js";
import { PROMPTS } from "./prompts/index.js";
import { packageVersion } from "./utils/packageVersion.js";
import { setClientInfo } from "./utils/clientInfo.js";

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

// The client names itself in `initialize`; the api logs it per API key (x-wopee-client).
server.server.oninitialized = () => setClientInfo(server.server.getClientVersion());

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Wopee MCP server running on stdio");
}

main().catch((error) => {
  console.error("Error starting Wopee MCP server:", error);
  process.exit(1);
});
