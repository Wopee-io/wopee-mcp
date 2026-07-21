// Pure, dependency-free join logic for wopee_fetch_test_inventory.
//
// The source of truth for "what tests exist" is the USER_STORIES artifact
// (tests.json), NOT the execution history. Execution queries only ever return
// test cases that have run, so never-run tests must be surfaced by LEFT-joining
// the authored list against executions. This mirrors the CMD client join in
// cmd/composables/useAnalysisScenarios.ts + the verdict rule in
// cmd/composables/useLibraryStatus.ts (rowVerdict).
//
// Imports are type-only so this module has no runtime dependencies (keeps it
// trivially unit-testable via node:test without module resolution).
import type {
  AnalysisSuite,
  ExecutedTestCase,
  FetchExecutedTestCasesResponse,
} from "../shared/types.js";

// The special user story that holds reusable blocks (building blocks referenced
// by other test cases' steps, not independently runnable). Forced onto reusable
// test cases at generation time (api generateReusableTestCases.ts).
export const REUSABLE_USER_STORY_ID = "R001";

export const NOT_RUN = "NOT_RUN";

type AuthoredTestCase = {
  testCaseId: string;
  name?: string;
  steps?: unknown[];
};

type AuthoredUserStory = {
  userStoryId: string;
  userStoryName?: string;
  userStoryCategory?: string;
  testCases?: AuthoredTestCase[];
};

export type InventoryTestCase = {
  id: string; // `${userStoryId}:${testCaseId}`, e.g. "US001:TC001"
  userStoryId: string;
  userStoryName: string;
  userStoryCategory: string;
  testCaseId: string;
  name: string;
  kind: "REGULAR" | "REUSABLE";
  // PASSED | FAILED | INCOMPLETE | IN_QUEUE | IN_PROGRESS | FINISHED | STOPPED | NOT_RUN
  status: string;
  executedAt: string | null;
};

export type AnalysisInventory = {
  analysisIdentifier: string | null;
  suiteUuid: string;
  name: string | null;
  suiteRunningStatus: string | null;
  regularTestCount: number;
  reusableBlockCount: number;
  statusSummary: Record<string, number>; // over REGULAR (runnable) test cases only
  testCases: InventoryTestCase[];
};

export type TestInventory = {
  totals: {
    analyses: number;
    regularTests: number;
    reusableBlocks: number;
  };
  analyses: AnalysisInventory[];
};

export type AnalysisInput = {
  suite: AnalysisSuite;
  /** Raw USER_STORIES artifact content (tests.json), or null when ungenerated. */
  artifactContent: string | null;
  /** Grouped execution history for the suite, or [] when none. */
  execGroups: FetchExecutedTestCasesResponse[];
};

/** Parse the USER_STORIES artifact JSON; tolerant of null/empty/malformed. */
export function parseUserStories(content: string | null): AuthoredUserStory[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    const stories = parsed?.userStories;
    return Array.isArray(stories) ? (stories as AuthoredUserStory[]) : [];
  } catch {
    return [];
  }
}

/**
 * Index every execution by `${userStoryId}::${testCaseId}`, newest first.
 * Sorted by createdAt descending so index[key][0] is the latest run.
 */
export function indexExecutions(
  groups: FetchExecutedTestCasesResponse[],
): Map<string, ExecutedTestCase[]> {
  const map = new Map<string, ExecutedTestCase[]>();
  for (const grp of groups ?? []) {
    for (const etc of grp.executedTestCases ?? []) {
      const key = `${etc.userStoryId}::${etc.testCaseId}`;
      const list = map.get(key);
      if (list) list.push(etc);
      else map.set(key, [etc]);
    }
  }
  for (const list of map.values())
    list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return map;
}

/**
 * Latest-run verdict, matching CMD rowVerdict precedence: the agent report is
 * the trace-verified verdict, then the code report, then the raw execution
 * status, else "not run". Report statuses (PASSED/FAILED/INCOMPLETE) win over
 * a bare FINISHED — a FINISHED run can still be a FAILED verdict.
 */
export function resolveStatus(exec: ExecutedTestCase | undefined): string {
  if (!exec) return NOT_RUN;
  const report = exec.agentReportStatus || exec.codeReportStatus;
  if (report) return report;
  return exec.executionStatus ?? NOT_RUN;
}

function buildAnalysisInventory({
  suite,
  artifactContent,
  execGroups,
}: AnalysisInput): AnalysisInventory {
  const userStories = parseUserStories(artifactContent);
  const execIndex = indexExecutions(execGroups);

  const testCases: InventoryTestCase[] = [];
  const statusSummary: Record<string, number> = {};
  let regularTestCount = 0;
  let reusableBlockCount = 0;

  for (const story of userStories) {
    const isReusable = story.userStoryId === REUSABLE_USER_STORY_ID;
    for (const tc of story.testCases ?? []) {
      if (isReusable) reusableBlockCount += 1;
      else regularTestCount += 1;

      // Reusable blocks are not independently runnable, so they never carry an
      // execution status.
      const exec = isReusable
        ? undefined
        : execIndex.get(`${story.userStoryId}::${tc.testCaseId}`)?.[0];
      const status = resolveStatus(exec);

      if (!isReusable)
        statusSummary[status] = (statusSummary[status] ?? 0) + 1;

      testCases.push({
        id: `${story.userStoryId}:${tc.testCaseId}`,
        userStoryId: story.userStoryId,
        userStoryName: story.userStoryName ?? "",
        userStoryCategory: story.userStoryCategory ?? "",
        testCaseId: tc.testCaseId,
        name: tc.name ?? "",
        kind: isReusable ? "REUSABLE" : "REGULAR",
        status,
        executedAt: exec?.updatedAt ?? exec?.createdAt ?? null,
      });
    }
  }

  return {
    analysisIdentifier: suite.analysisIdentifier,
    suiteUuid: suite.uuid,
    name: suite.name,
    suiteRunningStatus: suite.suiteRunningStatus,
    regularTestCount,
    reusableBlockCount,
    statusSummary,
    testCases,
  };
}

/**
 * Assemble the full test inventory across analyses: regular vs reusable counts,
 * and every authored test case with its latest execution status (never-run =
 * NOT_RUN). This is the single deterministic answer for "how many tests",
 * "list scenarios", and "executed + not-run in one list".
 */
export function buildTestInventory(inputs: AnalysisInput[]): TestInventory {
  const analyses = inputs.map(buildAnalysisInventory);
  return {
    totals: {
      analyses: analyses.length,
      regularTests: analyses.reduce((n, a) => n + a.regularTestCount, 0),
      reusableBlocks: analyses.reduce((n, a) => n + a.reusableBlockCount, 0),
    },
    analyses,
  };
}
