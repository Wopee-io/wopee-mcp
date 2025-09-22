import { wopee_generate_general_user_stories } from '../../src/tools/wopee_generate_general_user_stories';

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



describe('wopee_generate_general_user_stories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully generate general user stories with valid parameters', async () => {
    const mockMutationResponse = {
      generateGeneralUserStories: true,
    };

    const mockFetchResponse = {
      fetchFile: 'general user stories content here',
    };

    mockMutate.mockResolvedValue(mockMutationResponse);
    mockRequest.mockResolvedValue(mockFetchResponse);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
    };

    const result = await wopee_generate_general_user_stories(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe('general user stories content here');
    expect(result.message).toContain('General user stories generated successfully');
    expect(mockMutate).toHaveBeenCalledWith(
      expect.stringContaining('generateGeneralUserStories'),
      { input: params }
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('fetchFile'),
      {
        projectUuid: 'project-123',
        suiteUuid: 'suite-123',
        bucket: 'project-suite-general-user-stories',
      }
    );
  });

  it('should handle generation failure', async () => {
    const mockMutationResponse = {
      generateGeneralUserStories: false,
    };

    mockMutate.mockResolvedValue(mockMutationResponse);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
    };

    const result = await wopee_generate_general_user_stories(params);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to generate general user stories');
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should handle GraphQL mutation errors gracefully', async () => {
    const mockError = new Error('GraphQL mutation failed: Invalid project UUID');
    mockMutate.mockRejectedValue(mockError);

    const params = {
      projectUuid: 'invalid-project',
      suiteUuid: 'suite-123',
    };

    const result = await wopee_generate_general_user_stories(params);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to generate general user stories');
    expect(result.error).toContain('Invalid project UUID');
  });

  it('should handle GraphQL fetch errors gracefully', async () => {
    const mockMutationResponse = {
      generateGeneralUserStories: true,
    };

    const mockError = new Error('GraphQL request failed: File not found');
    mockMutate.mockResolvedValue(mockMutationResponse);
    mockRequest.mockRejectedValue(mockError);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
    };

    const result = await wopee_generate_general_user_stories(params);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to generate general user stories');
    expect(result.error).toContain('File not found');
  });

  it('should validate required parameters', async () => {
    const invalidParams = {
      projectUuid: '',
      suiteUuid: 'suite-123',
    };

    const result = await wopee_generate_general_user_stories(invalidParams as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to generate general user stories');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should handle full configuration parameters', async () => {
    const mockMutationResponse = {
      generateGeneralUserStories: true,
    };

    const mockFetchResponse = {
      fetchFile: 'general user stories content here',
    };

    mockMutate.mockResolvedValue(mockMutationResponse);
    mockRequest.mockResolvedValue(mockFetchResponse);

    const params = {
      projectUuid: 'project-123',
      suiteUuid: 'suite-123',
      extraPrompt: 'Generate comprehensive general user stories',
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

    const result = await wopee_generate_general_user_stories(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe('general user stories content here');
    expect(mockMutate).toHaveBeenCalledWith(
      expect.stringContaining('generateGeneralUserStories'),
      { input: params }
    );
  });
});
