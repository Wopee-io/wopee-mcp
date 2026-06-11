# Wopee MCP Server

AI-powered autonomous testing for your apps -- connect Claude, Cursor, or any MCP-compatible AI agent to [Wopee.io](https://wopee.io) and generate test cases, user stories, and run autonomous tests in seconds.

```bash
npx wopee-mcp
```

> **[Documentation](https://docs.wopee.io/guides/wopee-mcp/)** | **[Landing Page](https://wopee.io/mcp/)** | **[Dashboard](https://cmd.wopee.io)**

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

### Corporate Proxy Configuration

If you're behind a corporate proxy/VPN and experiencing connection timeouts, you can configure proxy settings using standard environment variables:

```json
{
  "mcpServers": {
    "wopee": {
      "command": "npx wopee-mcp",
      "env": {
        "WOPEE_PROJECT_UUID": "your-project-uuid-here",
        "WOPEE_API_KEY": "your-api-key-here",
        "HTTPS_PROXY": "http://your-proxy-server:8080"
      }
    }
  }
}
```

#### Supported Proxy Environment Variables

- **`HTTPS_PROXY`** or **`https_proxy`** - Proxy server URL for HTTPS connections (recommended)
- **`HTTP_PROXY`** or **`http_proxy`** - Fallback proxy server URL

#### Finding Your Proxy Settings

If you're unsure about your proxy settings, check your VS Code settings (`settings.json`) for `http.proxy` value, or consult your IT department. Common corporate proxy formats:

- `http://proxy.company.com:8080`
- `http://10.x.x.x:8080`
- `http://username:password@proxy.company.com:8080` (if authentication is required)

### TLS / Certificate Issues

**This is not required for MCP to work.** If you see HTTPS or certificate-related errors, that indicates a TLS or certificate trust issue in your environment.

If the server fails with errors such as **`UNABLE_TO_VERIFY_LEAF_SIGNATURE`** or **`certificate has expired`**, it may be due to:

- **Self-signed certificates** (e.g. when `WOPEE_API_URL` points to an internal or dev server)
- **Corporate proxy / SSL inspection** (traffic re-encrypted with a corporate CA your machine doesn’t trust)
- **Missing CA certificates** in Node’s trust store

#### Preferred solutions (secure)

1. **Use a valid TLS certificate** – e.g. Let’s Encrypt, or an internal CA – and ensure the **full certificate chain** is served.
2. **Install the corporate or internal CA** so Node trusts it:

   Example:

   ```bash
   export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/internal-ca.pem
   ```

   In MCP config `env`:

   ```json
   "env": {
     "WOPEE_PROJECT_UUID": "your-project-uuid-here",
     "WOPEE_API_KEY": "your-api-key-here",
     "NODE_EXTRA_CA_CERTS": "/path/to/ca.pem"
   }
   ```

#### Insecure workaround (not recommended)

For **local debugging only**, you may disable TLS verification in Node. This should **never** be used in production, as it disables HTTPS security and exposes traffic to interception.

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

Or in MCP config `env`:

```json
"env": {
  "WOPEE_PROJECT_UUID": "your-project-uuid-here",
  "WOPEE_API_KEY": "your-api-key-here",
  "NODE_TLS_REJECT_UNAUTHORIZED": "0"
}
```

Treat this as a **debug-only escape hatch**, not a normal setup step.

**Note:** Some users have reported setting `PYTHONHTTPSVERIFY=0` as well. This MCP server does not use Python; that variable has no effect on it. It would only apply if you run a Python-based MCP host or other tooling that also performs HTTPS in the same environment—outside the scope of this server.

## Getting Started

Most tools in this MCP server require a `suiteUuid` to operate. You have two options to get started:

### Option 1: Use Existing Suites

Start by fetching your existing analysis suites:

```
Use the wopee_fetch_analysis_suites tool to retrieve all available suites for your project.
```

This will return a list of all analysis suites with their UUIDs, which you can then use with other tools.

### Option 2: Create a New Suite

If you don't have any suites yet, you have two options:

**Automatic Analysis:** Create and dispatch a full analysis/crawling suite:

```
Use the wopee_dispatch_analysis tool to create and dispatch a new analysis/crawling suite.
```

**Blank Suite:** Create an empty suite for manual configuration:

```
Use the wopee_create_blank_suite tool to create a blank analysis suite.
```

Both options will return a suite UUID, which you can use for subsequent operations.

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

Creates and dispatches a new analysis/crawling suite for your project, or reruns an existing one. Use this to start a fresh analysis session or to re-trigger a previous analysis.

- **Parameters:**
  - `additionalInstructions` _(optional)_ - Additional instructions to guide the agent during the analysis/crawling phase (e.g. focus areas, things to ignore, login steps, etc.)
  - `additionalVariables` _(optional)_ - Additional environment variables to pass to the analysis. Array of objects, each with:
    - `key` - Variable name, must be uppercase with underscores only (e.g. `MY_VAR`, `BASE_URL`)
    - `value` - Variable value (non-empty string)
  - `rerun` _(optional)_ - If provided, reruns an existing analysis suite instead of creating a new one. Object with:
    - `suiteUuid` - UUID of the existing suite to rerun
    - `analysisIdentifier` - Analysis identifier of the existing suite
    - `mode` - Rerun mode: `FULL` (reruns the entire analysis including crawling and generation) or `CRAWLING` (reruns only the crawling phase)
- **Returns:** Success message with the created/rerun suite information

**Example Usage:**

```
Dispatch a new analysis suite
```

```
Dispatch a new analysis suite and focus on the checkout flow
```

```
Dispatch a new analysis suite with additional variables CARD_FILAMENT=123321123 and AUTH_TOKEN=abc123
```

```
Rerun the full analysis for suite <suiteUuid> with analysis identifier <analysisIdentifier>
```

```
Rerun only the crawling phase for suite <suiteUuid> with analysis identifier <analysisIdentifier>
```

#### `wopee_create_blank_suite`

Creates a blank analysis suite for your project. Use this when you want to manually configure and populate a suite rather than having it automatically analyzed.

- **Returns:** The created suite information including its UUID

**Example Usage:**

```
Create a blank analysis suite for my project
```

### Generation Tools

These tools generate various artifacts for a specific suite. All require a `suiteUuid` and `type` to generate.

#### `wopee_generate_artifact`

Generates a specific file(artifact) for the selected suite.

- **Parameters:**
  - `suiteUuid` - The UUID of the suite
  - `type` - `"APP_CONTEXT" | "GENERAL_USER_STORIES" | "USER_STORIES_WITH_TEST_CASES" | "TEST_CASES" | "TEST_CASE_STEPS" | "REUSABLE_TEST_CASES" | "REUSABLE_TEST_CASE_STEPS"`
- **Returns:** Generated output in case of successful generation.

**Example Usage:**

```
Generate app context for my most recent analysis suite
```

### Fetch Tools

These tools retrieve generated artifacts for a specific suite. All require a `suiteUuid` and `type`.

#### `wopee_fetch_artifact`

Fetches the enquired file(artifact) from the selected suite.

- **Parameters:**
  - `suiteUuid` - The UUID of the suite
  - `type` - `"APP_CONTEXT" | "GENERAL_USER_STORIES" | "USER_STORIES" | "PLAYWRIGHT_CODE" | "PROJECT_CONTEXT"`
  - `identifier` - Identifier of the test case to fetch Playwright code for, ex. `US003:TC004`
- **Returns:** The file contents in case of successful fetch.

**Example Usage:**

```
Fetch user stories for the latest suite
```

### Update Tools

These tools are used to update or set certain files(artifacts) for a specific suite. `suiteUuid`, `type` and `content` is required.

#### `wopee_update_artifact`

Updates/replaces existing file(artifact) for a specific suite

- **Parameters:**
  - `suiteUuid` - The UUID of the suite
  - `type` - `"APP_CONTEXT" | "GENERAL_USER_STORIES" | "USER_STORIES" | "PLAYWRIGHT_CODE" | "PROJECT_CONTEXT"`
  - `content` - Markdown content for `app context`, `general user stories` and `project context`, structured JSON for `user stories`
  - `identifier` - Identifier of the test case to fetch Playwright code for, ex. `US003:TC004`
- **Returns:** Boolean based of success status of the tool call

**Example Usage:**

```
Update app context file for the most recent suite with this content: <YourMarkdown>
```

### Agent Testing

#### `wopee_dispatch_agent`

Dispatches an autonomous testing agent to execute test cases for a selected suite. Tests run **asynchronously** (typically 1-3 minutes). This tool confirms dispatch and returns tracking info — not final results.

- **Parameters:**
  - `suiteUuid` - The UUID of the suite containing the test cases
  - `analysisIdentifier` - The analysis identifier for the suite
  - `testCases` - Array of test case objects to execute, each containing:
    - `testCaseId` - The ID of the test case
    - `userStoryId` - The ID of the associated user story
- **Returns:** Dispatch confirmation with tracking info (suite UUID, analysis identifier, per-test-case execution status). Does NOT return pass/fail results — use `wopee_fetch_recent_executions` or `wopee_fetch_executed_test_cases` to check results later.

**Example Usage:**

```
Dispatch agent for my latest suite's user story US001 and test case TC003
```

### Test Results

#### `wopee_fetch_recent_executions`

Fetches the most recent test case executions for the current project (up to 20, newest first). Use this to quickly check the status of recently dispatched tests without needing to remember specific suite UUIDs.

- **Parameters:** None (uses `WOPEE_PROJECT_UUID` from environment)
- **Returns:** List of recent executions with execution status (IN_PROGRESS, IN_QUEUE, FINISHED, FAILED), agent reports, and pass/fail results

**Example Usage:**

```
What's the status of my recent test runs?
```

```
How did my tests go?
```

#### `wopee_fetch_executed_test_cases`

Fetches executed test cases and their results for a given analysis suite. Use this to check the status and reports of dispatched agent runs.

- **Parameters:**
  - `suiteUuid` - The UUID of the analysis suite to fetch results for
  - `analysisIdentifier` _(optional)_ - Analysis identifier to narrow results (e.g. `A068`)
- **Returns:** Array of results grouped by user story, each containing executed test cases with execution status, agent report, agent report status, code report, and code report status

**Example Usage:**

```
Fetch test results for suite <suiteUuid>
```

```
Show me the executed test cases for my latest analysis suite
```

## Typical Workflow

1. **Start with a suite:**
   - Use `wopee_fetch_analysis_suites` to see existing suites, OR
   - Use `wopee_dispatch_analysis` to create a new suite

2. **Generate artifacts:**
   - Generate app context: `wopee_generate_artifact` with `APP_CONTEXT` and specific `suiteUuid`
   - Generate general user stories: `wopee_generate_artifact` with `GENERAL_USER_STORIES` and specific `suiteUuid`
   - Generate user stories with test cases: `wopee_generate_artifact` with `USER_STORIES_WITH_TEST_CASES` and specific `suiteUuid`
   - Generate reusable test cases: `wopee_generate_artifact` with `REUSABLE_TEST_CASES` and specific `suiteUuid`
   - Generate reusable test case steps: `wopee_generate_artifact` with `REUSABLE_TEST_CASE_STEPS` and specific `suiteUuid`
   - Generate test case steps: `wopee_generate_artifact` with `TEST_CASE_STEPS` and specific `suiteUuid`

3. **Fetch generated content:**
   - Use the fetch tools to retrieve generated markdown/JSON files

4. **Run tests:**
   - Use `wopee_dispatch_agent` to execute test cases with the autonomous testing agent

5. **Check results:**
   - Use `wopee_fetch_recent_executions` to quickly check status of recent test runs
   - Use `wopee_fetch_executed_test_cases` to check detailed status and reports for a specific suite
   - Or use the `fetch-test-results` prompt for a formatted summary of all test results

## Available Prompts

### `fetch-project-summary`

Fetches analysis suites and their user stories/test cases, then displays a formatted summary with two markdown tables: a suite overview and a detailed test case breakdown.

### `fetch-test-results`

Fetches analysis suites and their executed test case results, then displays formatted markdown tables showing execution status, agent report status, and code report status for each test case. Also surfaces failed report details.

## Notes

- Most tools require a `suiteUuid`. Always start by fetching or creating a suite.
- `wopee_dispatch_analysis` tool will go through whole cycle of processing - crawling the application and generating all of the files(artifacts) one by one.
- It is advisable to use [cmd.wopee.io](https://cmd.wopee.io) for a convenient visual representation of the generated data and results of the agent runs.
