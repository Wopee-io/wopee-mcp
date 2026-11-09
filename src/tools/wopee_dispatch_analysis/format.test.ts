// Run with: node --test src/tools/wopee_dispatch_analysis/format.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { formatAnalysisDispatched } from "./format.ts";
import type { AnalysisSuite } from "../shared/types.ts";

const suite = {
  uuid: "11111111-2222-3333-4444-555555555555",
  name: "Analysis A012",
  suiteType: "ANALYSIS",
  executionStatus: null,
  analysisIdentifier: "A012",
  suiteRunningStatus: "IN_PROGRESS",
  createdAt: "2026-11-09T18:00:00Z",
  updatedAt: "2026-11-09T18:00:00Z",
  generatedAnalysisDataState: null,
} as unknown as AnalysisSuite;

test("returns the suite UUID, analysis identifier and status of the started analysis", () => {
  const out = formatAnalysisDispatched(suite);

  assert.match(out, /Suite UUID: 11111111-2222-3333-4444-555555555555/);
  assert.match(out, /Analysis Identifier: A012/);
  assert.match(out, /Status: IN_PROGRESS/);
});

test("tells the caller how to follow the crawl", () => {
  const out = formatAnalysisDispatched(suite);

  assert.match(out, /wopee_fetch_analysis_suites every 30-60 s/);
  assert.match(out, /5-10 minutes/);
});
