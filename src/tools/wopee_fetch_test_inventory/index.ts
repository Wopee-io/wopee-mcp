import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { _parseError } from "../shared/helpers.js";
import {
  AnalysisSuite,
  ArtifactType,
  FetchExecutedTestCasesResponse,
  ToolName,
} from "../shared/types.js";
import {
  FetchAnalysisSuites,
  FetchArtifact,
  FetchExecutedTestCases,
} from "../shared/gql-queries.js";
import {
  WopeeFetchTestInventoryInput,
  WopeeFetchTestInventoryInputSchema,
} from "./schema.js";
import { buildTestInventory, AnalysisInput } from "./logic.js";

export const wopeeFetchTestInventory = {
  name: ToolName.WOPEE_FETCH_TEST_INVENTORY,
  config: {
    title: "Fetch test inventory (counts + statuses)",
    description:
      "The authoritative tool for how many tests exist and their latest status. Returns, per analysis, the FULL list of authored test cases joined with their latest execution status — including never-run ones as NOT_RUN. Use this for questions like 'how many tests do I have', 'list the scenarios/test cases in A001', or 'show executed and not-run tests in one table'. Terminology: a 'scenario' is a test case; test cases are grouped under user stories (US001) and identified as US001:TC001. Reusable blocks (user story R001) are counted separately (reusableBlockCount) and are building blocks, not runnable, so they never carry an execution status. Regular tests are all non-R001 test cases. Read-only. Takes an optional analysisIdentifier (e.g. A001) to scope to one analysis; omit to cover every analysis in the project. Prefer this over wopee_fetch_recent_executions / wopee_fetch_executed_test_cases when the user asks about totals or the complete list — those return only test cases that have already run.",
    inputSchema: WopeeFetchTestInventoryInputSchema.shape,
  },
  handler: async (input: WopeeFetchTestInventoryInput) => {
    try {
      const { WOPEE_PROJECT_UUID } = getConfig();

      if (!WOPEE_PROJECT_UUID)
        return {
          content: [
            { type: "text" as const, text: "WOPEE_PROJECT_UUID is not set" },
          ],
        };

      const parsed = WopeeFetchTestInventoryInputSchema.parse(input ?? {});

      const suitesResult = await requestClient<{
        fetchAnalysisSuites: AnalysisSuite[];
      }>(FetchAnalysisSuites, { projectUuid: WOPEE_PROJECT_UUID });

      let suites = suitesResult?.fetchAnalysisSuites ?? [];
      if (parsed.analysisIdentifier)
        suites = suites.filter(
          (s) => s.analysisIdentifier === parsed.analysisIdentifier,
        );

      if (suites.length === 0)
        return {
          content: [
            {
              type: "text" as const,
              text: parsed.analysisIdentifier
                ? `No analysis found with identifier ${parsed.analysisIdentifier}.`
                : "No analyses found in this project yet.",
            },
          ],
        };

      // Fetch the authored test cases (USER_STORIES artifact) and execution
      // history for every analysis in parallel. A failure on one suite (e.g. an
      // analysis with no generated tests yet) degrades to an empty result for
      // that suite rather than failing the whole inventory.
      const inputs: AnalysisInput[] = await Promise.all(
        suites.map(async (suite): Promise<AnalysisInput> => {
          const [artifactRes, execRes] = await Promise.allSettled([
            requestClient<{ fetchArtifact: { content: string | null } }>(
              FetchArtifact,
              {
                input: {
                  projectUuid: WOPEE_PROJECT_UUID,
                  suiteUuid: suite.uuid,
                  type: ArtifactType.USER_STORIES,
                  ref: suite.analysisIdentifier ?? undefined,
                },
              },
            ),
            requestClient<{
              fetchExecutedTestCases: FetchExecutedTestCasesResponse[];
            }>(FetchExecutedTestCases, {
              input: {
                projectUuid: WOPEE_PROJECT_UUID,
                analysisSuiteUuid: suite.uuid,
                analysisIdentifier: suite.analysisIdentifier ?? "",
              },
            }),
          ]);

          return {
            suite,
            artifactContent:
              artifactRes.status === "fulfilled"
                ? (artifactRes.value?.fetchArtifact?.content ?? null)
                : null,
            execGroups:
              execRes.status === "fulfilled"
                ? (execRes.value?.fetchExecutedTestCases ?? [])
                : [],
          };
        }),
      );

      const inventory = buildTestInventory(inputs);

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(inventory, null, 2) },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
