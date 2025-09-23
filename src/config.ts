import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { WopeeConfig, WopeeConfigSchema } from './types/index';

// Get project root directory (where package.json is located)
const getProjectRoot = (): string => {
  const cwd = process.cwd();
  
  // First, try to find the project root relative to the current working directory
  let currentDir = cwd;
  while (currentDir !== '/') {
    if (existsSync(join(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = join(currentDir, '..');
  }
  
  // If that fails, try to find it relative to the script location
  // This works when the server is run from anywhere
  try {
    // Use eval to avoid TypeScript compilation issues with import.meta in Jest
    const importMetaUrl = eval('import.meta.url');
    if (importMetaUrl) {
      const scriptDir = new URL(importMetaUrl).pathname;
      if (scriptDir.includes('/dist/')) {
        const projectRoot = scriptDir.split('/dist/')[0];
        if (projectRoot && existsSync(join(projectRoot, 'package.json'))) {
          return projectRoot;
        }
      }
    }
  } catch (error) {
    // Ignore errors and continue with fallback
  }
  
  // Additional fallback: try to find wopee-mcp project in common locations
  const possiblePaths = [
    '/Users/vem/Projects/wopee-mcp',
    join(process.env.HOME || '', 'Projects/wopee-mcp'),
    join(process.env.HOME || '', 'projects/wopee-mcp'),
  ];
  
  for (const path of possiblePaths) {
    if (existsSync(join(path, 'package.json'))) {
      return path;
    }
  }
  
  // Final fallback to current working directory
  return cwd;
};

/**
 * Configuration manager for Wopee MCP server
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: WopeeConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Get singleton instance of ConfigManager
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Load and validate configuration from environment variables
   */
  private loadConfig(): WopeeConfig {
    // Try to load .env files from multiple locations
    this.loadEnvFiles();
    
    const rawConfig = {
      apiKey: process.env.WOPEE_API_KEY,
      apiUrl: process.env.WOPEE_API_URL || 'https://api.wopee.io/',
      projectUuid: process.env.WOPEE_PROJECT_UUID,
    };

    try {
      return WopeeConfigSchema.parse(rawConfig);
    } catch (error) {
      const errorMessage = this.getConfigErrorMessage(rawConfig);
      throw new Error(`Configuration validation failed: ${errorMessage}`);
    }
  }

  /**
   * Load .env file from project root directory
   */
  private loadEnvFiles(): void {
    const projectRoot = getProjectRoot();
    const envPath = join(projectRoot, '.env');

    if (existsSync(envPath)) {
      try {
        config({ path: envPath });
      } catch (error) {
        console.error(`[Wopee MCP] Failed to load .env from ${envPath}:`, error);
      }
    } else {
      console.error(`[Wopee MCP] No .env file found at: ${envPath}`);
      console.error('[Wopee MCP] Please create a .env file in the project root with your WOPEE_API_KEY and WOPEE_PROJECT_UUID');
    }
  }

  /**
   * Get detailed error message for configuration issues
   */
  private getConfigErrorMessage(rawConfig: any): string {
    const errors: string[] = [];

    if (!rawConfig.apiKey) {
      errors.push('WOPEE_API_KEY is required. Please set it in your .env file or environment variables.');
    }

    if (!rawConfig.projectUuid) {
      errors.push('WOPEE_PROJECT_UUID is required. Please set it in your .env file or environment variables.');
    }

    if (rawConfig.apiUrl && !rawConfig.apiUrl.startsWith('http')) {
      errors.push('WOPEE_API_URL must be a valid URL starting with http:// or https://');
    }

    if (errors.length === 0) {
      return 'Unknown configuration error';
    }

    return errors.join(' ');
  }

  /**
   * Get the current configuration
   */
  public getConfig(): WopeeConfig {
    return { ...this.config };
  }

  /**
   * Get API key
   */
  public getApiKey(): string {
    return this.config.apiKey;
  }

  /**
   * Get API URL
   */
  public getApiUrl(): string {
    return this.config.apiUrl;
  }

  /**
   * Get Project UUID
   */
  public getProjectUuid(): string {
    return this.config.projectUuid;
  }

  /**
   * Reload configuration (useful for testing)
   */
  public reloadConfig(): void {
    this.config = this.loadConfig();
  }
}

// Export singleton instance (lazy initialization)
let _configManager: ConfigManager | null = null;

export const configManager = {
  getInstance(): ConfigManager {
    if (!_configManager) {
      _configManager = ConfigManager.getInstance();
    }
    return _configManager;
  }
};
