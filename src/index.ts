import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { TOOLS } from "./tools/index.js";

const server = new McpServer({
  name: "wopee-mcp",
  version: "1.0.0",
});

for (const { name, config, handler } of TOOLS) {
  server.registerTool(
    name,
    config,
    handler as unknown as Parameters<typeof server.registerTool>[2]
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
