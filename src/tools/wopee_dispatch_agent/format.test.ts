// Run with: node --test src/tools/wopee_dispatch_agent/format.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { formatDispatchFailure, formatDispatchSuccess } from "./format.ts";
import {
  classifyGraphQLErrors,
  classifyHttpError,
  errorHint,
} from "../../utils/requestErrors.ts";
import type { ExecutedTestCase } from "../shared/types.ts";
import type { WopeeDispatchAgentInput } from "./schema.ts";

// backlog#4382 — this text is the whole tracking contract for an MCP caller. The api returns
// the row uuid and the exact Actions run title; if they are not printed here, the caller is
// back to guessing its run out of `gh run list`, which races under parallel dispatch.
const row = (over: Partial<ExecutedTestCase> = {}): ExecutedTestCase =>
  ({
    uuid: "aaaaaaaa-1111-2222-3333-444444444444",
    projectUuid: "p-1",
    suiteUuid: "run-suite-1",
    analysisSuiteUuid: "analysis-1",
    analysisIdentifier: "A001",
    userStoryId: "US001",
    testCaseId: "TC001",
    runName: "Analysis - A001 (US001:TC001), agent, by someone@wopee.io [#aaaaaaaa]",
    executionStatus: "IN_PROGRESS",
    agentReport: null,
    agentReportStatus: null,
    codeReport: null,
    codeReportStatus: null,
    createdAt: "2026-08-20T06:00:00Z",
    updatedAt: "2026-08-20T06:00:00Z",
    ...over,
  }) as ExecutedTestCase;

const input = {
  suiteUuid: "analysis-1",
  analysisIdentifier: "A001",
} as WopeeDispatchAgentInput;

test("prints the per-row handles a caller needs to track its own dispatch", () => {
  const out = formatDispatchSuccess([row()], input, { insideCommander: false });

  assert.match(out, /executedTestCaseUuid: aaaaaaaa-1111-2222-3333-444444444444/);
  assert.match(out, /runName: Analysis - A001 \(US001:TC001\), agent, by someone@wopee\.io \[#aaaaaaaa\]/);
});

test("distinguishes two dispatches of the same test case", () => {
  const out = formatDispatchSuccess(
    [
      row(),
      row({
        uuid: "bbbbbbbb-1111-2222-3333-444444444444",
        runName: "Analysis - A001 (US001:TC001), agent, by someone@wopee.io [#bbbbbbbb]",
      }),
    ],
    input,
    { insideCommander: false },
  );

  assert.match(out, /\[#aaaaaaaa\]/);
  assert.match(out, /\[#bbbbbbbb\]/);
});

test("omits the runName line for a row from an api that predates it", () => {
  const out = formatDispatchSuccess([row({ runName: null })], input, {
    insideCommander: false,
  });

  assert.equal(out.includes("runName:"), false);
  // The uuid is still there — it is the handle that never depended on the api version.
  assert.match(out, /executedTestCaseUuid: aaaaaaaa/);
});

test("outside Commander, tells the caller to poll instead of waiting for a chat notification", () => {
  const out = formatDispatchSuccess([row()], input, { insideCommander: false });

  assert.equal(out.includes("notification in chat"), false);
  assert.match(out, /Poll wopee_fetch_recent_executions/);
});

test("inside Commander, promises the chat notification", () => {
  const out = formatDispatchSuccess([row()], input, { insideCommander: true });

  assert.match(out, /follow-up notification in chat/);
});

test("a usage-limit error is reported as such, with its reset time, and not as retryable", () => {
  const error = classifyGraphQLErrors([
    {
      message:
        "Usage limit reached. 50/50 steps consumed in current session. Session resets at 2026-11-09T20:00:00.000Z.",
      extensions: { code: "USAGE_LIMIT_EXCEEDED" },
    },
  ]);
  const out = formatDispatchFailure(error, errorHint(error.code));

  assert.match(out, /^DISPATCH FAILED \(usage limit reached\)/);
  assert.match(out, /\[USAGE_LIMIT_EXCEEDED\]/);
  assert.match(out, /Session resets at 2026-11-09T20:00:00\.000Z/);
  assert.match(out, /Do not retry before the reset time/);
  assert.equal(out.includes("try again"), false);
});

test("an auth error is reported as such, with what to check", () => {
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
  const out = formatDispatchFailure(error, errorHint(error.code));

  assert.match(out, /^DISPATCH FAILED \(authentication failed\)/);
  assert.match(out, /\[AUTH_ERROR\] You are not authorized/);
  assert.match(out, /Retrying will not help/);
  assert.match(out, /WOPEE_API_KEY/);
});

test("any other error stays a dispatch error worth retrying", () => {
  const out = formatDispatchFailure(new Error("socket hang up"), null);

  assert.match(out, /dispatch\/infrastructure error/);
  assert.match(out, /try again/);
});
