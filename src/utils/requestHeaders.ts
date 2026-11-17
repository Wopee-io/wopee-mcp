/**
 * Marks where a run was started. The api stores it on the run, and only ASSISTANT runs (started
 * inside Commander's Assistant) get their AI summary in chat without being asked. Runs from any
 * other MCP client, the remote server included, are MCP.
 */
export function dispatchSourceHeaders(insideCommander: boolean): {
  "x-wopee-dispatch-source": "ASSISTANT" | "MCP";
} {
  return { "x-wopee-dispatch-source": insideCommander ? "ASSISTANT" : "MCP" };
}

/**
 * A value fetch accepts as a header: printable ASCII only, at most 200 characters (what the api
 * keeps). The client name comes from the client's `initialize`; one en dash or newline in it
 * would make fetch throw and fail every request.
 */
export function headerSafe(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7e]+/g, "-")
    .trim()
    .slice(0, 200);
}

/** The headers of an api request: any extra ones first, so they can never replace the auth. */
export function requestHeaders({
  authToken,
  apiKey,
  extra,
  client,
  setupRef,
  mcpVersion,
}: {
  authToken: string | null;
  apiKey: string | null;
  extra?: Record<string, string>;
  /** `<name>/<version>` of the MCP client, or `unknown`. Sent with API key requests only. */
  client?: string;
  /** WOPEE_SETUP_REF, sent with API key requests only when set. */
  setupRef?: string | null;
  /** This server's package version, sent with API key requests. */
  mcpVersion?: string;
}): Record<string, string> {
  const headers: Record<string, string> = {
    ...extra,
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers.authorization = `Bearer ${authToken}`;
  } else if (apiKey) {
    // Corporate gateways drop headers with underscores; the api reads `x-api-key` when `api_key`
    // did not arrive.
    headers.api_key = apiKey;
    headers["x-api-key"] = apiKey;
    headers["x-wopee-client"] = headerSafe(client) || "unknown";
    const version = headerSafe(mcpVersion);
    if (version) headers["x-wopee-mcp-version"] = version;
    const ref = headerSafe(setupRef);
    if (ref) headers["x-wopee-setup-ref"] = ref;
  }
  return headers;
}
