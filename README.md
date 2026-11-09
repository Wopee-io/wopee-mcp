<img alt="Wopee.io MCP" src="assets/brand/wopee-mcp-readme-on-yellow.svg" width="300">

# Wopee.io MCP Server

AI-powered autonomous testing for your apps -- connect Claude, Cursor, or any MCP-compatible AI agent to [Wopee.io](https://wopee.io) and generate test cases, user stories, and run autonomous tests in seconds.

> **[Documentation](https://docs.wopee.io/guides/wopee-mcp/)** | **[Landing Page](https://wopee.io/mcp/)** | **[Dashboard](https://cmd.wopee.io)**

## Requirements

- **Node.js 20.18 or newer** (Node.js 22 recommended). The server runs with `npx`; there is nothing else to install.
- A **Wopee.io project** with an **API key**. In [Commander](https://cmd.wopee.io), open the project and go to **More** › **Settings** › **API Keys**; the same screen shows the project UUID. See [API keys](https://docs.wopee.io/guides/api-keys/).

## Setup

Per-client guides (Claude Code, Cursor, VS Code, Codex and more): [docs.wopee.io/guides/wopee-mcp](https://docs.wopee.io/guides/wopee-mcp/).

### Claude Code

```bash
export WOPEE_API_KEY="your-api-key"
export WOPEE_PROJECT_UUID="your-project-uuid"
claude mcp add --scope project wopee -e 'WOPEE_API_KEY=${WOPEE_API_KEY}' -e 'WOPEE_PROJECT_UUID=${WOPEE_PROJECT_UUID}' -- npx -y wopee-mcp
```

This writes `.mcp.json` with `${VAR}` references, so the key never lands in the file. On native Windows (not WSL), Claude Code needs `cmd /c` in front of `npx`: `... -- cmd /c npx -y wopee-mcp`.

### Any MCP client

```json
{
  "mcpServers": {
    "wopee": {
      "command": "npx",
      "args": ["-y", "wopee-mcp"],
      "env": {
        "WOPEE_API_KEY": "your-api-key",
        "WOPEE_PROJECT_UUID": "your-project-uuid"
      }
    }
  }
}
```

- Keep `command` and `args` as separate fields. Clients start the server without a shell, so `"command": "npx wopee-mcp"` in one string does not work everywhere.
- Replace the values with references to environment variables in your client's syntax (for example `${WOPEE_API_KEY}` in Claude Code, `${env:WOPEE_API_KEY}` in Cursor). Never commit a real key.
- VS Code uses `servers` instead of `mcpServers`, and OpenCode uses `mcp`.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `WOPEE_API_KEY` | yes | Project API key from **More** › **Settings** › **API Keys** |
| `WOPEE_PROJECT_UUID` | yes | The project the server works with. Every tool uses it |
| `WOPEE_API_URL` | no | Only for a dedicated or self-hosted Wopee.io instance; copy it from the **API Keys** screen. Defaults to `https://api.wopee.io`; omit it otherwise |
| `HTTPS_PROXY`, `HTTP_PROXY` | no | Corporate proxy, see below |
| `NODE_EXTRA_CA_CERTS` | no | PEM file with your company's root certificate, see below |

### Verify the connection

Your client should list the `wopee` server with **16 tools** starting with `wopee_` (`/mcp` in Claude Code). Then ask:

```
How many tests do I have in Wopee.io, and which ones have never run?
```

The agent calls the read-only `wopee_fetch_test_inventory`. A new project returns zero tests; continue with an analysis (`wopee_dispatch_analysis`).

## Tools

All 16 tools work in the project set by `WOPEE_PROJECT_UUID`. **Write** tools change data in your project; let your agent ask before it calls them.

| Tool | What it does | Access | Timing |
| --- | --- | --- | --- |
| `wopee_fetch_test_inventory` | Counts tests per analysis with the latest status of each, including never-run ones (`NOT_RUN`) | read | seconds |
| `wopee_fetch_analysis_suites` | Lists analysis suites with their UUIDs, identifiers (`A001`) and status | read | seconds |
| `wopee_create_blank_suite` | Creates an empty analysis suite for tests you write or generate yourself | write | seconds |
| `wopee_dispatch_analysis` | Creates a suite and starts the crawl that explores the app and generates tests. Optional instructions, variables, rerun of an existing analysis | write | **async**, minutes |
| `wopee_dispatch_agent` | Starts the testing agent on chosen test cases of an analysis. Returns run handles, not results | write | **async**, minutes |
| `wopee_fetch_recent_executions` | The 20 newest runs in the project with verdict or status and a short report | read | seconds |
| `wopee_fetch_executed_test_cases` | Full results of the runs of one analysis, with the agent's report | read | seconds |
| `wopee_fetch_artifact` | Reads `APP_CONTEXT`, `GENERAL_USER_STORIES`, `USER_STORIES`, `PLAYWRIGHT_CODE` or `PROJECT_CONTEXT` | read | seconds |
| `wopee_update_artifact` | Replaces one of those artifacts with content from the agent (whole file, not a patch) | write | seconds |
| `wopee_generate_artifact` | Generates app context, user stories, test cases or steps with Wopee.io's AI | write | up to 5 min; `async: true` for large `TEST_CASES` |
| `wopee_setup_check` | Checks the connection: project, app URL, plan, steps left and Commander link; names a wrong key or missing UUID | read | seconds |
| `wopee_fetch_variables` | Reads run-time variables at project or analysis level | read | seconds |
| `wopee_update_variables` | Adds or overwrites run-time variables (merge, no delete) | write | seconds |
| `wopee_create_github_issue` | Files a GitHub issue in the project's connected repository, with run evidence when given a run UUID | write | seconds |
| `wopee_send_chat_message` | Posts to the project chat. For the in-app chat only; not available with a project API key | write | seconds |
| `wopee_read_chat_history` | Reads the project chat. For the in-app chat only; not available with a project API key | read | seconds |

`wopee_generate_artifact` types: `APP_CONTEXT`, `GENERAL_USER_STORIES`, `USER_STORIES_WITH_TEST_CASES`, `TEST_CASES`, `TEST_CASE_STEPS`, `REUSABLE_TEST_CASES`, `REUSABLE_TEST_CASE_STEPS`. Generate in that order. `USER_STORIES_WITH_TEST_CASES` rebuilds every user story and test case of the suite, and `TEST_CASES` with `mode: CREATE` replaces test cases with their run history; use them on an existing suite only when you mean it.

Parameters and examples for each tool: [Tools reference](https://docs.wopee.io/guides/wopee-mcp/#tools-reference).

## Prompts

Three MCP prompts. In Claude Code they appear as slash commands, for example `/mcp__wopee__run-test`.

| Prompt | What the agent does |
| --- | --- |
| `fetch-project-summary` | Lists your suites, user stories and test cases as two tables |
| `fetch-test-results` | Lists the latest results per suite, with a section for failed reports |
| `run-test` | Finds the test case that matches your request, asks "Run this test? (yes/no)", starts it and fetches the result. If nothing matches, offers a full analysis or a quick single test |

## Typical workflow

1. **See what you have:** `wopee_fetch_test_inventory` (read-only), then `wopee_fetch_analysis_suites` for suite UUIDs and analysis identifiers.
2. **No tests yet?** `wopee_dispatch_analysis` crawls the app from the project's starting URL and generates user stories and test cases. Poll `wopee_fetch_analysis_suites` until it finishes (several minutes). Or create a blank suite with `wopee_create_blank_suite` and fill it with `wopee_update_artifact` / `wopee_generate_artifact`.
3. **Run tests:** `wopee_dispatch_agent` with the analysis suite UUID, analysis identifier and test cases. It returns at once with run handles, not the verdict.
4. **Read the verdict:** poll `wopee_fetch_recent_executions` or `wopee_fetch_executed_test_cases` every 30-60 s until the run is finished, then read the agent report.
5. **Report failures:** `wopee_create_github_issue` with the failed run's `executedTestCaseUuid` files it with the failing step, screenshot and a link to the run.

Good to know:

- **Your app must be reachable from Wopee.io.** Tests run in the cloud, so `localhost` does not work; use a public or staging URL.
- **Usage counts.** Runs started through MCP count toward the plan of the user who created the API key. When the limit is reached, calls return `[USAGE_LIMIT_EXCEEDED]` with the time the limit resets.
- **10 seconds between dispatches** per project; the server retries automatically after a rate-limit answer.
- [Commander](https://cmd.wopee.io) shows the generated tests and every run visually.

## Corporate proxy

Behind a corporate proxy or VPN, set the standard proxy variables in the server's `env`:

```json
"env": {
  "WOPEE_API_KEY": "your-api-key",
  "WOPEE_PROJECT_UUID": "your-project-uuid",
  "HTTPS_PROXY": "http://your-proxy-server:8080"
}
```

`HTTPS_PROXY` (or `https_proxy`) is checked first, then `HTTP_PROXY` (or `http_proxy`). Your VS Code `http.proxy` setting or your IT department has the value, for example `http://proxy.company.com:8080` or `http://username:password@proxy.company.com:8080`.

## TLS and certificates

Errors such as `UNABLE_TO_VERIFY_LEAF_SIGNATURE` or `self-signed certificate in certificate chain` mean Node does not trust a certificate on the way: usually a corporate proxy that inspects TLS, or a self-hosted instance with an internal CA. Point Node at your company's root certificate:

```json
"env": {
  "WOPEE_API_KEY": "your-api-key",
  "WOPEE_PROJECT_UUID": "your-project-uuid",
  "NODE_EXTRA_CA_CERTS": "/path/to/company-root-ca.pem"
}
```

Do not switch TLS verification off. More fixes: [Troubleshooting](https://docs.wopee.io/guides/wopee-mcp/troubleshooting/).
