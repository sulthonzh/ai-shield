import { SecurityAnalyzer } from '../security/analyzer';
import { ThreatDetection, PlatformStatus } from '../types';

describe('SecurityAnalyzer Extended', () => {
  let analyzer: SecurityAnalyzer;

  beforeEach(() => {
    analyzer = new SecurityAnalyzer();
  });

  const mockThreats: ThreatDetection[] = [
    {
      id: 't1', type: 'prompt-injection', severity: 'high', platform: 'openai',
      description: 'Test 1', detectedAt: new Date(), status: 'resolved',
      confidence: 0.9, evidence: { source: 'test' },
    },
    {
      id: 't2', type: 'data-leakage', severity: 'critical', platform: 'anthropic',
      description: 'Test 2', detectedAt: new Date(), status: 'active',
      confidence: 0.85, evidence: {},
    },
    {
      id: 't3', type: 'prompt-injection', severity: 'medium', platform: 'openai',
      description: 'Test 3', detectedAt: new Date(), status: 'resolved',
      confidence: 0.75, evidence: {},
    },
  ];

  describe('detectEmergingThreats', () => {
    it('should detect threats with 3+ occurrences in 24h', () => {
      const recentThreats: ThreatDetection[] = [
        { id: 'r1', type: 'prompt-injection', severity: 'high', platform: 'openai',
          description: 'R1', detectedAt: new Date(), status: 'active', confidence: 0.9, evidence: {} },
        { id: 'r2', type: 'prompt-injection', severity: 'high', platform: 'openai',
          description: 'R2', detectedAt: new Date(), status: 'active', confidence: 0.9, evidence: {} },
        { id: 'r3', type: 'prompt-injection', severity: 'high', platform: 'openai',
          description: 'R3', detectedAt: new Date(), status: 'active', confidence: 0.9, evidence: {} },
      ];
      const emerging = analyzer.detectEmergingThreats(recentThreats);
      expect(emerging.length).toBeGreaterThanOrEqual(1);
      expect(emerging[0].type).toBe('prompt-injection');
      expect(emerging[0].severity).toBe('high');
      expect(emerging[0].confidence).toBe(0.9);
    });

    it('should not detect threats with fewer than 3 occurrences', () => {
      const recentThreats: ThreatDetection[] = [
        { id: 'r1', type: 'data-leakage', severity: 'high', platform: 'openai',
          description: 'R1', detectedAt: new Date(), status: 'active', confidence: 0.9, evidence: {} },
        { id: 'r2', type: 'data-leakage', severity: 'high', platform: 'openai',
          description: 'R2', detectedAt: new Date(), status: 'active', confidence: 0.9, evidence: {} },
      ];
      const emerging = analyzer.detectEmergingThreats(recentThreats);
      expect(emerging).toEqual([]);
    });

    it('should filter out threats older than 24 hours', () => {
      const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const oldThreats: ThreatDetection[] = [
        { id: 'o1', type: 'policy-violation', severity: 'high', platform: 'openai',
          description: 'O1', detectedAt: oldDate, status: 'active', confidence: 0.9, evidence: {} },
        { id: 'o2', type: 'policy-violation', severity: 'high', platform: 'openai',
          description: 'O2', detectedAt: oldDate, status: 'active', confidence: 0.9, evidence: {} },
        { id: 'o3', type: 'policy-violation', severity: 'high', platform: 'openai',
          description: 'O3', detectedAt: oldDate, status: 'active', confidence: 0.9, evidence: {} },
      ];
      const emerging = analyzer.detectEmergingThreats(oldThreats);
      expect(emerging).toEqual([]);
    });

    it('should return empty for empty input', () => {
      expect(analyzer.detectEmergingThreats([])).toEqual([]);
    });
  });

  describe('generateRecommendations', () => {
    it('should recommend controls for low scores', () => {
      const platforms: PlatformStatus[] = [
        { name: 'openai', score: 50, threats: 1, incidents: 0, lastUpdated: new Date() },
        { name: 'anthropic', score: 60, threats: 1, incidents: 0, lastUpdated: new Date() },
      ];
      const recs = analyzer.generateRecommendations(platforms);
      expect(recs).toContain('Consider implementing additional security controls to improve overall posture');
    });

    it('should flag high-threat platforms', () => {
      const platforms: PlatformStatus[] = [
        { name: 'openai', score: 90, threats: 10, incidents: 0, lastUpdated: new Date() },
      ];
      const recs = analyzer.generateRecommendations(platforms);
      expect(recs.some(r => r.includes('openai'))).toBe(true);
    });

    it('should flag high-incident platforms', () => {
      const platforms: PlatformStatus[] = [
        { name: 'google', score: 90, threats: 1, incidents: 5, lastUpdated: new Date() },
      ];
      const recs = analyzer.generateRecommendations(platforms);
      expect(recs.some(r => r.includes('google'))).toBe(true);
    });

    it('should always include general recommendations', () => {
      const recs = analyzer.generateRecommendations([]);
      expect(recs).toContain('Regular security audits and penetration testing');
      expect(recs).toContain('Implement comprehensive logging and monitoring');
      expect(recs).toContain('Review and update security policies quarterly');
    });

    it('should not recommend controls when scores are high', () => {
      const platforms: PlatformStatus[] = [
        { name: 'openai', score: 95, threats: 0, incidents: 0, lastUpdated: new Date() },
      ];
      const recs = analyzer.generateRecommendations(platforms);
      expect(recs).not.toContain('Consider implementing additional security controls to improve overall posture');
    });
  });

  describe('generateSecurityPosture - edge cases', () => {
    it('should identify weaknesses for low-score platforms', () => {
      const platforms: PlatformStatus[] = [
        { name: 'openai', score: 50, threats: 2, incidents: 1, lastUpdated: new Date() },
      ];
      const result = analyzer.generateSecurityPosture(platforms);
      expect(result.weaknesses.some(w => w.includes('below threshold'))).toBe(true);
      expect(result.riskLevel).toBe('high');
    });

    it('should identify strengths for high-score platforms', () => {
      const platforms: PlatformStatus[] = [
        { name: 'openai', score: 95, threats: 0, incidents: 0, lastUpdated: new Date() },
      ];
      const result = analyzer.generateSecurityPosture(platforms);
      expect(result.strengths.some(s => s.includes('good security posture'))).toBe(true);
      expect(result.riskLevel).toBe('low');
    });

    it('should flag high threats as weakness', () => {
      const platforms: PlatformStatus[] = [
        { name: 'openai', score: 85, threats: 10, incidents: 1, lastUpdated: new Date() },
      ];
      const result = analyzer.generateSecurityPosture(platforms);
      expect(result.weaknesses.some(w => w.includes('high number of active threats'))).toBe(true);
    });

    it('should flag multiple incidents as weakness', () => {
      const platforms: PlatformStatus[] = [
        { name: 'openai', score: 85, threats: 1, incidents: 5, lastUpdated: new Date() },
      ];
      const result = analyzer.generateSecurityPosture(platforms);
      expect(result.weaknesses.some(w => w.includes('multiple security incidents'))).toBe(true);
    });

    it('should return medium risk for average score 60-79', () => {
      const platforms: PlatformStatus[] = [
        { name: 'openai', score: 65, threats: 0, incidents: 0, lastUpdated: new Date() },
        { name: 'anthropic', score: 70, threats: 0, incidents: 0, lastUpdated: new Date() },
      ];
      const result = analyzer.generateSecurityPosture(platforms);
      expect(result.riskLevel).toBe('medium');
    });
  });

  describe('calculateIncidentResponseTime', () => {
    it('should calculate stats for multiple resolved threats', () => {
      const threats: ThreatDetection[] = Array.from({ length: 5 }, (_, i) => ({
        id: `t${i}`, type: 'prompt-injection', severity: 'high', platform: 'openai',
        description: 'test', detectedAt: new Date(), status: 'resolved' as const,
        confidence: 0.9, evidence: {},
      }));
      const result = analyzer.calculateIncidentResponseTime(threats);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.minTime).toBeLessThanOrEqual(result.maxTime);
      expect(result.medianTime).toBeGreaterThanOrEqual(result.minTime);
    });
  });

  describe('exportAnalysis', () => {
    it('should export as PDF placeholder', () => {
      const result = analyzer.exportAnalysis(mockThreats, 'pdf');
      expect(typeof result).toBe('string');
      expect(result).toContain('PDF');
    });

    it('should include threats in JSON export', () => {
      const result = analyzer.exportAnalysis(mockThreats, 'json');
      const parsed = JSON.parse(result);
      expect(parsed.threats).toHaveLength(3);
      expect(parsed).toHaveProperty('posture');
    });

    it('should include headers in CSV export', () => {
      const result = analyzer.exportAnalysis(mockThreats, 'csv');
      expect(result).toContain('ID,Type,Severity,Platform,Status');
      expect(result).toContain('t1,prompt-injection');
    });
  });

  describe('analyzeThreatPatterns - full result', () => {
    it('should return patterns with confidence scores', () => {
      const result = analyzer.analyzeThreatPatterns(mockThreats);
      expect(result.patterns.length).toBeGreaterThan(0);
      result.patterns.forEach(p => {
        expect(p).toHaveProperty('type');
        expect(p).toHaveProperty('description');
        expect(p).toHaveProperty('confidence');
        expect(p.confidence).toBeGreaterThan(0);
      });
    });

    it('should return trends with all required keys', () => {
      const result = analyzer.analyzeThreatPatterns(mockThreats);
      expect(result.trends).toHaveProperty('volumeTrend');
      expect(result.trends).toHaveProperty('severityTrend');
      expect(['increasing', 'decreasing', 'stable']).toContain(result.trends.volumeTrend);
      expect(['increasing', 'decreasing', 'stable']).toContain(result.trends.severityTrend);
    });
  });
});
