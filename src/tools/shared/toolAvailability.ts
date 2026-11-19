// Which tools a server offers to its connection. Only type imports, so it loads under
// `node --test` in strip-only mode.
import type { ToolName } from "./types.js";

/**
 * The project chat. The api serves it only to a signed-in Commander user and refuses a project API
 * key and a remote MCP connection alike, so offering it anywhere else would only fail.
 */
export const COMMANDER_ONLY_TOOLS: ReadonlySet<string> = new Set<`${ToolName}`>([
  "wopee_send_chat_message",
  "wopee_read_chat_history",
]);

export interface Connection {
  /** Commander's Assistant: the stdio server run with the user's session token. */
  insideCommander: boolean;
  /** Gets only the tools that change nothing; the api enforces the same. */
  readOnly: boolean;
}

/** Whether a server for this connection offers the tool. */
export const offersTool = (
  name: string,
  { writes }: { writes: boolean },
  { insideCommander, readOnly }: Connection,
): boolean =>
  (insideCommander || !COMMANDER_ONLY_TOOLS.has(name)) && !(readOnly && writes);
