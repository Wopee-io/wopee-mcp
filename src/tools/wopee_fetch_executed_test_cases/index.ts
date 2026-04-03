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
    title: "Fetch executed test cases",
    description:
      "Fetch executed test cases and their results (agent report, code report, execution status) for a given analysis suite.",
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
