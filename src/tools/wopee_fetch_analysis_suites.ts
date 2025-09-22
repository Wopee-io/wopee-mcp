import { graphqlClient } from '../graphql/client';
import { FetchAnalysisSuitesParams, FetchAnalysisSuitesSchema, FetchAnalysisSuiteResponse, ToolResult } from '../types/index';

/**
 * GraphQL query to fetch analysis suites for a project
 */
const FETCH_ANALYSIS_SUITES_QUERY = `
  query FetchAnalysisSuites($projectUuid: ID!) {
    fetchAnalysisSuites(projectUuid: $projectUuid) {
      uuid
      name
      suiteType
      uploadStatus
      executionStatus
      analysisIdentifier
      suiteRunningStatus
      createdAt
      updatedAt
      generatedAnalysisDataState {
        uuid
        suiteUuid
        appContext {
          uuid
          isGenerated
          status
        }
        generalUserStories {
          uuid
          isGenerated
          status
        }
        userStories {
          uuid
          isGenerated
          status
        }
        testCases {
          uuid
          isGenerated
          status
        }
      }
    }
  }
`;

/**
 * Fetch analysis suites for a project
 * 
 * @param params - Parameters containing projectUuid
 * @returns Promise<ToolResult<FetchAnalysisSuiteResponse[]>>
 */
export async function wopee_fetch_analysis_suites(
  params: FetchAnalysisSuitesParams
): Promise<ToolResult<FetchAnalysisSuiteResponse[]>> {
  try {
    // Validate input parameters
    const validatedParams = FetchAnalysisSuitesSchema.parse(params);

    console.log(`[Wopee MCP] Fetching analysis suites for project: ${validatedParams.projectUuid}`);

    const response = await graphqlClient.getInstance().request<{
      fetchAnalysisSuites: FetchAnalysisSuiteResponse[];
    }>(FETCH_ANALYSIS_SUITES_QUERY, {
      projectUuid: validatedParams.projectUuid,
    });

    if (!response.fetchAnalysisSuites) {
      return {
        success: false,
        error: 'No analysis suites found for the specified project',
      };
    }

    console.log(`[Wopee MCP] Successfully fetched ${response.fetchAnalysisSuites.length} analysis suites`);

    return {
      success: true,
      data: response.fetchAnalysisSuites,
      message: `Found ${response.fetchAnalysisSuites.length} analysis suites`,
    };
  } catch (error) {
    console.error('[Wopee MCP] Error fetching analysis suites:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: `Failed to fetch analysis suites: ${errorMessage}`,
    };
  }
}
