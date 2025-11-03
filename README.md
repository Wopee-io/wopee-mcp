# Wopee MCP Server

A Model Context Protocol (MCP) server for integrating with the Wopee testing platform. This server provides tools for dispatching analysis, generating app context, user stories, test cases, and running test executions through GraphQL API calls.

## Features

- **Dispatch Analysis**: Start analysis of web applications to understand their structure and behavior
- **Dispatch Agent**: Execute tests for specific projects and suites
- **Generate App Context**: Create detailed application context based on analysis results
- **Generate General User Stories**: Generate high-level user stories from analysis data
- **Generate User Stories**: Generate detailed user stories and acceptance criteria from analysis data
- **Generate Test Cases**: Generate comprehensive test cases from analysis and user stories
- **Get App Context**: Retrieve existing app context for a project and suite
- **Get User Stories**: Retrieve existing user stories for a project and suite
- **Get Test Cases**: Retrieve existing test cases for a project and suite
- **Fetch Analysis Suites**: Fetch all analysis suites for a project

## Installation

See [INTEGRATION.md](INTEGRATION.md) for detailed installation instructions for VS Code and Cursor.

### Quick Install

**One-Click Installation (Recommended):**
1. Open VS Code or Cursor
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "MCP: Install Server" and select it
4. Enter: `wopee-mcp`
5. Configure your API key when prompted

**Manual Installation:**
```bash
npm install -g wopee-mcp
```

### Development Installation

For contributing or local development:

```bash
git clone <repository-url>
cd wopee-mcp
npm install
cp env.example .env
# Edit .env with your credentials
```

## VS Code & Cursor Integration

### Prerequisites

Before using the Wopee MCP server, ensure you have:

