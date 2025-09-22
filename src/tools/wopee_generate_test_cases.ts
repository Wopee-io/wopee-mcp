import { graphqlClient } from '../graphql/client';
import { GenerateAIDataParams, GenerateAIDataSchema, ToolResult, Bucket, FetchFileParams } from '../types/index';

/**
 * GraphQL mutation for generating test cases
 */
const GENERATE_TEST_CASES_MUTATION = `
  mutation GenerateTestCases(
    $projectUuid: ID!
    $suiteUuid: ID!
    $extraPrompt: String
    $selectedUserStories: [String!]
    $suiteAnalysisConfig: SuiteAnalysisConfigInput
    $continueGeneration: Boolean
  ) {
    generateTestCases(
      projectUuid: $projectUuid
      suiteUuid: $suiteUuid
      extraPrompt: $extraPrompt
      selectedUserStories: $selectedUserStories
      suiteAnalysisConfig: $suiteAnalysisConfig
      continueGeneration: $continueGeneration
    )
  }
`;

/**
 * GraphQL query for fetching generated data
 */
const FETCH_FILE_QUERY = `
  query FetchFile($projectUuid: ID!, $suiteUuid: ID!, $bucket: String!) {
    fetchFile(projectUuid: $projectUuid, suiteUuid: $suiteUuid, bucket: $bucket)
  }
`;

/**
 * Generate test cases based on analysis results
 * 
 * @param params - Parameters containing project UUID, suite UUID and optional configuration
 * @returns Promise with generated test cases data
 */
export async function wopee_generate_test_cases(params: GenerateAIDataParams): Promise<ToolResult<string>> {
  try {
    // Validate input parameters
    const validatedParams = GenerateAIDataSchema.parse(params);

    // Execute GraphQL mutation
    const response = await graphqlClient.getInstance().mutate<{ generateTestCases: boolean }>(
      GENERATE_TEST_CASES_MUTATION,
      validatedParams
    );

    if (response.generateTestCases) {
      // Fetch the generated data from the bucket
      const fetchParams: FetchFileParams = {
        projectUuid: validatedParams.projectUuid,
        suiteUuid: validatedParams.suiteUuid,
        bucket: Bucket.PLAYWRIGHT_CODE,
      };

      const fetchResponse = await graphqlClient.getInstance().request<{ fetchFile: string }>(
        FETCH_FILE_QUERY,
        fetchParams
      );

      return {
        success: true,
        data: fetchResponse.fetchFile,
        message: `Test cases generated successfully for project: ${validatedParams.projectUuid}`,
      };
    } else {
      return {
        success: false,
        error: `Failed to generate test cases for project: ${validatedParams.projectUuid}`,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: `Failed to generate test cases: ${errorMessage}`,
    };
  }
}
