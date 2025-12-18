# Wopee MCP Server

A Model Context Protocol (MCP) server for interacting with Wopee.io's autonomous testing platform. This server provides tools for managing analysis suites, generating test cases, user stories, and dispatching autonomous testing agents.

## Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- An IDE that supports MCP (Model Context Protocol), such as Cursor or VSCode

### MCP Server Configuration

Add this server to your MCP configuration.

### Configuration Example

```json
{
  "mcpServers": {
    "wopee": {
      "command": "npx wopee-mcp",
      "env": {
        "WOPEE_PROJECT_UUID": "your-project-uuid-here",
        "WOPEE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### Required Environment Variables

- **`WOPEE_PROJECT_UUID`** - Your Wopee project UUID. This identifies which project you're working with.
- **`WOPEE_API_KEY`** - Your Wopee API key. You can create one at [cmd.wopee.io](https://cmd.wopee.io), in your project's settings.

#### Optional Environment Variables

- **`WOPEE_API_URL`** - The Wopee API endpoint URL. Should be specified only for testing/development purposes.

## Getting Started

Most tools in this MCP server require a `suiteUuid` to operate. You have two options to get started:

### Option 1: Use Existing Suites

Start by fetching your existing analysis suites:

```
Use the wopee_fetch_analysis_suites tool to retrieve all available suites for your project.
```

This will return a list of all analysis suites with their UUIDs, which you can then use with other tools.

### Option 2: Create a New Suite

If you don't have any suites yet, create a fresh analysis suite:

```
Use the wopee_dispatch_analysis tool to create and dispatch a new analysis/crawling suite.
```

This will create a new suite and return its UUID, which you can use for subsequent operations.

## Available Tools

### Suite Management

#### `wopee_fetch_analysis_suites`

Fetches all analysis suites for your project. This is a good starting point to see what suites are available.

- **Returns:** Array of analysis suites with their UUIDs, names, statuses, and metadata

**Example Usage:**

```
Fetch all existing analysis suites for my project
```

#### `wopee_dispatch_analysis`

Creates and dispatches a new analysis/crawling suite for your project. Use this to start a fresh analysis session.

- **Returns:** Success message with the created suite information

**Example Usage:**

```
Dispatch a new analysis suite
```

### Generation Tools

These tools generate various artifacts for a specific suite. All require a `suiteUuid` and `fileType` to generate.

#### `wopee_generate_file`

Generates a specific file(artifact) for the selected suite.

- **Parameters:**
  - `suiteUuid` - The UUID of the suite
  - `fileType` - `"APP_CONTEXT" | "GENERAL_USER_STORIES" | "USER_STORIES_WITH_TEST_CASES" | "TEST_CASES" | "TEST_CASE_STEPS" | "REUSABLE_TEST_CASES" | "REUSABLE_TEST_CASE_STEPS"`
- **Returns:** Generated output in case of successful generation.

**Example Usage:**

```
Generate app context for my most recent analysis suite
```

### Fetch Tools

These tools retrieve generated artifacts for a specific suite. All require a `suiteUuid` and `fileType`.

#### `wopee_fetch_file`

Fetches the enquired file(artifact) from the selected suite.

- **Parameters:**
  - `suiteUuid` - The UUID of the suite
  - `fileType` - `"APP_CONTEXT" | "GENERAL_USER_STORIES" | "USER_STORIES" | "TEST_CASES"`
- **Returns:** The file contents in case of successful fetch.

**Example Usage:**

```
Fetch user stories for the latest suite
```

### Update Tools

These tools are used to update or set certain files(artifacts) for a specific suite. `suiteUuid`, `fileType` and `fileContent` is required.

#### `wopee_update_file`

Updates/replaces existing file(artifact) for a specific suite

- **Parameters:**
  - `suiteUuid` - The UUID of the suite
  - `fileType` - `"APP_CONTEXT" | "GENERAL_USER_STORIES" | "USER_STORIES" | "TEST_CASES"`
  - `fileContent` - Markdown content for `app context` and `general user stories`, structured JSON for `user stories` and `test cases`
- **Returns:** Boolean based of success status of the tool call

**Example Usage:**

```
Update app context file for the most recent suite with this content: <YourMarkdown>
```

### Agent Testing

#### `wopee_dispatch_agent`

Dispatches an autonomous testing agent to execute test cases for a selected suite.

- **Parameters:**
  - `suiteUuid` - The UUID of the suite containing the test cases
  - `analysisIdentifier` - The analysis identifier for the suite
  - `testCases` - Array of test case objects to execute, each containing:
    - `testCaseId` - The ID of the test case
    - `userStoryId` - The ID of the associated user story
- **Returns:** Success message indicating the agent has been dispatched

**Example Usage:**

```
Dispatch agent for my latest suite's user story US001 and test case TC003
```

## Typical Workflow

1. **Start with a suite:**

   - Use `wopee_fetch_analysis_suites` to see existing suites, OR
   - Use `wopee_dispatch_analysis` to create a new suite

2. **Generate artifacts:**

   - Generate app context: `wopee_generate_file` with `APP_CONTEXT` and specific `suiteUuid`
   - Generate general user stories: `wopee_generate_file` with `GENERAL_USER_STORIES` and specific `suiteUuid`
   - Generate user stories: `wopee_generate_file` with `USER_STORIES` and specific `suiteUuid`
   - Generate test cases: `wopee_generate_file` with `TEST_CASES` and specific `suiteUuid`

3. **Fetch generated content:**

   - Use the fetch tools to retrieve generated markdown/JSON files

4. **Run tests:**
   - Use `wopee_dispatch_agent` to execute test cases with the autonomous testing agent

## Notes

- Most tools require a `suiteUuid`. Always start by fetching or creating a suite.
- `wopee_dispatch_analysis` tool will go through whole cycle of processing - crawling the application and generating all of the files(artifacts) one by one.
- It is advisable to use [cmd.wopee.io](https://cmd.wopee.io) for a convenient visual representation of the generated data and results of the agent runs.
