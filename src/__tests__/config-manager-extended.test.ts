import { ConfigManager } from '../utils/config-manager';
import { PlatformConfig, SecurityPolicy } from '../types';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');

describe('ConfigManager - Extended Coverage', () => {
  let manager: ConfigManager;
  const mockConfigPath = '/mock/ai-shield-config.json';

  const mockPlatform: PlatformConfig = {
    name: 'openai',
    apiKey: 'sk-test-key',
    enabled: true,
    baseUrl: 'https://api.openai.com'
  };

  const mockPolicy: SecurityPolicy = {
    id: 'test-policy',
    name: 'Test Policy',
    description: 'A test policy',
    rule: 'Block test patterns',
    enabled: true,
    platform: ['openai', 'anthropic'],
    severity: 'high',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
    jest.spyOn(path, 'join').mockReturnValue(mockConfigPath);
    manager = new ConfigManager();
  });

  describe('loadConfig with saved file', () => {
    it('should load config from file when it exists', () => {
      const savedConfig = {
        platforms: [mockPlatform],
        policies: [{
          ...mockPolicy,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }],
        organization: {
          name: 'Test Org',
          departments: ['eng'],
          alertConfig: { email: 'test@test.com' },
          securityLevel: 'strict'
        }
      };
      jest.mocked(fs).existsSync.mockReturnValue(true);
      jest.mocked(fs).readFileSync.mockReturnValue(JSON.stringify(savedConfig));

      manager = new ConfigManager();

      const platforms = manager.getPlatforms();
      expect(platforms).toHaveLength(1);
      expect(platforms[0].name).toBe('openai');
      expect(platforms[0].apiKey).toBe('sk-test-key');

      const policies = manager.getPolicies();
      expect(policies).toHaveLength(1);
      expect(policies[0].createdAt).toBeInstanceOf(Date);
    });

    it('should use defaults when config file has invalid JSON', () => {
      jest.mocked(fs).existsSync.mockReturnValue(true);
      jest.mocked(fs).readFileSync.mockReturnValue('invalid json');

      manager = new ConfigManager();

      // Should have default policies (4)
      expect(manager.getPolicies()).toHaveLength(4);
    });

    it('should handle file read errors gracefully', () => {
      jest.mocked(fs).existsSync.mockReturnValue(true);
      jest.mocked(fs).readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      manager = new ConfigManager();

      // Falls back to defaults
      expect(manager.getPolicies()).toHaveLength(4);
    });
  });

  describe('saveConfig error handling', () => {
    it('should handle write errors gracefully', () => {
      jest.mocked(fs).writeFileSync.mockImplementation(() => {
        throw new Error('Disk full');
      });

      // Should not throw
      expect(() => manager.addPlatform(mockPlatform)).not.toThrow();
    });
  });

  describe('Platform management', () => {
    it('should add a new platform', () => {
      manager.addPlatform(mockPlatform);
      const platforms = manager.getPlatforms();
      expect(platforms).toHaveLength(1);
      expect(platforms[0].name).toBe('openai');
      expect(jest.mocked(fs).writeFileSync).toHaveBeenCalled();
    });

    it('should update an existing platform', () => {
      manager.addPlatform(mockPlatform);
      manager.addPlatform({ ...mockPlatform, apiKey: 'sk-updated' });
      const platforms = manager.getPlatforms();
      expect(platforms).toHaveLength(1);
      expect(platforms[0].apiKey).toBe('sk-updated');
    });

    it('should remove a platform', () => {
      manager.addPlatform(mockPlatform);
      const removed = manager.removePlatform('openai');
      expect(removed).toBe(true);
      expect(manager.getPlatforms()).toHaveLength(0);
    });

    it('should return false when removing non-existent platform', () => {
      const removed = manager.removePlatform('nonexistent');
      expect(removed).toBe(false);
    });

    it('should toggle platform enabled state', () => {
      manager.addPlatform(mockPlatform);
      manager.togglePlatform('openai', false);
      expect(manager.getPlatform('openai')?.enabled).toBe(false);
      manager.togglePlatform('openai', true);
      expect(manager.getPlatform('openai')?.enabled).toBe(true);
    });

    it('should do nothing when toggling non-existent platform', () => {
      manager.togglePlatform('nonexistent', true);
      // No error thrown, no crash
      expect(manager.getPlatforms()).toHaveLength(0);
    });

    it('should return undefined for non-existent platform', () => {
      expect(manager.getPlatform('nonexistent')).toBeUndefined();
    });
  });

  describe('Policy management', () => {
    it('should add a policy', () => {
      manager.addPolicy(mockPolicy);
      expect(manager.getPolicies()).toHaveLength(5); // 4 default + 1
      expect(manager.getPolicy('test-policy')).toBeDefined();
    });

    it('should update a policy', () => {
      manager.addPolicy(mockPolicy);
      const updated = manager.updatePolicy('test-policy', { name: 'Updated Policy' });
      expect(updated).toBe(true);
      expect(manager.getPolicy('test-policy')?.name).toBe('Updated Policy');
    });

    it('should return false when updating non-existent policy', () => {
      const updated = manager.updatePolicy('nonexistent', { name: 'X' });
      expect(updated).toBe(false);
    });

    it('should enable a policy', () => {
      manager.disablePolicy('prompt-injection-detection');
      expect(manager.getPolicy('prompt-injection-detection')?.enabled).toBe(false);
      manager.enablePolicy('prompt-injection-detection');
      expect(manager.getPolicy('prompt-injection-detection')?.enabled).toBe(true);
    });

    it('should disable a policy', () => {
      manager.disablePolicy('data-leakage-prevention');
      expect(manager.getPolicy('data-leakage-prevention')?.enabled).toBe(false);
    });

    it('should return false when enabling non-existent policy', () => {
      expect(manager.enablePolicy('nonexistent')).toBe(false);
    });

    it('should return false when disabling non-existent policy', () => {
      expect(manager.disablePolicy('nonexistent')).toBe(false);
    });

    it('should remove a policy', () => {
      const initial = manager.getPolicies().length;
      const removed = manager.removePolicy('prompt-injection-detection');
      expect(removed).toBe(true);
      expect(manager.getPolicies()).toHaveLength(initial - 1);
    });

    it('should return false when removing non-existent policy', () => {
      const removed = manager.removePolicy('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('validatePlatformConfig', () => {
    it('should return no errors for valid config', () => {
      const errors = manager.validatePlatformConfig(mockPlatform);
      expect(errors).toHaveLength(0);
    });

    it('should return error for invalid platform name', () => {
      const errors = manager.validatePlatformConfig({
        ...mockPlatform,
        name: 'invalid' as 'openai' | 'anthropic' | 'google' | 'azure'
      });
      expect(errors).toContain('Invalid platform name');
    });

    it('should return error for missing API key', () => {
      const errors = manager.validatePlatformConfig({
        ...mockPlatform,
        apiKey: ''
      });
      expect(errors).toContain('API key is required');
    });

    it('should return error for whitespace-only API key', () => {
      const errors = manager.validatePlatformConfig({
        ...mockPlatform,
        apiKey: '   '
      });
      expect(errors).toContain('API key is required');
    });

    it('should return error for invalid base URL', () => {
      const errors = manager.validatePlatformConfig({
        ...mockPlatform,
        baseUrl: 'ftp://bad.url'
      });
      expect(errors).toContain('Base URL must start with http:// or https://');
    });

    it('should accept valid base URL', () => {
      const errors = manager.validatePlatformConfig({
        ...mockPlatform,
        baseUrl: 'https://api.test.com'
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept all valid platform names', () => {
      ['openai', 'anthropic', 'google', 'azure'].forEach(name => {
        const errors = manager.validatePlatformConfig({
          ...mockPlatform,
          name: name as 'openai' | 'anthropic' | 'google' | 'azure'
        });
        expect(errors).not.toContain('Invalid platform name');
      });
    });
  });

  describe('validatePolicy', () => {
    it('should return no errors for valid policy', () => {
      const errors = manager.validatePolicy(mockPolicy);
      expect(errors).toHaveLength(0);
    });

    it('should return error for missing policy ID', () => {
      const errors = manager.validatePolicy({ ...mockPolicy, id: '' });
      expect(errors).toContain('Policy ID is required');
    });

    it('should return error for missing policy name', () => {
      const errors = manager.validatePolicy({ ...mockPolicy, name: '' });
      expect(errors).toContain('Policy name is required');
    });

    it('should return error for missing policy rule', () => {
      const errors = manager.validatePolicy({ ...mockPolicy, rule: '' });
      expect(errors).toContain('Policy rule is required');
    });

    it('should return error for invalid severity', () => {
      const errors = manager.validatePolicy({
        ...mockPolicy,
        severity: 'invalid' as 'low' | 'medium' | 'high' | 'critical'
      });
      expect(errors).toContain('Invalid severity level');
    });

    it('should return error for empty platform array', () => {
      const errors = manager.validatePolicy({ ...mockPolicy, platform: [] });
      expect(errors).toContain('At least one platform must be specified');
    });

    it('should return error for invalid platform in array', () => {
      const errors = manager.validatePolicy({
        ...mockPolicy,
        platform: ['openai', 'invalid' as 'openai' | 'anthropic' | 'google' | 'azure']
      });
      expect(errors).toContain('Invalid platform: invalid');
    });

    it('should accept all valid severity levels', () => {
      ['low', 'medium', 'high', 'critical'].forEach(severity => {
        const errors = manager.validatePolicy({
          ...mockPolicy,
          severity: severity as 'low' | 'medium' | 'high' | 'critical'
        });
        expect(errors).not.toContain('Invalid severity level');
      });
    });
  });

  describe('reset', () => {
    it('should reset config to defaults', () => {
      manager.addPlatform(mockPlatform);
      manager.addPolicy(mockPolicy);
      manager.reset();
      expect(manager.getPlatforms()).toHaveLength(0);
      expect(manager.getPolicies()).toHaveLength(4); // Back to defaults
    });
  });

  describe('exportConfig', () => {
    it('should export config as JSON string', () => {
      manager.addPlatform(mockPlatform);
      const exported = manager.exportConfig();
      const parsed = JSON.parse(exported);
      expect(parsed.platforms).toHaveLength(1);
      expect(parsed.platforms[0].name).toBe('openai');
    });
  });

  describe('importConfig', () => {
    it('should import valid config', () => {
      const configToImport = JSON.stringify({
        platforms: [mockPlatform],
        policies: [],
        organization: {
          name: 'Imported Org',
          departments: [],
          alertConfig: {},
          securityLevel: 'strict'
        }
      });

      const result = manager.importConfig(configToImport);
      expect(result).toBe(true);
      expect(manager.getPlatforms()).toHaveLength(1);
      expect(manager.getPlatforms()[0].name).toBe('openai');
    });

    it('should return false for invalid JSON', () => {
      const result = manager.importConfig('invalid json');
      expect(result).toBe(false);
    });

    it('should return false for JSON that throws on parse', () => {
      const result = manager.importConfig('{bad}');
      expect(result).toBe(false);
    });
  });

  describe('calculateSecurityPosture', () => {
    it('should return posture with zero platforms', () => {
      const posture = manager.calculateSecurityPosture();
      expect(posture.overallScore).toBe(0);
      expect(posture.platforms).toHaveLength(0);
      expect(posture.policies.total).toBe(4);
      expect(posture.policies.enabled).toBe(4);
    });

    it('should calculate posture with platforms', () => {
      manager.addPlatform(mockPlatform);
      manager.addPlatform({ ...mockPlatform, name: 'anthropic' });

      const posture = manager.calculateSecurityPosture();
      expect(posture.platforms).toHaveLength(2);
      expect(posture.overallScore).toBeGreaterThanOrEqual(0);
      expect(posture.policies.total).toBe(4);
    });

    it('should handle disabled platforms in posture', () => {
      manager.addPlatform({ ...mockPlatform, enabled: false });
      const posture = manager.calculateSecurityPosture();
      expect(posture.platforms).toHaveLength(1);
      expect(posture.platforms[0].score).toBe(0);
    });

    it('should track threats in posture', () => {
      const posture = manager.calculateSecurityPosture();
      expect(posture.threats).toBeDefined();
      expect(posture.threats.active).toBeGreaterThanOrEqual(0);
      expect(posture.threats.resolved).toBeGreaterThanOrEqual(0);
      expect(posture.threats.falsePositives).toBeGreaterThanOrEqual(0);
    });
  });

  describe('detectThreats', () => {
    it('should detect threats without filters', async () => {
      const threats = await manager.detectThreats({});
      expect(threats).toHaveLength(2);
      expect(threats[0].type).toBe('prompt-injection');
    });

    it('should filter threats by type', async () => {
      const threats = await manager.detectThreats({ type: 'prompt-injection' });
      expect(threats).toHaveLength(1);
      expect(threats[0].type).toBe('prompt-injection');
    });

    it('should filter threats by severity', async () => {
      const threats = await manager.detectThreats({ severity: 'high' });
      expect(threats).toHaveLength(1);
      expect(threats[0].severity).toBe('high');
    });

    it('should filter threats by platform', async () => {
      const threats = await manager.detectThreats({ platform: 'openai' });
      expect(threats).toHaveLength(2);
      expect(threats[0].platform).toBe('openai');
    });

    it('should return threats with proper structure', async () => {
      const threats = await manager.detectThreats({});
      expect(threats[0].id).toBeDefined();
      expect(threats[0].description).toBeDefined();
      expect(threats[0].confidence).toBeGreaterThan(0);
      expect(threats[0].evidence).toBeDefined();
      expect(threats[0].status).toBe('active');
    });
  });

  describe('File utilities', () => {
    it('should return config path', () => {
      expect(manager.getConfigPath()).toBe(mockConfigPath);
    });

    it('should check if config exists', () => {
      jest.mocked(fs).existsSync.mockReturnValue(true);
      expect(manager.configExists()).toBe(true);
      jest.mocked(fs).existsSync.mockReturnValue(false);
      expect(manager.configExists()).toBe(false);
    });

    it('should delete config file', () => {
      jest.mocked(fs).existsSync.mockReturnValue(true);
      const result = manager.deleteConfig();
      expect(result).toBe(true);
      expect(jest.mocked(fs).unlinkSync).toHaveBeenCalledWith(mockConfigPath);
    });

    it('should return false when deleting non-existent config', () => {
      jest.mocked(fs).existsSync.mockReturnValue(false);
      const result = manager.deleteConfig();
      expect(result).toBe(false);
    });

    it('should handle delete errors', () => {
      jest.mocked(fs).existsSync.mockReturnValue(true);
      jest.mocked(fs).unlinkSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      const result = manager.deleteConfig();
      expect(result).toBe(false);
    });
  });
});
