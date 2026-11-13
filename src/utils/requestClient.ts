import { getConfig, NotConnectedError } from "./getConfig.js";
import { requestHeaders } from "./requestHeaders.js";
import { classifyGraphQLErrors, classifyHttpError, RequestError } from "./requestErrors.js";
import type { GraphQLErrorLike } from "./requestErrors.js";

export { RequestError } from "./requestErrors.js";
export type { RequestErrorCode } from "./requestErrors.js";

export interface RequestClientOptions {
  timeoutMs?: number;
  // Sent with this request on top of the auth headers.
  headers?: Record<string, string>;
}

export { ASSISTANT_DISPATCH_HEADERS } from "./requestHeaders.js";

const DEFAULT_TIMEOUT_MS = 30000;

export const requestClient = async <T>(
  query: string,
  variables: Record<string, any>,
  options?: RequestClientOptions,
): Promise<T> => {
  const { WOPEE_API_URL, WOPEE_API_KEY, WOPEE_AUTH_TOKEN } = getConfig();

  if (!WOPEE_API_KEY && !WOPEE_AUTH_TOKEN) {
    throw new NotConnectedError(["WOPEE_API_KEY"]);
  }

  const headers = requestHeaders({
    authToken: WOPEE_AUTH_TOKEN,
    apiKey: WOPEE_API_KEY,
    extra: options?.headers,
  });

  let response: Response;
  try {
    response = await fetch(`${WOPEE_API_URL}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(options?.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
  } catch (error) {
    throw new RequestError(
      `Network error: ${error instanceof Error ? error.message : String(error)}`,
      "NETWORK_ERROR",
      { retryable: true },
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw classifyHttpError(response.status, errorText, response.statusText);
  }

  const result = (await response.json()) as {
    data?: any;
    errors?: GraphQLErrorLike[];
  };

  if (result.errors && result.errors.length > 0) {
    throw classifyGraphQLErrors(result.errors);
  }

  return result.data;
};
