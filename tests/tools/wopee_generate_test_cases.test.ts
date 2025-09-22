import { wopee_generate_test_cases } from '../../src/tools/wopee_generate_test_cases';


// Mock the GraphQL client
const mockMutate = jest.fn();
const mockRequest = jest.fn();
jest.mock('../../src/graphql/client', () => ({
  graphqlClient: {
    getInstance: jest.fn(() => ({
      mutate: mockMutate,
      request: mockRequest,
    })),
  },
}));



describe('wopee_generate_test_cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully generate test cases with valid parameters', async () => {
    const mockMutationResponse = {
      generateTestCases: true,
    };

    const mockFetchResponse = {
      fetchFile: 'test cases content here',
    };

    mockMutate.mockResolvedValue(mockMutationResponse);
    mockRequest.mockResolvedValue(mockFetchResponse);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
    };

    const result = await wopee_generate_test_cases(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe('test cases content here');
    expect(result.message).toContain('Test cases generated successfully');
    expect(mockMutate).toHaveBeenCalledWith(
      expect.stringContaining('generateTestCases'),
      params
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('fetchFile'),
      {
        projectUuid: 'project-123',
        suiteUuid: 'suite-123',
        bucket: 'project-suite-playwright-code',
      }
    );
  });

  it('should handle generation failure', async () => {
    const mockMutationResponse = {
      generateTestCases: false,
    };

    mockMutate.mockResolvedValue(mockMutationResponse);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
    };

    const result = await wopee_generate_test_cases(params);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to generate test cases');
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should handle GraphQL mutation errors gracefully', async () => {
    const mockError = new Error('GraphQL mutation failed: Invalid project UUID');
    mockMutate.mockRejectedValue(mockError);

    const params = {
      projectUuid: 'invalid-project',
      suiteUuid: 'suite-123',
    };

    const result = await wopee_generate_test_cases(params);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to generate test cases');
    expect(result.error).toContain('Invalid project UUID');
  });

  it('should handle GraphQL fetch errors gracefully', async () => {
    const mockMutationResponse = {
      generateTestCases: true,
    };

    const mockError = new Error('GraphQL request failed: File not found');
    mockMutate.mockResolvedValue(mockMutationResponse);
    mockRequest.mockRejectedValue(mockError);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
    };

    const result = await wopee_generate_test_cases(params);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to generate test cases');
    expect(result.error).toContain('File not found');
  });

  it('should validate required parameters', async () => {
    const invalidParams = {
      projectUuid: '',
      suiteUuid: 'suite-123',
    };

    const result = await wopee_generate_test_cases(invalidParams as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to generate test cases');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should handle full configuration parameters', async () => {
    const mockMutationResponse = {
      generateTestCases: true,
    };

    const mockFetchResponse = {
      fetchFile: 'test cases content here',
    };

    mockMutate.mockResolvedValue(mockMutationResponse);
    mockRequest.mockResolvedValue(mockFetchResponse);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
      extraPrompt: 'Generate comprehensive test cases',
      selectedUserStories: ['story-1', 'story-2'],
      suiteAnalysisConfig: {
        startingUrl: 'https://example.com',
        username: 'testuser',
        password: 'testpass',
        cookiesPreference: 'ACCEPT_ALL' as any,
        additionalInstructions: 'Test instructions',
        additionalVariables: 'Test variables',
      },
      continueGeneration: true,
    };

    const result = await wopee_generate_test_cases(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe('test cases content here');
    expect(mockMutate).toHaveBeenCalledWith(
      expect.stringContaining('generateTestCases'),
      params
    );
  });
});