1. **VS Code** with the MCP extension installed, or **Cursor** (which has built-in MCP support)
2. A **Wopee API key** from [wopee.io](https://wopee.io)
3. **Node.js 18+** installed on your system

For detailed integration instructions, see [INTEGRATION.md](INTEGRATION.md).

**Quick Setup:**
- VS Code: Install MCP extension, then use one-click installation
- Cursor: Built-in MCP support, use one-click installation
- Both: The server automatically loads `.env` files from your project root

### Using the Tools

Once configured, you can use the Wopee tools in your chat interface:

#### Dispatch Analysis
```
@wopee wopee_dispatch_analysis
Project UUID: project-123
Iterations: 5
Suite Analysis Config:
  - Starting URL: https://example.com
  - Username: testuser
  - Password: testpass
  - Cookies Preference: ACCEPT_ALL
```

#### Dispatch Agent
```
@wopee wopee_dispatch_agent
Project UUID: project-123
Suite UUID: suite-123
Analysis Identifier: analysis-123
Test Cases: [{"testCaseId": "test-1", "userStoryId": "story-1"}]
```

#### Generate App Context
```
@wopee wopee_generate_app_context
Project UUID: project-123
Suite UUID: suite-123
Extra Prompt: Focus on user authentication flows
```

#### Generate General User Stories
```
@wopee wopee_generate_general_user_stories
Project UUID: project-123
Suite UUID: suite-123
Extra Prompt: Include high-level business requirements
```

#### Generate User Stories
```
@wopee wopee_generate_user_stories
Project UUID: project-123
Suite UUID: suite-123
Extra Prompt: Include edge cases and error scenarios
```

#### Generate Test Cases
```
@wopee wopee_generate_test_cases
Project UUID: project-123
Suite UUID: suite-123
Extra Prompt: Generate comprehensive test coverage
Selected User Stories: ["story-1", "story-2"]
```

#### Get App Context
```
@wopee wopee_get_app_context
Project UUID: project-123
Suite UUID: suite-123
```

#### Get User Stories
```
@wopee wopee_get_user_stories
Project UUID: project-123
Suite UUID: suite-123
```

#### Get Test Cases
```
@wopee wopee_get_test_cases
Project UUID: project-123
Suite UUID: suite-123
```

#### Fetch Analysis Suites
```
@wopee wopee_fetch_analysis_suites
Project UUID: project-123
```

Returns an array of analysis suites with detailed information including suite UUID, name, type, status, analysis identifier, and generation states.

### Troubleshooting

#### Common Issues

1. **"Command not found" error**:
   - Ensure the package is installed globally: `npm install -g wopee-mcp`
   - Check that Node.js is in your PATH

2. **"API key not configured" error**:
   - Verify your API key is set in the environment variables
   - Check the MCP server configuration in VS Code/Cursor settings

3. **"Connection failed" error**:
   - Verify your internet connection
   - Check if the Wopee API URL is correct
   - Ensure your API key is valid

4. **Tools not appearing**:
   - Restart VS Code/Cursor after configuration
   - Check the MCP server logs for errors
   - Verify the server is running: `wopee-mcp --version`

#### Getting Help

- **Check logs**: Look in the MCP server output panel
- **Verify installation**: Run `wopee-mcp --help` in terminal
- **Test connection**: Use the `wopee_dispatch_analysis` tool with a simple project UUID

## Configuration

The server loads configuration from a `.env` file in the project root directory (where `package.json` is located).

### Environment Variables

- `WOPEE_API_KEY` (required): Your Wopee API key for authentication
- `WOPEE_PROJECT_UUID` (optional): Your Wopee project UUID - can be set in `.env` for convenience, but tools also accept `projectUuid` as a parameter
- `WOPEE_API_URL` (optional): Wopee API endpoint (defaults to `https://api.wopee.io/`)

**Note:** All tools accept `projectUuid` as a parameter. Setting `WOPEE_PROJECT_UUID` in `.env` is optional and provides a default value, but you can override it by passing `projectUuid` in each tool call.

### Setting up .env file

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit the .env file in the project root:**
   ```bash
   # Wopee API Configuration
   WOPEE_API_KEY=your_actual_api_key_here
   WOPEE_PROJECT_UUID=your_project_uuid_here
   WOPEE_API_URL=https://api.dev.wopee.io/
   ```

3. **For MCP integration, update your `mcp.json`:**
   ```json
   {
     "mcpServers": {
       "wopee": {
         "command": "npx",
         "args": [
           "wopee-mcp@latest"
         ],
         "env": {}
       }
     }
   }
   ```

   **Note:** The server automatically loads API keys from the `.env` file in the project root. No need to hardcode them in the MCP configuration.

## Usage

### Development

Run the server in development mode:
```bash
npm run dev
```

### Production

Build and run the server:
```bash
npm run build
npm start
```

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Package Management

#### Building the Package

Clean build (removes dist and rebuilds):
```bash
npm run build:clean
```

Validate the package:
```bash
npm run validate
```

#### Publishing to npm

**Prerequisites:**
1. Create an npm account at [npmjs.com](https://www.npmjs.com)
2. Login to npm: `npm login`
3. Ensure you have publish permissions for the package

**Publishing Workflow:**

1. **Prepare for release:**
   ```bash
   ./scripts/prepare-release.sh
   ```

2. **Publish the package:**
   ```bash
   ./scripts/publish.sh
   ```

3. **Or use npm scripts directly:**
   ```bash
   # Dry run (test without publishing)
   npm run publish:dry-run
   
   # Publish patch version (1.0.0 -> 1.0.1)
   npm run publish:patch
   
   # Publish minor version (1.0.0 -> 1.1.0)
   npm run publish:minor
   
   # Publish major version (1.0.0 -> 2.0.0)
   npm run publish:major
   ```

**Manual Publishing:**
```bash
# 1. Update version
npm version patch  # or minor, major

# 2. Publish
npm publish
```

## Available Tools Reference

For detailed usage examples, see the [Usage Examples](#using-the-tools) section above and [EXAMPLES.md](EXAMPLES.md).

All tools require a `projectUuid` parameter. You can either:
- Pass `projectUuid` as a parameter to each tool call, or
- Set `WOPEE_PROJECT_UUID` in your `.env` file (tools will use it if not provided as a parameter)

### Tool List

1. **wopee_dispatch_analysis** - Start a new analysis for a project
2. **wopee_dispatch_agent** - Execute tests for a project and suite
3. **wopee_generate_app_context** - Generate application context from analysis
4. **wopee_generate_general_user_stories** - Generate high-level user stories
5. **wopee_generate_user_stories** - Generate detailed user stories
6. **wopee_generate_test_cases** - Generate test cases from user stories
7. **wopee_get_app_context** - Retrieve existing app context
8. **wopee_get_user_stories** - Retrieve existing user stories
9. **wopee_get_test_cases** - Retrieve existing test cases
10. **wopee_fetch_analysis_suites** - Fetch all analysis suites for a project

See [INTEGRATION.md](INTEGRATION.md) for detailed tool usage examples and workflows.

## Response Format

All tools return responses in the following format:

```json
{
  "success": true,
  "data": { /* tool-specific data */ },
  "message": "Success message",
  "error": "Error message (only present if success is false)"
}
```

## Error Handling

The server provides detailed error messages for:
- Invalid parameters
- GraphQL API errors
- Network connectivity issues
- Configuration problems

## Development

### Project Structure

```
src/
├── config.ts              # Configuration management
├── graphql/
│   └── client.ts          # GraphQL client implementation
├── tools/                 # Individual tool implementations
│   ├── wopee_dispatch_analysis.ts
│   ├── wopee_dispatch_agent.ts
│   ├── wopee_generate_app_context.ts
│   ├── wopee_generate_general_user_stories.ts
│   ├── wopee_generate_user_stories.ts
│   ├── wopee_generate_test_cases.ts
│   ├── wopee_get_app_context.ts
│   ├── wopee_get_user_stories.ts
│   ├── wopee_get_test_cases.ts
│   └── wopee_fetch_analysis_suites.ts
├── types/
│   └── index.ts           # TypeScript type definitions
└── index.ts               # Main MCP server implementation

tests/
├── config.test.ts         # Configuration tests
└── tools/                 # Tool-specific tests
    ├── wopee_dispatch_analysis.test.ts
    ├── wopee_dispatch_agent.test.ts
    ├── wopee_generate_app_context.test.ts
    └── [other tool tests]
```

### Adding New Tools

1. Create a new tool file in `src/tools/`
2. Define the tool's parameters using Zod schemas in `src/types/index.ts`
3. Implement the tool function with proper error handling
4. Add the tool to the MCP server in `src/index.ts`
5. Write tests for the new tool

### Code Quality

The project includes:
- TypeScript for type safety
- ESLint for code linting
- Jest for testing
- Comprehensive error handling
- JSDoc documentation

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## GitHub Automation

This repository includes comprehensive GitHub Actions workflows for:

- **CI/CD Pipeline** - Automated testing and validation
- **npm Publishing** - Automated package publishing
- **Release Management** - Version management and releases
- **Security Scanning** - Vulnerability and security checks
- **Performance Testing** - Performance monitoring
- **Dependency Updates** - Automated dependency management

See [AUTOMATION.md](AUTOMATION.md) for detailed information about the automation setup.

### Quick Publishing

To publish a new version:

1. **Automatic (recommended):**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Manual via GitHub Actions:**
   - Go to Actions → Release Management
   - Click "Run workflow"
   - Select version bump type
   - Run workflow

## Support

For issues and questions, please create an issue in the repository.