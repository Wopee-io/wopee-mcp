#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { TOOLS } from "./tools/index.js";
import { PROMPTS } from "./prompts/index.js";

const server = new McpServer({
  name: "wopee-mcp",
  version: "1.0.0",
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Wopee MCP server running on stdio");
}

main().catch((error) => {
  console.error("Error starting Wopee MCP server:", error);
  process.exit(1);
});
