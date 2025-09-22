#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 MCP Configuration Update Helper');
console.log('===================================');

// Common MCP config locations
const possibleConfigPaths = [
  join(process.env.HOME || process.env.USERPROFILE || '', '.cursor', 'mcp.json'),
  join(process.env.HOME || process.env.USERPROFILE || '', '.vscode', 'mcp.json'),
  join(process.env.HOME || process.env.USERPROFILE || '', 'mcp.json'),
  '.cursor/mcp.json',
  '.vscode/mcp.json',
  'mcp.json'
];

console.log('🔍 Searching for MCP configuration files...');

let configFound = false;
for (const configPath of possibleConfigPaths) {
  if (existsSync(configPath)) {
    console.log(`✅ Found MCP config at: ${configPath}`);
    
    try {
      const configContent = readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      // Check if wopee server exists
      if (config.mcpServers && config.mcpServers.wopee) {
        console.log('📝 Current wopee server configuration:');
        console.log(JSON.stringify(config.mcpServers.wopee, null, 2));
        
        // Check if it has hardcoded API key
        if (config.mcpServers.wopee.env && config.mcpServers.wopee.env.WOPEE_API_KEY) {
          console.log('\n⚠️  Found hardcoded API key in MCP configuration!');
          console.log('🔧 Updating configuration to use .env file instead...');
          
          // Remove hardcoded API key
          config.mcpServers.wopee.env = {};
          
          // Write updated config
          writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
          console.log('✅ Updated MCP configuration successfully!');
          console.log('📝 New configuration:');
          console.log(JSON.stringify(config.mcpServers.wopee, null, 2));
          
          console.log('\n🔄 Next steps:');
          console.log('1. Restart Cursor/VS Code to reload the MCP server');
          console.log('2. The server will now load API keys from your .env file');
          console.log('3. Make sure your .env file contains:');
          console.log('   WOPEE_API_KEY=your_actual_api_key_here');
          console.log('   WOPEE_API_URL=https://api.dev.wopee.io/');
        } else {
          console.log('✅ Configuration already uses .env file approach (no hardcoded API key)');
        }
      } else {
        console.log('ℹ️  No wopee server found in this configuration file');
      }
      
      configFound = true;
    } catch (error) {
      console.error(`❌ Error reading config file ${configPath}:`, error.message);
    }
  }
}

if (!configFound) {
  console.log('❌ No MCP configuration files found in common locations:');
  possibleConfigPaths.forEach(path => {
    console.log(`   - ${path}`);
  });
  console.log('\n📝 You can manually update your MCP configuration to:');
  console.log(JSON.stringify({
    "mcpServers": {
      "wopee": {
        "command": "node",
        "args": ["/Users/vem/Projects/wopee-mcp/dist/index.js"],
        "env": {}
      }
    }
  }, null, 2));
}
