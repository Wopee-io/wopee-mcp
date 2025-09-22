#!/usr/bin/env node

/**
 * CLI entry point for the Wopee MCP Server
 * This script allows running the server with different configurations
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function showHelp() {
  console.log(`
Wopee MCP Server CLI

Usage: node cli.js [options]

Options:
  --help, -h          Show this help message
  --version, -v       Show version information
  --dev               Run in development mode with tsx
  --build             Build the TypeScript project
  --test              Run tests
  --lint              Run ESLint

Environment Variables:
  WOPEE_API_KEY       Your Wopee API key (required)
  WOPEE_API_URL       Wopee API endpoint (optional, defaults to https://api.wopee.io/)

Examples:
  node cli.js --dev                    # Run in development mode
  node cli.js --build                  # Build the project
  WOPEE_API_KEY=your_key node cli.js   # Run with API key
`);
}

function showVersion() {
  const packageJson = JSON.parse(
    require('fs').readFileSync(join(__dirname, 'package.json'), 'utf8')
  );
  console.log(`Wopee MCP Server v${packageJson.version}`);
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    return;
  }

  try {
    if (args.includes('--dev')) {
      console.log('Starting Wopee MCP Server in development mode...');
      await runCommand('npx', ['tsx', 'src/index.ts']);
    } else if (args.includes('--build')) {
      console.log('Building Wopee MCP Server...');
      await runCommand('npm', ['run', 'build']);
    } else if (args.includes('--test')) {
      console.log('Running tests...');
      await runCommand('npm', ['test']);
    } else if (args.includes('--lint')) {
      console.log('Running ESLint...');
      await runCommand('npm', ['run', 'lint']);
    } else {
      // Default: run the built server
      console.log('Starting Wopee MCP Server...');
      await runCommand('node', ['dist/index.js']);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
