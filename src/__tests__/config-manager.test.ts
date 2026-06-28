import { ConfigManager } from '../utils/config-manager';
import * as fs from 'fs';

jest.mock('fs');

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => null as unknown as string);
    configManager = new ConfigManager();
  });

  describe('constructor', () => {
    it('should initialize with default config when no config file exists', () => {
      expect(configManager).toBeDefined();
      expect(configManager.getPlatforms()).toBeDefined();
      expect(configManager.getPolicies()).toBeDefined();
    });
  });

  describe('getPlatforms', () => {
    it('should return array of platforms', () => {
      const platforms = configManager.getPlatforms();
      expect(Array.isArray(platforms)).toBe(true);
    });
  });

  describe('getPolicies', () => {
    it('should return array of policies', () => {
      const policies = configManager.getPolicies();
      expect(Array.isArray(policies)).toBe(true);
    });
  });

  describe('addPlatform', () => {
    it('should add a new platform', () => {
      const initialCount = configManager.getPlatforms().length;
      configManager.addPlatform({
        name: 'openai',
        apiKey: 'test-key',
        enabled: true,
      });
      expect(configManager.getPlatforms().length).toBe(initialCount + 1);
    });
  });

  describe('togglePlatform', () => {
    it('should toggle platform enabled state', () => {
      configManager.addPlatform({
        name: 'openai',
        apiKey: 'test-key',
        enabled: true,
      });
      configManager.togglePlatform('openai', false);
      const platforms = configManager.getPlatforms();
      const openai = platforms.find(p => p.name === 'openai');
      expect(openai?.enabled).toBe(false);
    });
  });

  describe('addPolicy', () => {
    it('should add a new policy', () => {
      const initialCount = configManager.getPolicies().length;
      configManager.addPolicy({
        id: 'test-policy',
        name: 'Test Policy',
        description: 'Test description',
        rule: 'block-prompts-with-secrets',
        enabled: true,
        platform: ['openai'],
        severity: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(configManager.getPolicies().length).toBe(initialCount + 1);
    });
  });

  describe('exportConfig', () => {
    it('should return a JSON string of config', () => {
      const result = configManager.exportConfig();
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('platforms');
    });
  });
});
