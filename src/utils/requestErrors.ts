// Request errors and how they read back to the agent. No runtime imports, so it loads under
// `node --test` in strip-only mode.

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

export type GraphQLErrorLike = {
  message: string;
  extensions?: { code?: string } | null;
};

const AUTH_CODES = new Set(["UNAUTHENTICATED", "FORBIDDEN"]);
// api src/utils/authErrors.js: graphql-shield answers "Not Authorised!" when the key does not
// grant access to the project or suite, "You are not authorized to get this resource." otherwise.
const AUTH_MESSAGES = ["not authorised", "not authorized"];

/** One RequestError for the `errors` of a GraphQL response, whatever its HTTP status. */
export function classifyGraphQLErrors(
  errors: GraphQLErrorLike[],
  status?: number,
): RequestError {
  const message = errors.map((e) => e.message).join("; ");
  const lower = message.toLowerCase();
  const codes = errors.map((e) => e.extensions?.code);
  const options = status === undefined ? {} : { status };

  // The api's enforceUsageLimit: code USAGE_LIMIT_EXCEEDED, message "Usage limit reached.
  // X/50 steps consumed in current session. Session resets at <ISO>."
  if (
    codes.includes("USAGE_LIMIT_EXCEEDED") ||
    lower.includes("usage limit") ||
    lower.includes("usage_limit")
  ) {
    return new RequestError(message, "USAGE_LIMIT_EXCEEDED", options);
  }
  if (status === 429 || lower.includes("rate limit")) {
    return new RequestError(message, "RATE_LIMITED", {
      ...options,
      retryable: true,
    });
  }
  if (
    status === 401 ||
    status === 403 ||
    codes.some((c) => c !== undefined && AUTH_CODES.has(c)) ||
    AUTH_MESSAGES.some((m) => lower.includes(m))
  ) {
    return new RequestError(message, "AUTH_ERROR", options);
  }
  if (status !== undefined) {
    return new RequestError(`HTTP ${status}: ${message}`, "HTTP_ERROR", {
      status,
      retryable: status >= 500,
    });
  }
  return new RequestError(message, "GRAPHQL_ERROR");
}

/** The RequestError for a non-2xx response; a GraphQL error body is classified by its errors. */
export function classifyHttpError(
  status: number,
  bodyText: string,
  statusText = "",
): RequestError {
  try {
    const body = JSON.parse(bodyText) as { errors?: GraphQLErrorLike[] };
    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      return classifyGraphQLErrors(body.errors, status);
    }
  } catch {
    // Not JSON: fall through to the status.
  }

  const text = bodyText || statusText;
  if (status === 429 || text.toLowerCase().includes("rate limit")) {
    return new RequestError(`HTTP ${status}: ${text}`, "RATE_LIMITED", {
      status,
      retryable: true,
    });
  }
  if (status === 401 || status === 403) {
    return new RequestError(`HTTP ${status}: ${text}`, "AUTH_ERROR", {
      status,
    });
  }
  return new RequestError(`HTTP ${status}: ${text}`, "HTTP_ERROR", {
    status,
    retryable: status >= 500,
  });
}

/** What the agent should do about an error that retrying does not fix, or null. */
export function errorHint(code: RequestErrorCode | string | undefined): string | null {
  switch (code) {
    case "USAGE_LIMIT_EXCEEDED":
      return "This is the plan's usage limit, not a test failure or an outage. Do not retry before the reset time above; tell the user, who can check usage or upgrade at https://cmd.wopee.io.";
    case "AUTH_ERROR":
      return "Retrying will not help. Check that WOPEE_API_KEY is a key of the project in WOPEE_PROJECT_UUID and that any suite UUID used belongs to that project: https://docs.wopee.io/guides/api-keys/";
    default:
      return null;
  }
}

/** One-line description of a failed request, e.g. "[AUTH_ERROR] Not Authorised! Retrying …". */
export function describeRequestError(error: RequestError): string {
  const hint = errorHint(error.code);
  return `[${error.code}] ${error.message}${error.retryable ? " (retryable)" : ""}${hint ? ` ${hint}` : ""}`;
}
