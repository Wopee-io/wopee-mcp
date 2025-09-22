#!/usr/bin/env node

import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const projectRoot = join(__dirname, '..');
const envPath = join(projectRoot, '.env');

console.log('🔧 Wopee MCP Environment Setup');
console.log('================================');

if (existsSync(envPath)) {
  console.log('✅ .env file already exists at:', envPath);
  console.log('📝 Current contents:');
  const fs = require('fs');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log(content);
} else {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Wopee API Configuration
WOPEE_API_KEY=your_api_key_here
WOPEE_API_URL=https://api.dev.wopee.io/

# Instructions:
# 1. Replace 'your_api_key_here' with your actual Wopee API key
# 2. Update WOPEE_API_URL if needed (default: https://api.wopee.io/)
# 3. Save this file
# 4. Update your MCP configuration to remove hardcoded API key
`;

  writeFileSync(envPath, envContent);
  console.log('✅ Created .env file at:', envPath);
  console.log('📝 Please edit the file and add your actual API key');
}

console.log('\n🔧 Next Steps:');
console.log('1. Edit the .env file and replace "your_api_key_here" with your actual API key');
console.log('2. Update your MCP configuration (mcp.json) to remove the hardcoded API key');
console.log('3. Restart Cursor/VS Code to reload the MCP server');
console.log('\n📋 Example MCP configuration (without hardcoded API key):');
console.log(JSON.stringify({
  "mcpServers": {
    "wopee": {
      "command": "node",
      "args": ["/Users/vem/Projects/wopee-mcp/dist/index.js"],
      "env": {}
    }
  }
}, null, 2));
