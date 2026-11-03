/**
 * Marks a run as started from the Assistant. The api stores it on the run, and only such runs get
 * their AI summary in chat without being asked. Sent by the two run tools, whichever client calls
 * them: the Assistant in Commander or another MCP client.
 */
export const ASSISTANT_DISPATCH_HEADERS = {
  "x-wopee-dispatch-source": "ASSISTANT",
} as const;

/** The headers of an api request: any extra ones first, so they can never replace the auth. */
export function requestHeaders({
  authToken,
  apiKey,
  extra,
}: {
  authToken: string | null;
  apiKey: string | null;
  extra?: Record<string, string>;
}): Record<string, string> {
  const headers: Record<string, string> = {
    ...extra,
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers.authorization = `Bearer ${authToken}`;
  } else if (apiKey) {
    headers.api_key = apiKey;
  }
  return headers;
}
