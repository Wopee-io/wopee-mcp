import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { TOOLS } from "./tools/index.js";
import { PROMPTS } from "./prompts/index.js";
import { packageVersion } from "./utils/packageVersion.js";
import { ToolName } from "./tools/shared/types.js";

/**
 * Tools the remote server leaves out: the project chat needs a Commander session, and the api
 * refuses it to an MCP connection and to an API key alike, so offering it would only fail.
 */
const REMOTE_EXCLUDED_TOOLS = new Set<string>([
  ToolName.WOPEE_SEND_CHAT_MESSAGE,
  ToolName.WOPEE_READ_CHAT_HISTORY,
]);

/**
 * The Wopee.io MCP server with its tools and prompts: one per stdio process, one per HTTP request
 * (`remote`).
 */
export function createServer({ remote = false }: { remote?: boolean } = {}): McpServer {
  const server = new McpServer({
    name: "wopee-mcp",
    version: packageVersion(),
  });

  for (const { name, config, handler } of TOOLS) {
    if (remote && REMOTE_EXCLUDED_TOOLS.has(name)) continue;
    server.registerTool(
      name,
      config as Parameters<typeof server.registerTool>[1],
      handler as Parameters<typeof server.registerTool>[2],
    );
  }

  for (const { name, config, handler } of PROMPTS) {
    server.registerPrompt(
      name,
      config as Parameters<typeof server.registerPrompt>[1],
      handler as Parameters<typeof server.registerPrompt>[2],
    );
  }

  return server;
}
