import { GraphQLClient } from 'graphql-request';
import { configManager } from '../config';
import { GraphQLResponse } from '../types/index';

/**
 * GraphQL client for Wopee API
 */
export class WopeeGraphQLClient {
  private client: GraphQLClient;
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    const config = configManager.getInstance().getConfig();
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
    
    this.client = new GraphQLClient(this.apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'api_key': this.apiKey,
      },
    });
  }

  /**
   * Execute a GraphQL query
   * @param query - GraphQL query string
   * @param variables - Query variables
   * @returns Promise with the response data
   */
  async request<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.request<GraphQLResponse<T>>(query, variables);
      
      if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map(error => error.message).join(', ');
        throw new Error(`GraphQL errors: ${errorMessages}`);
      }

      return response.data || response as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`GraphQL request failed: ${error.message}`);
      }
      throw new Error('Unknown GraphQL request error');
    }
  }

  /**
   * Execute a GraphQL mutation
   * @param mutation - GraphQL mutation string
   * @param variables - Mutation variables
   * @returns Promise with the response data
   */
  async mutate<T = any>(mutation: string, variables?: Record<string, any>): Promise<T> {
    return this.request<T>(mutation, variables);
  }

  /**
   * Get the current API URL
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiUrl);
  }
}

// Export singleton instance (lazy initialization)
let _graphqlClient: WopeeGraphQLClient | null = null;

export const graphqlClient = {
  getInstance(): WopeeGraphQLClient {
    if (!_graphqlClient) {
      _graphqlClient = new WopeeGraphQLClient();
    }
    return _graphqlClient;
  }
};
