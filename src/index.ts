#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { configManager } from './config';
import { wopee_dispatch_analysis } from './tools/wopee_dispatch_analysis';
import { wopee_dispatch_agent } from './tools/wopee_dispatch_agent';
import { wopee_generate_app_context } from './tools/wopee_generate_app_context';
import { wopee_generate_general_user_stories } from './tools/wopee_generate_general_user_stories';
import { wopee_generate_user_stories } from './tools/wopee_generate_user_stories';
import { wopee_generate_test_cases } from './tools/wopee_generate_test_cases';
import { wopee_get_app_context } from './tools/wopee_get_app_context';
import { wopee_get_user_stories } from './tools/wopee_get_user_stories';
import { wopee_get_test_cases } from './tools/wopee_get_test_cases';
import { wopee_fetch_analysis_suites } from './tools/wopee_fetch_analysis_suites';

/**
 * Wopee MCP Server
 * 
 * This server provides tools for interacting with the Wopee testing platform
 * including starting analysis, generating app context, user stories, tests,
 * and running test executions.
 */
class WopeeMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'wopee-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * Setup tool handlers for all Wopee tools
   */
  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'wopee_dispatch_analysis',
            description: 'Dispatch a new analysis for the given project to understand the application structure and behavior',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'UUID of the project to analyze',
                },
                iterations: {
                  type: 'number',
                  description: 'Number of iterations for the analysis',
                },
                suiteAnalysisConfig: {
                  type: 'object',
                  description: 'Configuration for the analysis suite',
                  properties: {
                    username: {
                      type: 'string',
                      description: 'Username for authentication',
                    },
                    password: {
                      type: 'string',
                      description: 'Password for authentication',
                    },
                    cookiesPreference: {
                      type: 'string',
                      enum: ['ACCEPT_ALL', 'DECLINE_ALL', 'IGNORE'],
                      description: 'Cookie preference for the analysis',
                    },
                    additionalInstructions: {
                      type: 'string',
                      description: 'Additional instructions for the analysis',
                    },
                    additionalVariables: {
                      type: 'string',
                      description: 'Additional variables for the analysis',
                    },
                  },
                },
                rerun: {
                  type: 'object',
                  description: 'Rerun configuration',
                  properties: {
                    suiteUuid: {
                      type: 'string',
                      description: 'UUID of the suite to rerun',
                    },
                    analysisIdentifier: {
                      type: 'string',
                      description: 'Identifier for the analysis',
                    },
                    mode: {
                      type: 'string',
                      enum: ['FULL', 'CRAWLING'],
                      description: 'Rerun mode',
                    },
                  },
                  required: ['suiteUuid', 'analysisIdentifier', 'mode'],
                },
              },
              required: ['projectUuid'],
            },
          },
          {
            name: 'wopee_dispatch_agent',
            description: 'Dispatch agent to run tests for the given project and suite',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'UUID of the project',
                },
                suiteUuid: {
                  type: 'string',
                  description: 'UUID of the test suite',
                },
                analysisIdentifier: {
                  type: 'string',
                  description: 'Identifier for the analysis',
                },
                testCases: {
                  type: 'array',
                  description: 'Array of selected test cases to run',
                  items: {
                    type: 'object',
                    properties: {
                      testCaseId: {
                        type: 'string',
                        description: 'ID of the test case',
                      },
                      userStoryId: {
                        type: 'string',
                        description: 'ID of the user story',
                      },
                    },
                    required: ['testCaseId', 'userStoryId'],
                  },
                },
                skipRateLimitCheck: {
                  type: 'boolean',
                  description: 'Whether to skip rate limit check',
                },
              },
              required: ['projectUuid', 'suiteUuid', 'analysisIdentifier'],
            },
          },
          {
            name: 'wopee_generate_app_context',
            description: 'Generate application context based on analysis results to understand the app structure',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'UUID of the project',
                },
                suiteUuid: {
                  type: 'string',
                  description: 'UUID of the test suite',
                },
                extraPrompt: {
                  type: 'string',
                  description: 'Additional prompt to modify the app context generation',
                },
                selectedUserStories: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Array of selected user story IDs',
                },
                suiteAnalysisConfig: {
                  type: 'object',
                  description: 'Configuration for the analysis suite',
                  properties: {
                    startingUrl: {
                      type: 'string',
                      description: 'Starting URL for the analysis',
                      format: 'uri',
                    },
                    username: {
                      type: 'string',
                      description: 'Username for authentication',
                    },
                    password: {
                      type: 'string',
                      description: 'Password for authentication',
                    },
                    cookiesPreference: {
                      type: 'string',
                      enum: ['ACCEPT_ALL', 'DECLINE_ALL', 'IGNORE'],
                      description: 'Cookie preference for the analysis',
                    },
                    additionalInstructions: {
                      type: 'string',
                      description: 'Additional instructions for the analysis',
                    },
                    additionalVariables: {
                      type: 'string',
                      description: 'Additional variables for the analysis',
                    },
                  },
                },
                continueGeneration: {
                  type: 'boolean',
                  description: 'Whether to continue generation from previous state',
                },
              },
              required: ['projectUuid', 'suiteUuid'],
            },
          },
          {
            name: 'wopee_generate_general_user_stories',
            description: 'Generate general user stories based on analysis results to understand user workflows',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'UUID of the project',
                },
                suiteUuid: {
                  type: 'string',
                  description: 'UUID of the test suite',
                },
                extraPrompt: {
                  type: 'string',
                  description: 'Additional prompt to modify the user story generation',
                },
                selectedUserStories: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Array of selected user story IDs',
                },
                suiteAnalysisConfig: {
                  type: 'object',
                  description: 'Configuration for the analysis suite',
                  properties: {
                    startingUrl: {
                      type: 'string',
                      description: 'Starting URL for the analysis',
                      format: 'uri',
                    },
                    username: {
                      type: 'string',
                      description: 'Username for authentication',
                    },
                    password: {
                      type: 'string',
                      description: 'Password for authentication',
                    },
                    cookiesPreference: {
                      type: 'string',
                      enum: ['ACCEPT_ALL', 'DECLINE_ALL', 'IGNORE'],
                      description: 'Cookie preference for the analysis',
                    },
                    additionalInstructions: {
                      type: 'string',
                      description: 'Additional instructions for the analysis',
                    },
                    additionalVariables: {
                      type: 'string',
                      description: 'Additional variables for the analysis',
                    },
                  },
                },
                continueGeneration: {
                  type: 'boolean',
                  description: 'Whether to continue generation from previous state',
                },
              },
              required: ['projectUuid', 'suiteUuid'],
            },
          },
          {
            name: 'wopee_generate_user_stories',
            description: 'Generate user stories based on analysis results to understand user workflows',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'UUID of the project',
                },
                suiteUuid: {
                  type: 'string',
                  description: 'UUID of the test suite',
                },
                extraPrompt: {
                  type: 'string',
                  description: 'Additional prompt to modify the user story generation',
                },
                selectedUserStories: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Array of selected user story IDs',
                },
                suiteAnalysisConfig: {
                  type: 'object',
                  description: 'Configuration for the analysis suite',
                  properties: {
                    startingUrl: {
                      type: 'string',
                      description: 'Starting URL for the analysis',
                      format: 'uri',
                    },
                    username: {
                      type: 'string',
                      description: 'Username for authentication',
                    },
                    password: {
                      type: 'string',
                      description: 'Password for authentication',
                    },
                    cookiesPreference: {
                      type: 'string',
                      enum: ['ACCEPT_ALL', 'DECLINE_ALL', 'IGNORE'],
                      description: 'Cookie preference for the analysis',
                    },
                    additionalInstructions: {
                      type: 'string',
                      description: 'Additional instructions for the analysis',
                    },
                    additionalVariables: {
                      type: 'string',
                      description: 'Additional variables for the analysis',
                    },
                  },
                },
                continueGeneration: {
                  type: 'boolean',
                  description: 'Whether to continue generation from previous state',
                },
              },
              required: ['projectUuid', 'suiteUuid'],
            },
          },
          {
            name: 'wopee_generate_test_cases',
            description: 'Generate test cases based on analysis results and user stories',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'UUID of the project',
                },
                suiteUuid: {
                  type: 'string',
                  description: 'UUID of the test suite',
                },
                extraPrompt: {
                  type: 'string',
                  description: 'Additional prompt to modify the test case generation',
                },
                selectedUserStories: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Array of selected user story IDs',
                },
                suiteAnalysisConfig: {
                  type: 'object',
                  description: 'Configuration for the analysis suite',
                  properties: {
                    startingUrl: {
                      type: 'string',
                      description: 'Starting URL for the analysis',
                      format: 'uri',
                    },
                    username: {
                      type: 'string',
                      description: 'Username for authentication',
                    },
                    password: {
                      type: 'string',
                      description: 'Password for authentication',
                    },
                    cookiesPreference: {
                      type: 'string',
                      enum: ['ACCEPT_ALL', 'DECLINE_ALL', 'IGNORE'],
                      description: 'Cookie preference for the analysis',
                    },
                    additionalInstructions: {
                      type: 'string',
                      description: 'Additional instructions for the analysis',
                    },
                    additionalVariables: {
                      type: 'string',
                      description: 'Additional variables for the analysis',
                    },
                  },
                },
                continueGeneration: {
                  type: 'boolean',
                  description: 'Whether to continue generation from previous state',
                },
              },
              required: ['projectUuid', 'suiteUuid'],
            },
          },
          {
            name: 'wopee_get_app_context',
            description: 'Get existing app context for the given project and suite',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'UUID of the project',
                },
                suiteUuid: {
                  type: 'string',
                  description: 'UUID of the test suite',
                },
              },
              required: ['projectUuid', 'suiteUuid'],
            },
          },
          {
            name: 'wopee_get_user_stories',
            description: 'Get existing user stories for the given project and suite',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'UUID of the project',
                },
                suiteUuid: {
                  type: 'string',
                  description: 'UUID of the test suite',
                },
              },
              required: ['projectUuid', 'suiteUuid'],
            },
          },
          {
            name: 'wopee_get_test_cases',
            description: 'Get existing test cases for the given project and suite',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'UUID of the project',
                },
                suiteUuid: {
                  type: 'string',
                  description: 'UUID of the test suite',
                },
              },
              required: ['projectUuid', 'suiteUuid'],
            },
          },
          {
            name: 'wopee_fetch_analysis_suites',
            description: 'Fetch all analysis suites for a given project',
            inputSchema: {
              type: 'object',
              properties: {
                projectUuid: {
                  type: 'string',
                  description: 'UUID of the project',
                },
              },
              required: ['projectUuid'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'wopee_dispatch_analysis':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await wopee_dispatch_analysis(args as any), null, 2),
                },
              ],
            };

          case 'wopee_dispatch_agent':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await wopee_dispatch_agent(args as any), null, 2),
                },
              ],
            };

          case 'wopee_generate_app_context':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await wopee_generate_app_context(args as any), null, 2),
                },
              ],
            };

          case 'wopee_generate_general_user_stories':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await wopee_generate_general_user_stories(args as any), null, 2),
                },
              ],
            };

          case 'wopee_generate_user_stories':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await wopee_generate_user_stories(args as any), null, 2),
                },
              ],
            };

          case 'wopee_generate_test_cases':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await wopee_generate_test_cases(args as any), null, 2),
                },
              ],
            };

          case 'wopee_get_app_context':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await wopee_get_app_context(args as any), null, 2),
                },
              ],
            };

          case 'wopee_get_user_stories':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await wopee_get_user_stories(args as any), null, 2),
                },
              ],
            };

          case 'wopee_get_test_cases':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await wopee_get_test_cases(args as any), null, 2),
                },
              ],
            };

          case 'wopee_fetch_analysis_suites':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await wopee_fetch_analysis_suites(args as any), null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: `Tool execution failed: ${errorMessage}`,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Setup error handling for the server
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    // Validate configuration before starting
    try {
      const config = configManager.getInstance().getConfig();
      console.error(`[Wopee MCP] Starting server with API URL: ${config.apiUrl}`);
    } catch (error) {
      console.error('[Wopee MCP] Configuration error:', error);
      process.exit(1);
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[Wopee MCP] Server started successfully');
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Wopee MCP Server - Autonomous Testing Platform Integration

USAGE:
  wopee-mcp [options]

OPTIONS:
  -h, --help     Show this help message
  -v, --version  Show version information

ENVIRONMENT VARIABLES:
  WOPEE_API_KEY  Your Wopee API key (required)
  WOPEE_PROJECT_UUID  Your Wopee project UUID (required)
  WOPEE_API_URL  Wopee API endpoint (optional, defaults to https://api.wopee.io/)

AVAILABLE TOOLS:
  wopee_dispatch_analysis           Dispatch analysis for a project
  wopee_dispatch_agent             Dispatch agent to run tests
  wopee_generate_app_context       Generate application context from analysis
  wopee_generate_general_user_stories Generate general user stories from analysis
  wopee_generate_user_stories      Generate user stories from analysis
  wopee_generate_test_cases        Generate test cases from analysis and user stories
  wopee_get_app_context            Get existing app context for a project and suite
  wopee_get_user_stories           Get existing user stories for a project and suite
  wopee_get_test_cases             Get existing test cases for a project and suite
  wopee_fetch_analysis_suites      Fetch all analysis suites for a project

DOCUMENTATION:
  README.md       - Complete documentation
  INTEGRATION.md  - VS Code & Cursor integration guide
  QUICK_START.md  - Quick start guide

EXAMPLES:
  # Start the MCP server
  wopee-mcp

  # Show version
  wopee-mcp --version

  # Show help
  wopee-mcp --help

For more information, visit: https://github.com/wopee-io/wopee-mcp
`);
    process.exit(0);
  }

  // Check for version flag
  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log('1.0.0');
    process.exit(0);
  }

  const server = new WopeeMCPServer();
  server.start().catch((error) => {
    console.error('[Wopee MCP] Failed to start server:', error);
    process.exit(1);
  });
}
