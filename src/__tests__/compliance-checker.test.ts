import { ComplianceChecker } from '../security/compliance-checker';
import { ConfigManager } from '../utils/config-manager';

jest.mock('../utils/config-manager');

describe('ComplianceChecker', () => {
  let checker: ComplianceChecker;
  let mockConfig: jest.Mocked<ConfigManager>;

  beforeEach(() => {
    mockConfig = new ConfigManager() as jest.Mocked<ConfigManager>;
    mockConfig.getPlatforms = jest.fn().mockReturnValue([
      { name: 'openai', apiKey: 'key', enabled: true },
    ]);
    checker = new ComplianceChecker(mockConfig);
  });

  describe('checkCompliance', () => {
    it('should return a compliance report for a platform', async () => {
      const report = await checker.checkCompliance('openai');
      expect(report).toBeDefined();
      expect(report.platform).toBe('openai');
      expect(report).toHaveProperty('overallScore');
      expect(report).toHaveProperty('checks');
      expect(report).toHaveProperty('lastChecked');
      expect(Array.isArray(report.checks)).toBe(true);
    });

    it('should return checks with pass/fail status', async () => {
      const report = await checker.checkCompliance('anthropic');
      expect(report.checks.length).toBeGreaterThan(0);
      report.checks.forEach(check => {
        expect(check.status).toMatch(/^(pass|fail|warning)$/);
      });
    });
  });

  describe('getComplianceRecommendations', () => {
    it('should return recommendations from reports', () => {
      const mockReport = {
        platform: 'openai',
        overallScore: 50,
        lastChecked: new Date(),
        checks: [
          { name: 'Test', status: 'fail' as const, score: 0, details: 'Failed check' },
        ],
      };
      const recs = checker.getComplianceRecommendations([mockReport]);
      expect(Array.isArray(recs)).toBe(true);
    });
  });

  describe('exportComplianceReport', () => {
    it('should export as JSON string', () => {
      const mockReport = {
        platform: 'openai',
        overallScore: 85,
        lastChecked: new Date(),
        checks: [],
      };
      const result = checker.exportComplianceReport([mockReport], 'json');
      expect(typeof result).toBe('string');
    });

    it('should export as CSV string', () => {
      const mockReport = {
        platform: 'openai',
        overallScore: 85,
        lastChecked: new Date(),
        checks: [],
      };
      const result = checker.exportComplianceReport([mockReport], 'csv');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getComplianceHistory', () => {
    it('should return history array', () => {
      const history = checker.getComplianceHistory(7);
      expect(Array.isArray(history)).toBe(true);
    });
  });
});
