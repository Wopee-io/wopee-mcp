import { ConfigManager } from '../src/config';

// Mock dotenv.config to prevent loading .env file during tests
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('ConfigManager', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear environment variables
    delete process.env.WOPEE_API_KEY;
    delete process.env.WOPEE_PROJECT_UUID;
    delete process.env.WOPEE_API_URL;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      // Set required environment variables
      process.env.WOPEE_API_KEY = 'test-api-key';
      process.env.WOPEE_PROJECT_UUID = 'test-project-uuid';
      
      const instance1 = ConfigManager.getInstance();
      const instance2 = ConfigManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('loadConfig', () => {
    it('should load configuration with valid environment variables', () => {
      process.env.WOPEE_API_KEY = 'test-api-key';
      process.env.WOPEE_PROJECT_UUID = 'test-project-uuid';
      process.env.WOPEE_API_URL = 'https://api.test.wopee.io/';
      
      const configManager = ConfigManager.getInstance();
      configManager.reloadConfig();
      
      const config = configManager.getConfig();
      expect(config.apiKey).toBe('test-api-key');
      expect(config.apiUrl).toBe('https://api.test.wopee.io/');
    });

    it('should use default API URL when not provided', () => {
      // Clear environment variables first
      delete process.env.WOPEE_API_KEY;
      delete process.env.WOPEE_API_URL;
      
      // Set only the API key
      process.env.WOPEE_API_KEY = 'test-api-key';
      process.env.WOPEE_PROJECT_UUID = 'test-project-uuid';
      
      const configManager = ConfigManager.getInstance();
      configManager.reloadConfig();
      
      const config = configManager.getConfig();
      expect(config.apiKey).toBe('test-api-key');
      expect(config.apiUrl).toBe('https://api.wopee.io/');
    });

    it('should throw error when API key is missing', () => {
      const configManager = ConfigManager.getInstance();
      
      expect(() => {
        configManager.reloadConfig();
      }).toThrow('Configuration validation failed');
    });

    it('should throw error when API URL is invalid', () => {
      process.env.WOPEE_API_KEY = 'test-api-key';
      process.env.WOPEE_PROJECT_UUID = 'test-project-uuid';
      process.env.WOPEE_API_URL = 'invalid-url';
      
      const configManager = ConfigManager.getInstance();
      
      expect(() => {
        configManager.reloadConfig();
      }).toThrow('Configuration validation failed');
    });
  });

  describe('getApiKey', () => {
    it('should return the API key', () => {
      process.env.WOPEE_API_KEY = 'test-api-key';
      process.env.WOPEE_PROJECT_UUID = 'test-project-uuid';
      
      const configManager = ConfigManager.getInstance();
      configManager.reloadConfig();
      
      expect(configManager.getApiKey()).toBe('test-api-key');
    });
  });

  describe('getApiUrl', () => {
    it('should return the API URL', () => {
      process.env.WOPEE_API_KEY = 'test-api-key';
      process.env.WOPEE_PROJECT_UUID = 'test-project-uuid';
      process.env.WOPEE_API_URL = 'https://api.test.wopee.io/';
      
      const configManager = ConfigManager.getInstance();
      configManager.reloadConfig();
      
      expect(configManager.getApiUrl()).toBe('https://api.test.wopee.io/');
    });
  });

  describe('getProjectUuid', () => {
    it('should return the project UUID', () => {
      process.env.WOPEE_API_KEY = 'test-api-key';
      process.env.WOPEE_PROJECT_UUID = 'test-project-uuid';
      
      const configManager = ConfigManager.getInstance();
      configManager.reloadConfig();
      
      expect(configManager.getProjectUuid()).toBe('test-project-uuid');
    });
  });

  describe('error handling', () => {
    it('should throw error when project UUID is missing', () => {
      process.env.WOPEE_API_KEY = 'test-api-key';
      // Don't set WOPEE_PROJECT_UUID
      
      const configManager = ConfigManager.getInstance();
      
      expect(() => {
        configManager.reloadConfig();
      }).toThrow('Configuration validation failed');
    });
  });
});
