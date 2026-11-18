// What each tool does, in one table: the hints MCP clients show and use when asking for approval,
// which tools a read-only connection gets, and whose output is stored project data. Only type
// imports, so it loads under `node --test` in strip-only mode.
import type { ToolName } from "./types.js";

export interface ToolSafety {
  /** Changes something, so a read-only connection does not get it. */
  writes: boolean;
  /** Its output carries text people or test runs stored in the project. */
  returnsProjectData: boolean;
  annotations: {
    readOnlyHint: boolean;
    destructiveHint: boolean;
    idempotentHint: boolean;
    openWorldHint: boolean;
  };
}

const reads = ({
  returnsProjectData = true,
  openWorld = false,
}: { returnsProjectData?: boolean; openWorld?: boolean } = {}): ToolSafety => ({
  writes: false,
  returnsProjectData,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: openWorld,
  },
});

const writes = ({
  destructive = false,
  idempotent = false,
  openWorld = false,
  returnsProjectData = false,
}: {
  destructive?: boolean;
  idempotent?: boolean;
  openWorld?: boolean;
  returnsProjectData?: boolean;
} = {}): ToolSafety => ({
  writes: true,
  returnsProjectData,
  annotations: {
    readOnlyHint: false,
    destructiveHint: destructive,
    idempotentHint: idempotent,
    openWorldHint: openWorld,
  },
});

export const TOOL_SAFETY: Record<`${ToolName}`, ToolSafety> = {
  wopee_fetch_analysis_suites: reads(),
  wopee_fetch_executed_test_cases: reads(),
  wopee_fetch_recent_executions: reads(),
  wopee_fetch_test_inventory: reads(),
  wopee_fetch_variables: reads(),
  wopee_fetch_artifact: reads(),
  wopee_read_chat_history: reads(),
  wopee_setup_check: reads({ returnsProjectData: false }),
  wopee_search_docs: reads({ returnsProjectData: false, openWorld: true }),

  wopee_create_blank_suite: writes(),
  wopee_update_variables: writes({ destructive: true, idempotent: true }),
  wopee_update_artifact: writes({ destructive: true, idempotent: true }),
  wopee_generate_artifact: writes({ destructive: true, returnsProjectData: true }),
  // Runs act on the application under test, outside Wopee.io.
  wopee_dispatch_analysis: writes({ openWorld: true }),
  wopee_dispatch_agent: writes({ openWorld: true }),
  wopee_send_chat_message: writes(),
  wopee_create_github_issue: writes({ openWorld: true }),
};

/** Whether a JSON-RPC message calls a tool that changes something. */
export function callsWriteTool(message: unknown): boolean {
  const { method, params } = (message ?? {}) as {
    method?: unknown;
    params?: { name?: unknown };
  };
  if (method !== "tools/call" || typeof params?.name !== "string") return false;
  return Object.hasOwn(TOOL_SAFETY, params.name)
    ? TOOL_SAFETY[params.name as `${ToolName}`].writes
    : false;
}
