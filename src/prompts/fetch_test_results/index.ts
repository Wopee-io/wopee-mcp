import { PromptName } from "../shared/types.js";

export const fetchTestResults = {
  name: PromptName.FETCH_TEST_RESULTS,
  config: {
    title: "Fetch test results",
    description:
      "Fetch and display test execution results for analysis suites",
  },
  handler: () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please, fetch my analysis suites using 'wopee_fetch_analysis_suites' tool. If there are more than 5 suites, ask the user to select which suite(s) they want to see results for.

          Then, for each selected suite, fetch the executed test cases using 'wopee_fetch_executed_test_cases' tool with the suite's uuid and analysisIdentifier.

          After fetching all of the necessary data, summarize and display readable markdown tables as an output in the same chat conversation. Do NOT create, write, or save any files to disk - only display the formatted tables in your response.

          Display the following tables:

          1. **Suite Overview Table** - one row per suite showing:
            - Suite name
            - Analysis identifier
            - Execution status
            - Suite running status

          ### Example:
          | Suite Name | Identifier | Execution Status | Running Status |
          |------------|------------|------------------|----------------|
          | Analysis - A068 | A068 | FINISHED | IDLE |
          | Analysis - A067 | A067 | IN_PROGRESS | IN_PROGRESS |

          ___

          2. **Test Case Results Table** - for each suite that has executed test cases:
            - Suite name
            - User story ID
            - Test case ID
            - Execution status
            - Agent report status (PASSED/FAILED or N/A)
            - Code report status (PASSED/FAILED or N/A)

          ### Example:
          | Suite Name | User Story | Test Case | Execution | Agent Status | Code Status |
          |------------|------------|-----------|-----------|--------------|-------------|
          | Analysis - A068 | US001 | TC001 | FINISHED | PASSED | PASSED |
          | | US001 | TC002 | FINISHED | PASSED | FAILED |
          | | US002 | TC001 | FINISHED | FAILED | N/A |
          | Analysis - A067 | US001 | TC001 | IN_PROGRESS | N/A | N/A |

          ___

          3. If any test case has a FAILED agent or code report status, display the report content below the tables under a "Failed Reports" section, showing the suite name, test case ID, and the report text.

          ## Important Notes:
            - If a test case's executionStatus is IN_PROGRESS, note that results are not yet available.
            - Use "N/A" for report statuses that are null (not yet available).
            - Group test cases by user story within each suite.
          `,
        },
      },
    ],
  }),
};
