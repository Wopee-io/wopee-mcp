import { graphqlClient } from '../graphql/client';
import { DispatchAgentParams, DispatchAgentSchema, ToolResult } from '../types/index';

/**
 * GraphQL mutation for dispatching agent
 */
const DISPATCH_AGENT_MUTATION = `
  mutation DispatchAgent(
    $input: TestCasesInput!
  ) {
    dispatchAgent(input: $input)
  }
`;

/**
 * Dispatch agent to run tests for the given project and suite
 * 
 * @param params - Parameters containing project UUID, suite UUID, analysis identifier and optional test cases
 * @returns Promise with boolean result indicating success
 */
export async function wopee_dispatch_agent(params: DispatchAgentParams): Promise<ToolResult<boolean>> {
  try {
    // Validate input parameters
    const validatedParams = DispatchAgentSchema.parse(params);

    // Execute GraphQL mutation with input object
    const response = await graphqlClient.getInstance().mutate<{ dispatchAgent: boolean }>(
      DISPATCH_AGENT_MUTATION,
      { input: validatedParams }
    );

    return {
      success: true,
      data: response.dispatchAgent,
      message: response.dispatchAgent 
        ? `Agent dispatched successfully for suite: ${validatedParams.suiteUuid}`
        : `Agent dispatch failed for suite: ${validatedParams.suiteUuid}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: `Failed to dispatch agent: ${errorMessage}`,
    };
  }
}
