#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function addJsExtensions(dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      addJsExtensions(filePath);
    } else if (file.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf8');
      
      // Add .js extensions to local imports
      content = content.replace(/from ['"](\.\/[^'"]+)['"]/g, (match, importPath) => {
        if (!importPath.endsWith('.js')) {
          return `from '${importPath}.js'`;
        }
        return match;
      });
      
      content = content.replace(/from ['"](\.\.\/[^'"]+)['"]/g, (match, importPath) => {
        if (!importPath.endsWith('.js')) {
          return `from '${importPath}.js'`;
        }
        return match;
      });
      
      writeFileSync(filePath, content);
    }
  }
}

// Add .js extensions to all built files
addJsExtensions(join(__dirname, '..', 'dist'));
console.log('Added .js extensions to built files');
