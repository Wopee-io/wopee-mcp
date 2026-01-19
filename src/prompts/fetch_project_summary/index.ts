import { PromptName } from "../shared/types.js";

export const fetchProjectSummary = {
  name: PromptName.FETCH_PROJECT_SUMMARY,
  config: {
    title: "Fetch project summary",
    description: "Fetch project summary in pre-formatted markdown tables",
  },
  handler: () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please, fetch my analysis suites using 'wopee_fetch_analysis_suites' tool and if there are more than 5 suites, ask the user to specify how many suites he wishes to use for further processing. Then for each suite in the list, fetch its user stories/test cases using 'wopee_fetch_artifact' tool with the type 'USER_STORIES'.
          
          After fetching all of the necessary data, summarize and display two readable markdown tables as an output in the same chat conversation. Do NOT create, write, or save any files to disk - only display the formatted tables in your response:

          - The first table should have the following columns:
            - analysis name
            - number of user stories
            - number of test cases

          ### Example of the first table:

          | 📊 Analysis Name | 📝 User Stories | ✅ Test Cases |
          |-------------------|-----------------|---------------|
          | Analysis - A068   | 5               | 8             |
          | Analysis - A067   | 5               | 7             |

          ___

          - The second table should have the following columns:
            - analysis name
              - user story category
                - user story name
                  - test case name
                    - number of steps

          ### Example of the second table:
          | 📊 Analysis Name | 📁 User Story Category | 📋 User Story Name | 🧪 Test Case Name | 🔢 Steps |
          |-------------------|------------------------|-------------------|-------------------|-------------|
          | Analysis - A068 | User Authentication | Authentication and Access to Promotions | Successful Sign In and Promotion Visibility | 7 |
          | | | | Login Form Validation - Empty Required Fields | 4 |
          | | | | Login Failure with Invalid Credentials | 7 |
          | | Account Support | Account Assistance and Support Navigation | Navigate to sign-in page and verify 'Forget your password?' link | 2 |
          | | | | Password help link redirects to support page | 5 |
          | Analysis - A067 | User Authentication | Sign In with @tesena.com Email to Access Catalogue | Sign in form loads with all required elements present | 5 |
          | | | | Sign in with valid @tesena.com credentials redirects to catalogue | 5 |

          ___

          ## Important Notes:
            - Use short, yet descriptive names for the column headers.
            - Please, add emojis for the column headers.
          `,
        },
      },
    ],
  }),
};
