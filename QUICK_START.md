# Quick Start Guide

[![Install in VS Code](https://img.shields.io/badge/VS%20Code-Install-blue?logo=visual-studio-code&style=for-the-badge)](INTEGRATION.md#vs-code-integration)
[![Install in Cursor](https://img.shields.io/badge/Cursor-Install-blue?logo=cursor&style=for-the-badge)](INTEGRATION.md#cursor-integration)

## 🚀 One-Click Installation

### VS Code / Cursor
1. `Ctrl+Shift+P` → "MCP: Install Server"
2. Enter: `wopee-mcp`
3. Add your API key into .env file

## 🛠 Available Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `wopee_dispatch_analysis` | Start app analysis | `@wopee wopee_dispatch_analysis Project UUID: project-123` |
| `wopee_dispatch_agent` | Execute tests | `@wopee wopee_dispatch_agent Project UUID: project-123 Suite UUID: suite-123` |
| `wopee_generate_app_context` | Generate app context | `@wopee wopee_generate_app_context Project UUID: project-123 Suite UUID: suite-123` |
| `wopee_generate_general_user_stories` | Generate general user stories | `@wopee wopee_generate_general_user_stories Project UUID: project-123 Suite UUID: suite-123` |
| `wopee_generate_user_stories` | Generate detailed user stories | `@wopee wopee_generate_user_stories Project UUID: project-123 Suite UUID: suite-123` |
| `wopee_generate_test_cases` | Generate test cases | `@wopee wopee_generate_test_cases Project UUID: project-123 Suite UUID: suite-123` |
| `wopee_get_app_context` | Get existing app context | `@wopee wopee_get_app_context Project UUID: project-123 Suite UUID: suite-123` |
| `wopee_get_user_stories` | Get existing user stories | `@wopee wopee_get_user_stories Project UUID: project-123 Suite UUID: suite-123` |
| `wopee_get_test_cases` | Get existing test cases | `@wopee wopee_get_test_cases Project UUID: project-123 Suite UUID: suite-123` |
| `wopee_fetch_analysis_suites` | Fetch all analysis suites | `@wopee wopee_fetch_analysis_suites Project UUID: project-123` |

## 🔧 Manual Installation

```bash
npm install -g wopee-mcp
```

## ⚙️ Configuration

Set environment variables:
```bash
export WOPEE_API_KEY=your_api_key_here
export WOPEE_PROJECT_UUID=your_project_uuid_here
```

## 🆘 Troubleshooting

- **Command not found**: `npm install -g wopee-mcp`
- **API key error**: Check environment variables
- **Connection failed**: Verify internet and API key
- **Tools not showing**: Restart editor

## 📚 More Info

- [Full Integration Guide](INTEGRATION.md)
- [Usage Examples](EXAMPLES.md)
- [Main Documentation](README.md)
