// Run with: node --test src/tools/wopee_dispatch_agent/format.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { formatDispatchSuccess } from "./format.ts";
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
  const out = formatDispatchSuccess([row()], input);

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
  );

  assert.match(out, /\[#aaaaaaaa\]/);
  assert.match(out, /\[#bbbbbbbb\]/);
});

test("omits the runName line for a row from an api that predates it", () => {
  const out = formatDispatchSuccess([row({ runName: null })], input);

  assert.equal(out.includes("runName:"), false);
  // The uuid is still there — it is the handle that never depended on the api version.
  assert.match(out, /executedTestCaseUuid: aaaaaaaa/);
});
