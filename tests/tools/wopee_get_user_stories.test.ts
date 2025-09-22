import { wopee_get_user_stories } from '../../src/tools/wopee_get_user_stories';

// Mock the GraphQL client
const mockRequest = jest.fn();
jest.mock('../../src/graphql/client', () => ({
  graphqlClient: {
    getInstance: jest.fn(() => ({
      request: mockRequest,
    })),
  },
}));

describe('wopee_get_user_stories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully get user stories', async () => {
    const mockResponse = {
      fetchFile: 'user stories content here',
    };

    mockRequest.mockResolvedValue(mockResponse);

    const params = {
      projectUuid: 'test-project-uuid',
      suiteUuid: 'test-suite-uuid',
    };

    const result = await wopee_get_user_stories(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe('user stories content here');
    expect(result.message).toContain('User stories retrieved successfully');
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('fetchFile'),
      {
        projectUuid: 'test-project-uuid',
        suiteUuid: 'test-suite-uuid',
        bucket: 'project-suite-user-stories',
      }
    );
  });

  it('should handle GraphQL errors gracefully', async () => {
    const mockError = new Error('GraphQL request failed: File not found');
    mockRequest.mockRejectedValue(mockError);

    const params = {
      projectUuid: 'test-project-uuid',
      suiteUuid: 'test-suite-uuid',
    };

    const result = await wopee_get_user_stories(params);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to get user stories');
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('fetchFile'),
      {
        projectUuid: 'test-project-uuid',
        suiteUuid: 'test-suite-uuid',
        bucket: 'project-suite-user-stories',
      }
    );
  });

  it('should validate required parameters', async () => {
    const params = {
      // Missing required parameters
    };

    const result = await wopee_get_user_stories(params as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to get user stories');
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should handle empty response gracefully', async () => {
    const mockResponse = {
      fetchFile: '',
    };

    mockRequest.mockResolvedValue(mockResponse);

    const params = {
      projectUuid: 'test-project-uuid',
      suiteUuid: 'test-suite-uuid',
    };

    const result = await wopee_get_user_stories(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe('');
    expect(result.message).toContain('User stories retrieved successfully');
  });
});
