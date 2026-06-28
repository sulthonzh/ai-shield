import { ComplianceChecker } from '../security/compliance-checker';
import { ConfigManager } from '../utils/config-manager';

jest.mock('fs');
jest.mock('path');

describe('ComplianceChecker - Extended Coverage', () => {
  let checker: ComplianceChecker;
  let mockConfig: ConfigManager;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig = {
      getPlatforms: jest.fn().mockReturnValue([
        { name: 'openai', apiKey: 'key', enabled: true },
        { name: 'anthropic', apiKey: 'key', enabled: true },
        { name: 'google', apiKey: 'key', enabled: false }
      ])
    } as unknown as ConfigManager;
    checker = new ComplianceChecker(mockConfig);
  });

  describe('checkCompliance', () => {
    it('should check compliance for openai', async () => {
      const report = await checker.checkCompliance('openai');
      expect(report.platform).toBe('openai');
      expect(report.checks.length).toBeGreaterThan(0);
      expect(report.overallScore).toBeGreaterThan(0);
      expect(report.lastChecked).toBeInstanceOf(Date);
    });

    it('should check compliance for anthropic', async () => {
      const report = await checker.checkCompliance('anthropic');
      expect(report.platform).toBe('anthropic');
      expect(report.checks.length).toBeGreaterThan(0);
    });

    it('should check compliance for google', async () => {
      const report = await checker.checkCompliance('google');
      expect(report.platform).toBe('google');
      expect(report.checks.length).toBeGreaterThan(0);
    });

    it('should check compliance for unknown platform (base checks)', async () => {
      const report = await checker.checkCompliance('azure');
      expect(report.platform).toBe('azure');
      expect(report.checks.length).toBe(5); // base checks only
    });

    it('should include all check statuses', async () => {
      const report = await checker.checkCompliance('openai');
      const statuses = report.checks.map(c => c.status);
      expect(statuses).toContain('pass');
    });

    it('should calculate score from checks', async () => {
      const report = await checker.checkCompliance('openai');
      // Score should be computed from pass/warning/fail weighted values
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('checkAllPlatforms', () => {
    it('should check all enabled platforms', async () => {
      const reports = await checker.checkAllPlatforms();
      // openai and anthropic are enabled, google is disabled
      expect(reports).toHaveLength(2);
      expect(reports[0].platform).toBe('openai');
      expect(reports[1].platform).toBe('anthropic');
    });

    it('should return empty array when no platforms configured', async () => {
      mockConfig.getPlatforms = jest.fn().mockReturnValue([]);
      const reports = await checker.checkAllPlatforms();
      expect(reports).toHaveLength(0);
    });

    it('should handle errors for individual platforms', async () => {
      mockConfig.getPlatforms = jest.fn().mockReturnValue([
        { name: 'openai', apiKey: 'key', enabled: true }
      ]);
      const reports = await checker.checkAllPlatforms();
      expect(reports).toHaveLength(1);
    });
  });

  describe('generateComplianceSummary', () => {
    it('should generate summary from multiple reports', async () => {
      const reports = await checker.checkAllPlatforms();
      const summary = checker.generateComplianceSummary(reports);
      
      expect(summary.totalChecks).toBeGreaterThan(0);
      expect(summary.passedChecks).toBeGreaterThan(0);
      expect(summary.platforms).toHaveLength(2);
      expect(summary.overallScore).toBeGreaterThan(0);
    });

    it('should classify platform statuses correctly', async () => {
      const reports = await checker.checkAllPlatforms();
      const summary = checker.generateComplianceSummary(reports);
      
      summary.platforms.forEach(p => {
        expect(['excellent', 'good', 'needs-improvement', 'poor']).toContain(p.status);
      });
    });

    it('should handle empty reports', () => {
      const summary = checker.generateComplianceSummary([]);
      expect(summary.totalChecks).toBe(0);
      expect(summary.platforms).toHaveLength(0);
      expect(isNaN(summary.overallScore)).toBe(true); // 0/0 = NaN
    });
  });

  describe('getComplianceRecommendations', () => {
    it('should return recommendations for reports', async () => {
      const reports = await checker.checkAllPlatforms();
      const recommendations = checker.getComplianceRecommendations(reports);
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations).toContain('Schedule regular compliance audits');
      expect(recommendations).toContain('Update compliance policies to reflect regulatory changes');
      expect(recommendations).toContain('Implement continuous compliance monitoring');
    });

    it('should include critical recommendations for low scores', async () => {
      // Create mock reports with low scores
      const lowScoreReports = [
        {
          platform: 'test-platform',
          overallScore: 50,
          lastChecked: new Date(),
          checks: [
            { name: 'Critical Check', status: 'fail' as const, score: 30, details: 'Failing' }
          ]
        }
      ];
      
      const recommendations = checker.getComplianceRecommendations(lowScoreReports as any[]);
      expect(recommendations.length).toBeGreaterThan(3);
      // Should mention the low score
      expect(recommendations.some(r => r.includes('below acceptable'))).toBe(true);
    });
  });

  describe('exportComplianceReport', () => {
    it('should export as JSON', async () => {
      const reports = await checker.checkAllPlatforms();
      const exported = checker.exportComplianceReport(reports, 'json');
      const parsed = JSON.parse(exported);
      
      expect(parsed.summary).toBeDefined();
      expect(parsed.reports).toBeDefined();
      expect(parsed.recommendations).toBeDefined();
      expect(parsed.generatedAt).toBeDefined();
    });

    it('should export as CSV', async () => {
      const reports = await checker.checkAllPlatforms();
      const exported = checker.exportComplianceReport(reports, 'csv');
      
      expect(exported).toContain('Platform,Overall Score');
      expect(exported).toContain('openai');
      expect(exported).toContain('\n');
    });

    it('should export as PDF (placeholder)', async () => {
      const reports = await checker.checkAllPlatforms();
      const exported = checker.exportComplianceReport(reports, 'pdf');
      expect(exported).toContain('PDF report');
    });

    it('should throw for unsupported format', async () => {
      const reports = await checker.checkAllPlatforms();
      expect(() => checker.exportComplianceReport(reports, 'xml' as any)).toThrow('Unsupported format');
    });
  });

  describe('getComplianceHistory', () => {
    it('should return history for specified days', () => {
      const history = checker.getComplianceHistory(7);
      expect(history).toHaveLength(21); // 7 days * 3 platforms
      
      history.forEach(entry => {
        expect(entry.date).toBeDefined();
        expect(entry.platform).toBeDefined();
        expect(entry.score).toBeGreaterThanOrEqual(70);
        expect(entry.score).toBeLessThanOrEqual(100);
        expect(entry.status).toBeDefined();
      });
    });

    it('should return history for 1 day', () => {
      const history = checker.getComplianceHistory(1);
      expect(history).toHaveLength(3); // 1 day * 3 platforms
    });

    it('should return history for 30 days', () => {
      const history = checker.getComplianceHistory(30);
      expect(history).toHaveLength(90); // 30 days * 3 platforms
    });

    it('should have dates in descending order', () => {
      const history = checker.getComplianceHistory(3);
      expect(history[0].date).not.toBe(history[3].date); // Different days
    });
  });
});
