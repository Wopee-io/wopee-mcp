/**
 * Marks where a run was started. The api stores it on the run, and only ASSISTANT runs (started
 * inside Commander, which authenticates with WOPEE_AUTH_TOKEN) get their AI summary in chat
 * without being asked. Runs from any other MCP client authenticate with an API key and are MCP.
 */
export function dispatchSourceHeaders(authToken: string | null): {
  "x-wopee-dispatch-source": "ASSISTANT" | "MCP";
} {
  return { "x-wopee-dispatch-source": authToken ? "ASSISTANT" : "MCP" };
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
    headers["x-wopee-client"] = client || "unknown";
    if (mcpVersion) headers["x-wopee-mcp-version"] = mcpVersion;
    if (setupRef) headers["x-wopee-setup-ref"] = setupRef;
  }
  return headers;
}
