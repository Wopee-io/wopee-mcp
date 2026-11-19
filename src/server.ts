import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { TOOLS } from "./tools/index.js";
import { PROMPTS } from "./prompts/index.js";
import { packageVersion } from "./utils/packageVersion.js";
import { TOOL_SAFETY } from "./tools/shared/toolSafety.js";
import { offersTool } from "./tools/shared/toolAvailability.js";
import { PromptName } from "./prompts/shared/types.js";
import { getConfig } from "./utils/getConfig.js";
import { runWithRequestSignal } from "./utils/requestSignal.js";
import { safeToolResult } from "./utils/toolOutput.js";

/**
 * The Wopee.io MCP server with its tools and prompts: one per stdio process, one per HTTP request
 * (`remote`). Each connection is offered only the tools it may use (see offersTool).
 */
export function createServer({
  remote = false,
  readOnly = false,
}: { remote?: boolean; readOnly?: boolean } = {}): McpServer {
  const server = new McpServer({
    name: "wopee-mcp",
    version: packageVersion(),
  });

  // A remote connection is never Commander's Assistant, whatever token it carries.
  const insideCommander = !remote && getConfig().WOPEE_INSIDE_COMMANDER;

  for (const { name, config, handler } of TOOLS) {
    const safety = TOOL_SAFETY[name];
    if (!offersTool(name, safety, { insideCommander, readOnly })) continue;
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
