import { getConfig } from "./getConfig.js";

export type RequestErrorCode =
  | "RATE_LIMITED"
  | "USAGE_LIMIT_EXCEEDED"
  | "HTTP_ERROR"
  | "GRAPHQL_ERROR"
  | "NETWORK_ERROR"
  | "AUTH_ERROR";

export class RequestError extends Error {
  code: RequestErrorCode;
  status: number | null;
  retryable: boolean;

  constructor(
    message: string,
    code: RequestErrorCode,
    options?: { status?: number; retryable?: boolean },
  ) {
    super(message);
    this.name = "RequestError";
    this.code = code;
    this.status = options?.status ?? null;
    this.retryable = options?.retryable ?? false;
  }
}

function classifyGraphQLErrors(
  errors: Array<{ message: string }>,
): RequestError {
  const combined = errors.map((e) => e.message).join("; ");
  const lower = combined.toLowerCase();

  if (lower.includes("rate limit")) {
    return new RequestError(combined, "RATE_LIMITED", { retryable: true });
  }
  if (lower.includes("usage limit") || lower.includes("usage_limit")) {
    return new RequestError(combined, "USAGE_LIMIT_EXCEEDED");
  }
  return new RequestError(combined, "GRAPHQL_ERROR");
}

export const requestClient = async <T>(
  query: string,
  variables: Record<string, any>,
): Promise<T> => {
  const { WOPEE_API_URL, WOPEE_API_KEY } = getConfig();

  if (!WOPEE_API_KEY) {
    throw new RequestError("WOPEE_API_KEY is not set", "AUTH_ERROR");
  }

  const headers = {
    api_key: WOPEE_API_KEY,
    "Content-Type": "application/json",
  } as Record<string, string>;

  let response: Response;
  try {
    response = await fetch(`${WOPEE_API_URL}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
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
    const status = response.status;
    const isRateLimit =
      status === 429 || errorText.toLowerCase().includes("rate limit");
    const isRetryable = isRateLimit || status >= 500;

    throw new RequestError(
      `HTTP ${status}: ${errorText || response.statusText}`,
      isRateLimit ? "RATE_LIMITED" : "HTTP_ERROR",
      { status, retryable: isRetryable },
    );
  }

  const result = (await response.json()) as {
    data?: any;
    errors?: Array<{ message: string }>;
  };

  if (result.errors && result.errors.length > 0) {
    throw classifyGraphQLErrors(result.errors);
  }

  return result.data;
};
