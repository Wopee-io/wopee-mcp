import { graphqlClient } from '../graphql/client';
import { GetTestCasesParams, GetTestCasesSchema, ToolResult, Bucket } from '../types/index';

/**
 * GraphQL query for fetching test cases
 */
const FETCH_FILE_QUERY = `
  query FetchFile($projectUuid: ID!, $suiteUuid: ID!, $bucket: String!) {
    fetchFile(projectUuid: $projectUuid, suiteUuid: $suiteUuid, bucket: $bucket)
  }
`;

/**
 * Get existing test cases for the given project and suite.
 * Note: Currently uses the same bucket as user stories, may be changed later.
 *
 * @param params - Parameters containing project UUID and suite UUID.
 * @returns Promise with test cases data.
 */
export async function wopee_get_test_cases(params: GetTestCasesParams): Promise<ToolResult<string>> {
  try {
    // Validate input parameters
    const validatedParams = GetTestCasesSchema.parse(params);

    // Execute GraphQL query to fetch test cases
    // Note: Using USER_STORIES bucket as specified, may be changed later
    const response = await graphqlClient.getInstance().request<{ fetchFile: string }>(
      FETCH_FILE_QUERY,
      {
        projectUuid: validatedParams.projectUuid,
        suiteUuid: validatedParams.suiteUuid,
        bucket: Bucket.USER_STORIES, // Same as user stories as specified
      }
    );

    return {
      success: true,
      data: response.fetchFile,
      message: `Test cases retrieved successfully for project: ${validatedParams.projectUuid}`,
    };
  } catch (error: any) {
    console.error('[wopee_get_test_cases] Error:', error);
    return {
      success: false,
      error: `Failed to get test cases: ${error.message || 'Unknown error'}`,
    };
  }
}
