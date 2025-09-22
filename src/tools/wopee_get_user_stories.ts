import { graphqlClient } from '../graphql/client';
import { GetUserStoriesParams, GetUserStoriesSchema, ToolResult, Bucket } from '../types/index';

/**
 * GraphQL query for fetching user stories
 */
const FETCH_FILE_QUERY = `
  query FetchFile($projectUuid: ID!, $suiteUuid: ID!, $bucket: String!) {
    fetchFile(projectUuid: $projectUuid, suiteUuid: $suiteUuid, bucket: $bucket)
  }
`;

/**
 * Get existing user stories for the given project and suite.
 *
 * @param params - Parameters containing project UUID and suite UUID.
 * @returns Promise with user stories data.
 */
export async function wopee_get_user_stories(params: GetUserStoriesParams): Promise<ToolResult<string>> {
  try {
    // Validate input parameters
    const validatedParams = GetUserStoriesSchema.parse(params);

    // Execute GraphQL query to fetch user stories
    const response = await graphqlClient.getInstance().request<{ fetchFile: string }>(
      FETCH_FILE_QUERY,
      {
        projectUuid: validatedParams.projectUuid,
        suiteUuid: validatedParams.suiteUuid,
        bucket: Bucket.USER_STORIES,
      }
    );

    return {
      success: true,
      data: response.fetchFile,
      message: `User stories retrieved successfully for project: ${validatedParams.projectUuid}`,
    };
  } catch (error: any) {
    console.error('[wopee_get_user_stories] Error:', error);
    return {
      success: false,
      error: `Failed to get user stories: ${error.message || 'Unknown error'}`,
    };
  }
}
