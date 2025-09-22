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

### Option 1: One-Click Installation (Recommended)

**For VS Code:**
1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "MCP: Install Server" and select it
4. Enter: `wopee-mcp`
5. Configure your API key when prompted

**For Cursor:**
1. Open Cursor
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "MCP: Install Server" and select it
4. Enter: `wopee-mcp`
5. Configure your API key when prompted

### Option 2: Manual Installation

1. Install the package globally:
```bash
npm install -g wopee-mcp
```

2. Set up environment variables using a `.env` file:
```bash
# Create a .env file in the project root
cp env.example .env

# Edit the .env file with your API key
# WOPEE_API_KEY=your_api_key_here
# WOPEE_API_URL=https://api.wopee.io/
```

**Alternative: Set system environment variables:**
```bash
export WOPEE_API_KEY=your_api_key_here
export WOPEE_API_URL=https://api.wopee.io/
```

### Option 3: Development Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wopee-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Edit `.env` file with your Wopee API credentials:
```env
WOPEE_API_KEY=your_api_key_here
WOPEE_API_URL=https://api.wopee.io/
```

## VS Code & Cursor Integration

### Prerequisites

Before using the Wopee MCP server, ensure you have:

1. **VS Code** with the MCP extension installed, or **Cursor** (which has built-in MCP support)
2. A **Wopee API key** from [wopee.io](https://wopee.io)
3. **Node.js 18+** installed on your system

### VS Code Setup

#### Method 1: One-Click Installation (Easiest)

1. **Open VS Code** and ensure you have the MCP extension installed
2. **Open Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. **Type**: `MCP: Install Server`
4. **Enter package name**: `wopee-mcp`
5. **Configure API key** when prompted

#### Method 2: Manual Configuration

1. **Install the package globally**:
   ```bash
   npm install -g wopee-mcp
   ```

2. **Open VS Code settings** (`Ctrl+,` or `Cmd+,`)

3. **Search for "MCP"** and find the MCP settings

4. **Add server configuration**:
   ```json
   {
     "mcp.servers": {
       "wopee": {
         "command": "wopee-mcp",
         "args": [],
         "env": {
           "WOPEE_API_KEY": "your_api_key_here",
           "WOPEE_API_URL": "https://api.wopee.io/"
         }
       }
     }
   }
   ```

5. **Restart VS Code** to load the new MCP server

### Cursor Setup

#### Method 1: One-Click Installation (Easiest)

1. **Open Cursor** (MCP support is built-in)
2. **Open Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. **Type**: `MCP: Install Server`
4. **Enter package name**: `wopee-mcp`
5. **Configure API key** when prompted

#### Method 2: Manual Configuration

1. **Install the package globally**:
   ```bash
   npm install -g wopee-mcp
   ```

2. **Open Cursor settings** (`Ctrl+,` or `Cmd+,`)

3. **Navigate to MCP settings** in the sidebar

4. **Add server configuration**:
   ```json
   {
     "mcp.servers": {
       "wopee": {
         "command": "wopee-mcp",
         "args": [],
         "env": {
           "WOPEE_API_KEY": "your_api_key_here",
           "WOPEE_API_URL": "https://api.wopee.io/"
         }
       }
     }
   }
   ```

5. **Restart Cursor** to load the new MCP server

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

### 7. wopee_get_app_context

Get existing app context for a project and suite.

**Parameters:**
- `projectUuid` (string, required): UUID of the project
- `suiteUuid` (string, required): UUID of the test suite

**Example:**
```json
{
  "projectUuid": "project-123",
  "suiteUuid": "suite-123"
}
```

### 8. wopee_get_user_stories

Get existing user stories for a project and suite.

**Parameters:**
- `projectUuid` (string, required): UUID of the project
- `suiteUuid` (string, required): UUID of the test suite

**Example:**
```json
{
  "projectUuid": "project-123",
  "suiteUuid": "suite-123"
}
```

### 9. wopee_get_test_cases

Get existing test cases for a project and suite.

**Parameters:**
- `projectUuid` (string, required): UUID of the project
- `suiteUuid` (string, required): UUID of the test suite

**Example:**
```json
{
  "projectUuid": "project-123",
  "suiteUuid": "suite-123"
}
```

### 10. wopee_fetch_analysis_suites

Fetch all analysis suites for a given project.

**Parameters:**
- `projectUuid` (string, required): UUID of the project

**Example:**
```json
{
  "projectUuid": "project-123"
}
```

**Response:**
Returns an array of analysis suites with detailed information including:
- Suite UUID, name, and type
- Upload and execution status
- Analysis identifier
- Suite running status
- Generation state for app context, user stories, and test cases
- Creation and update timestamps

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
- **Test connection**: Use the `wopee_start_analysis` tool with a simple URL

## Configuration

The server loads configuration from a `.env` file in the project root directory (where `package.json` is located).

### Environment Variables

- `WOPEE_API_KEY` (required): Your Wopee API key
- `WOPEE_PROJECT_UUID` (required): Your Wopee project UUID
- `WOPEE_API_URL` (optional): Wopee API endpoint (defaults to `https://api.wopee.io/`)

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
         "command": "node",
         "args": ["/path/to/wopee-mcp/dist/index.js"],
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

## Available Tools

### 1. wopee_start_analysis

Start a new analysis for a given URL.

**Parameters:**
- `url` (string, required): URL of the application to analyze

**Example:**
```json
{
  "url": "https://example.com"
}
```

### 2. wopee_generate_app_context

Generate application context based on analysis results.

**Parameters:**
- `analysisId` (string, required): ID of the analysis to generate context from
- `prompt` (string, optional): Optional prompt to modify the app context generation

**Example:**
```json
{
  "analysisId": "analysis-123",
  "prompt": "Focus on user authentication flows"
}
```

### 3. wopee_generate_user_stories

Generate user stories based on analysis results.

**Parameters:**
- `analysisId` (string, required): ID of the analysis to generate user stories from
- `prompt` (string, optional): Optional prompt to modify the user story generation

**Example:**
```json
{
  "analysisId": "analysis-123",
  "prompt": "Include edge cases and error scenarios"
}
```

### 4. wopee_generate_tests

Generate test files by fetching generated scenarios from the Wopee platform.

**Parameters:**
- `projectUuid` (string, required): UUID of the project
- `suiteUuid` (string, required): UUID of the test suite
- `bucket` (string, required): Bucket name containing the generated scenarios

**Example:**
```json
{
  "projectUuid": "e70d893f-b70a-4e45-a93a-7c08ef289aa9",
  "suiteUuid": "f0cd35a5-0e11-4d33-995b-433706e10542",
  "bucket": "project-suite-generated-scenarios"
}
```

### 5. wopee_run_tests

Run tests either by analysis ID or specific test IDs.

**Parameters:**
- `analysisId` (string, optional): ID of the analysis to run tests for
- `testIds` (array of strings, optional): Array of specific test IDs to run

**Note:** Either `analysisId` or `testIds` must be provided.

**Example with analysis ID:**
```json
{
  "analysisId": "analysis-123"
}
```

**Example with test IDs:**
```json
{
  "testIds": ["test-1", "test-2", "test-3"]
}
```

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
│   ├── wopee_start_analysis.ts
│   ├── wopee_generate_app_context.ts
│   ├── wopee_generate_user_stories.ts
│   ├── wopee_generate_tests.ts
│   └── wopee_run_tests.ts
├── types/
│   └── index.ts           # TypeScript type definitions
└── index.ts               # Main MCP server implementation

tests/
├── config.test.ts         # Configuration tests
└── tools/                 # Tool-specific tests
    ├── wopee_start_analysis.test.ts
    ├── wopee_generate_tests.test.ts
    └── wopee_run_tests.test.ts
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