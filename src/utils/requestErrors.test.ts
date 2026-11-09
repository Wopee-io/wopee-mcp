// Run with: node --test src/utils/requestErrors.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  classifyGraphQLErrors,
  classifyHttpError,
  describeRequestError,
} from "./requestErrors.ts";

const USAGE_LIMIT = {
  message:
    "Usage limit reached. 50/50 steps consumed in current session. Session resets at 2026-11-09T20:00:00.000Z.",
  extensions: { code: "USAGE_LIMIT_EXCEEDED" },
};

test("the api's usage-limit error is USAGE_LIMIT_EXCEEDED, not retryable, with its reset time", () => {
  const error = classifyGraphQLErrors([USAGE_LIMIT]);

  assert.equal(error.code, "USAGE_LIMIT_EXCEEDED");
  assert.equal(error.retryable, false);

  const text = describeRequestError(error);
  assert.match(text, /^\[USAGE_LIMIT_EXCEEDED\] Usage limit reached\./);
  assert.match(text, /Session resets at 2026-11-09T20:00:00\.000Z/);
  assert.match(text, /Do not retry/);
});

test("a usage-limit error in a non-2xx body is still a usage limit", () => {
  const error = classifyHttpError(
    400,
    JSON.stringify({ errors: [USAGE_LIMIT] }),
  );

  assert.equal(error.code, "USAGE_LIMIT_EXCEEDED");
  assert.equal(error.status, 400);
});

test("graphql-shield's Not Authorised! is an auth error", () => {
  const error = classifyGraphQLErrors([{ message: "Not Authorised!" }]);

  assert.equal(error.code, "AUTH_ERROR");
  assert.equal(error.retryable, false);
  assert.match(describeRequestError(error), /Retrying will not help/);
});

test("a 401 with a FORBIDDEN GraphQL body is an auth error with the api's message", () => {
  const error = classifyHttpError(
    401,
    JSON.stringify({
      errors: [
        {
          message: "You are not authorized to get this resource.",
          extensions: { code: "FORBIDDEN" },
        },
      ],
    }),
  );

  assert.equal(error.code, "AUTH_ERROR");
  assert.equal(error.message, "You are not authorized to get this resource.");
  assert.match(describeRequestError(error), /WOPEE_API_KEY/);
});

test("a plain-text 403 is an auth error", () => {
  assert.equal(classifyHttpError(403, "Forbidden").code, "AUTH_ERROR");
});

test("rate limits and 5xx stay retryable; other errors keep their codes", () => {
  assert.equal(classifyHttpError(429, "Too Many Requests").retryable, true);
  assert.equal(classifyHttpError(502, "Bad Gateway").code, "HTTP_ERROR");
  assert.equal(classifyHttpError(502, "Bad Gateway").retryable, true);
  assert.equal(
    classifyGraphQLErrors([{ message: "Rate limit: wait 10 seconds" }]).code,
    "RATE_LIMITED",
  );
  assert.equal(
    classifyGraphQLErrors([{ message: "Suite not found" }]).code,
    "GRAPHQL_ERROR",
  );
  assert.equal(
    describeRequestError(classifyGraphQLErrors([{ message: "Suite not found" }])),
    "[GRAPHQL_ERROR] Suite not found",
  );
});
