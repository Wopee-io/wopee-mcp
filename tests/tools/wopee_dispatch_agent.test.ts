import { wopee_dispatch_agent } from '../../src/tools/wopee_dispatch_agent';


// Mock the GraphQL client
const mockMutate = jest.fn();
jest.mock('../../src/graphql/client', () => ({
  graphqlClient: {
    getInstance: jest.fn(() => ({
      mutate: mockMutate,
    })),
  },
}));



describe('wopee_dispatch_agent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully dispatch agent with valid parameters', async () => {
    const mockResponse = {
      dispatchAgent: true,
    };

    mockMutate.mockResolvedValue(mockResponse);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
      analysisIdentifier: 'analysis-123',
    };

    const result = await wopee_dispatch_agent(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe(true);
    expect(result.message).toContain('Agent dispatched successfully');
    expect(mockMutate).toHaveBeenCalledWith(
      expect.stringContaining('dispatchAgent'),
      { input: params }
    );
  });

  it('should successfully dispatch agent with test cases', async () => {
    const mockResponse = {
      dispatchAgent: true,
    };

    mockMutate.mockResolvedValue(mockResponse);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
      analysisIdentifier: 'analysis-123',
      testCases: [
        {
          testCaseId: 'test-case-1',
          userStoryId: 'user-story-1',
        },
        {
          testCaseId: 'test-case-2',
          userStoryId: 'user-story-2',
        },
      ],
      skipRateLimitCheck: true,
    };

    const result = await wopee_dispatch_agent(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe(true);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.stringContaining('dispatchAgent'),
      { input: params }
    );
  });

  it('should handle dispatch failure', async () => {
    const mockResponse = {
      dispatchAgent: false,
    };

    mockMutate.mockResolvedValue(mockResponse);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
      analysisIdentifier: 'analysis-123',
    };

    const result = await wopee_dispatch_agent(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe(false);
    expect(result.message).toContain('Agent dispatch failed');
  });

  it('should handle GraphQL errors gracefully', async () => {
    const mockError = new Error('GraphQL request failed: Invalid suite UUID');
    mockMutate.mockRejectedValue(mockError);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'invalid-suite',
      analysisIdentifier: 'analysis-123',
    };

    const result = await wopee_dispatch_agent(params);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to dispatch agent');
    expect(result.error).toContain('Invalid suite UUID');
  });

  it('should validate required parameters', async () => {
    const invalidParams = {
      projectUuid: 'project-123',
      // Missing suiteUuid and analysisIdentifier
    };

    const result = await wopee_dispatch_agent(invalidParams as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to dispatch agent');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should validate test case structure', async () => {
    const invalidParams = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
      analysisIdentifier: 'analysis-123',
      testCases: [
        {
          testCaseId: 'test-case-1',
          // Missing userStoryId
        },
      ],
    };

    const result = await wopee_dispatch_agent(invalidParams as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to dispatch agent');
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
