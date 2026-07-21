// Run with: node --test src/tools/wopee_fetch_test_inventory/logic.test.ts
// (Node >= 22.6 strips TS types natively; no test framework dependency.)
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildTestInventory,
  resolveStatus,
  parseUserStories,
  indexExecutions,
  NOT_RUN,
  type AnalysisInput,
} from "./logic.ts";

// --- fixtures --------------------------------------------------------------

// Build a USER_STORIES artifact: one R001 reusable block with `reusable` cases,
// plus `regularStories` each contributing test cases.
function artifact({
  reusable,
  stories,
}: {
  reusable: number;
  stories: { us: string; count: number }[];
}): string {
  const userStories: any[] = [];
  if (reusable > 0)
    userStories.push({
      userStoryId: "R001",
      userStoryName: "Reusable test cases",
      userStoryCategory: "Reusable Blocks",
      testCases: Array.from({ length: reusable }, (_, i) => ({
        testCaseId: `RTC00${i + 1}`,
        name: `Reusable block ${i + 1}`,
      })),
    });
  for (const s of stories)
    userStories.push({
      userStoryId: s.us,
      userStoryName: `Story ${s.us}`,
      userStoryCategory: "Cat",
      testCases: Array.from({ length: s.count }, (_, i) => ({
        testCaseId: `TC00${i + 1}`,
        name: `${s.us} test ${i + 1}`,
      })),
    });
  return JSON.stringify({ userStories });
}

function exec(over: Partial<any>): any {
  return {
    uuid: over.uuid ?? "e1",
    userStoryId: over.userStoryId,
    testCaseId: over.testCaseId,
    executionStatus: over.executionStatus ?? "FINISHED",
    agentReportStatus: over.agentReportStatus ?? null,
    codeReportStatus: over.codeReportStatus ?? null,
    createdAt: over.createdAt ?? "2026-01-01T00:00:00Z",
    updatedAt: over.updatedAt ?? "2026-01-01T00:00:00Z",
  };
}

// --- resolveStatus ---------------------------------------------------------

test("resolveStatus: never-run is NOT_RUN", () => {
  assert.equal(resolveStatus(undefined), NOT_RUN);
});

test("resolveStatus: agent report wins over a FINISHED execution", () => {
  assert.equal(
    resolveStatus(
      exec({ executionStatus: "FINISHED", agentReportStatus: "FAILED" }),
    ),
    "FAILED",
  );
});

test("resolveStatus: falls back to code report, then execution status", () => {
  assert.equal(
    resolveStatus(exec({ executionStatus: "FINISHED", codeReportStatus: "PASSED" })),
    "PASSED",
  );
  assert.equal(resolveStatus(exec({ executionStatus: "IN_PROGRESS" })), "IN_PROGRESS");
});

// --- parseUserStories ------------------------------------------------------

test("parseUserStories: tolerates null / malformed / missing array", () => {
  assert.deepEqual(parseUserStories(null), []);
  assert.deepEqual(parseUserStories("not json"), []);
  assert.deepEqual(parseUserStories("{}"), []);
});

// --- indexExecutions -------------------------------------------------------

test("indexExecutions: newest run is first per key", () => {
  const idx = indexExecutions([
    {
      userStoryId: "US001",
      executedTestCases: [
        exec({ uuid: "old", userStoryId: "US001", testCaseId: "TC001", createdAt: "2026-01-01T00:00:00Z" }),
        exec({ uuid: "new", userStoryId: "US001", testCaseId: "TC001", createdAt: "2026-02-01T00:00:00Z" }),
      ],
    },
  ]);
  assert.equal(idx.get("US001::TC001")?.[0].uuid, "new");
});

// --- buildTestInventory (the issue's exact scenario) -----------------------

test("counts 18 regular + 5 reusable across the analysis; reusable never runs", () => {
  const input: AnalysisInput[] = [
    {
      suite: {
        uuid: "s1",
        name: "Analysis - A001",
        analysisIdentifier: "A001",
        suiteRunningStatus: "IDLE",
      } as any,
      artifactContent: artifact({
        reusable: 5,
        // 4 + 4 + 4 + 3 + 3 = 18 regular test cases
        stories: [
          { us: "US001", count: 4 },
          { us: "US002", count: 4 },
          { us: "US003", count: 4 },
          { us: "US004", count: 3 },
          { us: "US005", count: 3 },
        ],
      }),
      // Only 3 executions: one FAILED via agent report, two PASSED. The other 15
      // regular tests were never run.
      execGroups: [
        {
          userStoryId: "US001",
          executedTestCases: [
            exec({ userStoryId: "US001", testCaseId: "TC001", agentReportStatus: "PASSED" }),
            exec({ userStoryId: "US001", testCaseId: "TC004", executionStatus: "FINISHED", agentReportStatus: "FAILED" }),
          ],
        },
        {
          userStoryId: "US002",
          executedTestCases: [
            exec({ userStoryId: "US002", testCaseId: "TC001", agentReportStatus: "PASSED" }),
          ],
        },
      ],
    },
  ];

  const inv = buildTestInventory(input);
  const a = inv.analyses[0];

  assert.equal(inv.totals.analyses, 1);
  assert.equal(inv.totals.regularTests, 18);
  assert.equal(inv.totals.reusableBlocks, 5);
  assert.equal(a.regularTestCount, 18);
  assert.equal(a.reusableBlockCount, 5);

  // Status summary is over the 18 regular test cases only.
  const summed = Object.values(a.statusSummary).reduce((n, v) => n + v, 0);
  assert.equal(summed, 18);
  assert.equal(a.statusSummary["PASSED"], 2);
  assert.equal(a.statusSummary["FAILED"], 1);
  assert.equal(a.statusSummary[NOT_RUN], 15);

  // Reusable blocks are present, flagged, and always NOT_RUN.
  const reusable = a.testCases.filter((t) => t.kind === "REUSABLE");
  assert.equal(reusable.length, 5);
  assert.ok(reusable.every((t) => t.status === NOT_RUN));

  // A specific never-run regular test surfaces as NOT_RUN (issue #3).
  const us005 = a.testCases.find((t) => t.id === "US005:TC001");
  assert.equal(us005?.status, NOT_RUN);

  // Fully-qualified id format US:TC.
  const failed = a.testCases.find((t) => t.id === "US001:TC004");
  assert.equal(failed?.status, "FAILED");
  assert.equal(failed?.kind, "REGULAR");
});

test("empty analysis contributes zero counts (issue #1: 'one empty')", () => {
  const inv = buildTestInventory([
    {
      suite: { uuid: "s0", name: "Analysis - A000", analysisIdentifier: "A000", suiteRunningStatus: "IDLE" } as any,
      artifactContent: null, // ungenerated
      execGroups: [],
    },
    {
      suite: { uuid: "s1", name: "Analysis - A001", analysisIdentifier: "A001", suiteRunningStatus: "IDLE" } as any,
      artifactContent: artifact({ reusable: 5, stories: [{ us: "US001", count: 18 }] }),
      execGroups: [],
    },
  ]);

  assert.equal(inv.totals.analyses, 2);
  assert.equal(inv.analyses[0].regularTestCount, 0);
  assert.equal(inv.analyses[0].reusableBlockCount, 0);
  assert.equal(inv.analyses[0].testCases.length, 0);
  assert.equal(inv.totals.regularTests, 18);
  assert.equal(inv.totals.reusableBlocks, 5);
});
