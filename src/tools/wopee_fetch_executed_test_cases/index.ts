import {
  WopeeFetchExecutedTestCasesInput,
  WopeeFetchExecutedTestCasesInputSchema,
  FetchExecutedTestCasesInputSchema,
} from "./schema.js";
import { FetchExecutedTestCasesResponse, ToolName } from "../shared/types.js";
import { _parseError } from "../shared/helpers.js";
import { createFetchExecutedTestCasesInput } from "./factory.js";
import { FetchExecutedTestCases } from "../shared/gql-queries.js";
import { requestClient } from "../../utils/requestClient.js";

export const wopeeFetchExecutedTestCases = {
  name: ToolName.WOPEE_FETCH_EXECUTED_TEST_CASES,
  config: {
    title: "Fetch test execution results",
    description:
      "Retrieve results of test cases executed by the autonomous agent. Returns each test case with its execution status (IN_PROGRESS, FINISHED, FAILED), agent report (natural language findings), and code report (technical details). Read-only: does not trigger any execution. Use this after wopee_dispatch_agent to check results — if status is IN_PROGRESS, wait and call again. Requires suite UUID. Optionally accepts an analysis identifier (e.g. A068, found in suite data) to filter to a specific analysis run. Returns an empty array if no test cases have been executed in this suite. Do NOT use this to fetch test artifacts like user stories or code — use wopee_fetch_artifact for that.",
    inputSchema: WopeeFetchExecutedTestCasesInputSchema.shape,
  },
  handler: async (input: WopeeFetchExecutedTestCasesInput) => {
    try {
      const factoryInput = createFetchExecutedTestCasesInput(input);
      const parsedInput =
        FetchExecutedTestCasesInputSchema.parse(factoryInput);

      const result = await requestClient<{
        fetchExecutedTestCases: FetchExecutedTestCasesResponse[];
      }>(FetchExecutedTestCases, {
        input: parsedInput,
      });

      if (!result?.fetchExecutedTestCases)
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to fetch executed test cases: no data returned",
            },
          ],
        };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result.fetchExecutedTestCases, null, 2),
          },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
