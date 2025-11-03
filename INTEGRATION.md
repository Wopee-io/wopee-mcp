# VS Code & Cursor Integration Guide

This guide provides detailed instructions for integrating the Wopee.io MCP server with VS Code and Cursor editors.

> **Note:** For general installation and usage, see [README.md](README.md). This guide focuses on IDE-specific setup and advanced configuration.

## 🔐 Environment Configuration

**Recommended Approach: Use .env files**

The Wopee.io MCP server automatically loads configuration from `.env` files, making it more secure than hardcoding API keys in configuration files.

### Setting up .env file

1. **Create a .env file in your project root:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit with your actual API key
   nano .env
   ```

2. **Add your configuration:**
   ```bash
   # Wopee API Configuration
   WOPEE_API_KEY=your_actual_api_key_here
   WOPEE_PROJECT_UUID=your_project_uuid_here
   ```

The server will automatically load your `.env` file from the project root directory (where `package.json` is located).

## Prerequisites

Before starting, ensure you have:

- **VS Code** with MCP extension installed, or **Cursor** (built-in MCP support)
- **Node.js 18+** installed on your system
- **Wopee API key** from [wopee.io](https://wopee.io)

> **Quick Install:** Both editors support one-click installation via Command Palette → "MCP: Install Server" → `wopee-mcp`

## VS Code Integration

### Installing the MCP Extension

If you don't have the MCP extension:

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "MCP" or "Model Context Protocol"
4. Install the official MCP extension

### Quick Setup (One-Click Installation)

1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: `MCP: Install Server`
3. Enter package name: `wopee-mcp`
4. Configure API key when prompted

### Manual Configuration

If you prefer manual setup or need custom configuration:

1. **Install globally**:
   ```bash
   npm install -g wopee-mcp
   ```

2. **Open VS Code settings** (`Ctrl+,` or `Cmd+,`)

3. **Search for "MCP"** in settings

4. **Add server configuration**:
   ```json
   {
     "mcp.servers": {
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

5. **Restart VS Code**

### Method 3: Workspace Configuration

For project-specific configuration, create `.vscode/settings.json`:

```json
{
  "mcp.servers": {
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

## Cursor Integration

### Quick Setup (One-Click Installation)

1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: `MCP: Install Server`
3. Enter package name: `wopee-mcp`
4. Configure API key when prompted

### Manual Configuration

For custom setup:

1. **Install globally**:
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
         "command": "npx",
         "args": [
           "wopee-mcp@latest"
         ],
         "env": {}
       }
     }
   }
   ```

   **Note:** The server automatically loads configuration from `.env` file. You can override with environment variables in the config if needed.

5. **Restart Cursor**

## Using the Tools

Once configured, you can use Wopee tools in your chat interface. See [README.md](README.md#using-the-tools) and [EXAMPLES.md](EXAMPLES.md) for detailed tool usage.

### Example Workflow

1. **Start with analysis**:
   ```
   @wopee wopee_dispatch_analysis
   Suite Analysis Config:
     - Username: testuser
     - Password: testpass
   ```

2. **Generate app context**:
   ```
   @wopee wopee_generate_app_context
   Suite UUID: [from previous step]
   Extra Prompt: Focus on user registration and login flows
   ```

3. **Generate general user stories**:
   ```
   @wopee wopee_generate_general_user_stories
   Suite UUID: [from step 1]
   Extra Prompt: Include high-level business requirements
   ```

4. **Create detailed user stories**:
   ```
   @wopee wopee_generate_user_stories
   Suite UUID: [from step 1]
   Extra Prompt: Include error handling and edge cases
   ```

5. **Generate test cases**:
   ```
   @wopee wopee_generate_test_cases
   Suite UUID: [from step 1]
   Extra Prompt: Generate comprehensive test coverage
   ```

6. **Execute tests**:
   ```
   @wopee wopee_dispatch_agent
   Suite UUID: [from step 1]
   Analysis Identifier: [from step 1]
   ```

## Troubleshooting

### Common Issues

#### 1. "Command not found" Error

**Problem**: The `wopee-mcp` command is not found.

**Solutions**:
- Install globally: `npm install -g wopee-mcp`
- Check Node.js is in PATH: `node --version`
- Restart your terminal/editor

#### 2. "API key not configured" Error

**Problem**: API key is missing or invalid.

**Solutions**:
- Verify API key set in .env file
- Check environment variables are set correctly
- Ensure API key is valid at [wopee.io](https://wopee.io)

#### 3. "Connection failed" Error

**Problem**: Cannot connect to Wopee API.

**Solutions**:
- Check internet connection
- Verify API URL is correct: `https://api.wopee.io/`
- Test API key validity
- Check firewall/proxy settings

#### 4. Tools Not Appearing

**Problem**: Wopee tools don't show up in chat interface.

**Solutions**:
- Restart your editor (VS Code/Cursor)
- Check MCP server logs in output panel
- Verify server configuration
- Run `wopee-mcp --version` to test installation

#### 5. Permission Errors

**Problem**: Permission denied when installing or running.

**Solutions**:
- Use `sudo` for global installation (Linux/Mac)
- Check file permissions
- Run as administrator (Windows)

### Debugging Steps

1. **Check installation**:
   ```bash
   wopee-mcp --version
   wopee-mcp --help
   ```

2. **Test API connection**:
   ```bash
   curl -H "api_key: YOUR_API_KEY" https://api.wopee.io/
   ```

3. **Check MCP server logs**:
   - Open Output panel in VS Code/Cursor
   - Select "MCP" from dropdown
   - Look for error messages

4. **Verify configuration**:
   - Check MCP server settings
   - Ensure environment variables are set
   - Validate JSON configuration syntax

### Getting Help

- **Check logs**: Look in the MCP server output panel
- **Verify installation**: Run `wopee-mcp --help` in terminal
- **Test connection**: Use a simple tool like `wopee_dispatch_analysis`
- **Community support**: Check the repository issues
- **Documentation**: Refer to the main README.md

## Advanced Configuration

### Custom Environment Variables

You can set additional environment variables:

```json
{
  "mcp.servers": {
    "wopee": {
      "command": "npx",
      "args": [
        "wopee-mcp@latest"
      ],
      "env": {
        "WOPEE_API_KEY": "your_api_key_here",
        "WOPEE_PROJECT_UUID": "your_project_uuid_here",
        "WOPEE_API_URL": "https://api.wopee.io/",
        "NODE_ENV": "production",
        "DEBUG": "wopee:*"
      }
    }
  }
}
```

**Note:** Usually, you don't need to set environment variables in the config since the server loads from `.env` files automatically.

### Multiple Server Instances

You can run multiple instances with different configurations:

```json
{
  "mcp.servers": {
    "wopee-prod": {
      "command": "npx",
      "args": [
        "wopee-mcp@latest"
      ],
      "env": {
        "WOPEE_API_KEY": "prod_api_key",
        "WOPEE_API_URL": "https://api.wopee.io/"
      }
    },
    "wopee-dev": {
      "command": "npx",
      "args": [
        "wopee-mcp@latest"
      ],
      "env": {
        "WOPEE_API_KEY": "dev_api_key",
        "WOPEE_API_URL": "https://api.dev.wopee.io/"
      }
    }
  }
}
```

**Note:** Custom arguments are rarely needed. The server loads configuration from `.env` files automatically.

## Best Practices

1. **Use environment variables** for sensitive data like API keys
2. **Test with dry-run** before using in production
3. **Keep API keys secure** and don't commit them to version control
4. **Use workspace-specific** configurations for different projects
5. **Monitor logs** for debugging and performance insights
6. **Update regularly** to get the latest features and fixes

## Support

For additional help:

- **Documentation**: Check the main README.md
- **Issues**: Create an issue in the repository
- **Community**: Join the Wopee community discussions
- **Email**: Contact support at [help@wopee.io](mailto:help@wopee.io)
