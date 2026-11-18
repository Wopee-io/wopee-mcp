import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { TOOLS } from "./tools/index.js";
import { PROMPTS } from "./prompts/index.js";
import { packageVersion } from "./utils/packageVersion.js";
import { ToolName } from "./tools/shared/types.js";
import { TOOL_SAFETY } from "./tools/shared/toolSafety.js";
import { PromptName } from "./prompts/shared/types.js";
import { runWithRequestSignal } from "./utils/requestSignal.js";
import { safeToolResult } from "./utils/toolOutput.js";

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
 * (`remote`). A `readOnly` connection is offered only what it may use; the api enforces the same.
 */
export function createServer({
  remote = false,
  readOnly = false,
}: { remote?: boolean; readOnly?: boolean } = {}): McpServer {
  const server = new McpServer({
    name: "wopee-mcp",
    version: packageVersion(),
  });

  for (const { name, config, handler } of TOOLS) {
    if (remote && REMOTE_EXCLUDED_TOOLS.has(name)) continue;
    const safety = TOOL_SAFETY[name];
    if (readOnly && safety.writes) continue;
    const run = handler as (...args: unknown[]) => Promise<Parameters<typeof safeToolResult>[0]>;
    server.registerTool(
      name,
      { ...config, annotations: safety.annotations } as Parameters<typeof server.registerTool>[1],
      // The SDK's last argument is the request context, with or without an input before it.
      (async (...args: unknown[]) => {
        const { signal } = args.at(-1) as { signal: AbortSignal };
        return safeToolResult(await runWithRequestSignal(signal, () => run(...args)), safety);
      }) as Parameters<typeof server.registerTool>[2],
    );
  }

  for (const { name, config, handler } of PROMPTS) {
    if (readOnly && name === PromptName.RUN_TEST) continue;
    server.registerPrompt(
      name,
      config as Parameters<typeof server.registerPrompt>[1],
      handler as Parameters<typeof server.registerPrompt>[2],
    );
  }

  return server;
}
