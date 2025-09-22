import { graphqlClient } from '../graphql/client';
import { GetAppContextParams, GetAppContextSchema, ToolResult, Bucket } from '../types/index';

/**
 * GraphQL query for fetching app context
 */
const FETCH_FILE_QUERY = `
  query FetchFile($projectUuid: ID!, $suiteUuid: ID!, $bucket: String!) {
    fetchFile(projectUuid: $projectUuid, suiteUuid: $suiteUuid, bucket: $bucket)
  }
`;

/**
 * Get existing app context for the given project and suite.
 *
 * @param params - Parameters containing project UUID and suite UUID.
 * @returns Promise with app context data.
 */
export async function wopee_get_app_context(params: GetAppContextParams): Promise<ToolResult<string>> {
  try {
    // Validate input parameters
    const validatedParams = GetAppContextSchema.parse(params);

    // Execute GraphQL query to fetch app context
    const response = await graphqlClient.getInstance().request<{ fetchFile: string }>(
      FETCH_FILE_QUERY,
      {
        projectUuid: validatedParams.projectUuid,
        suiteUuid: validatedParams.suiteUuid,
        bucket: Bucket.APP_CONTEXT,
      }
    );

    return {
      success: true,
      data: response.fetchFile,
      message: `App context retrieved successfully for project: ${validatedParams.projectUuid}`,
    };
  } catch (error: any) {
    console.error('[wopee_get_app_context] Error:', error);
    return {
      success: false,
      error: `Failed to get app context: ${error.message || 'Unknown error'}`,
    };
  }
}
