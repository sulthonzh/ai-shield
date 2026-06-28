import { SecurityAnalyzer } from '../security/analyzer';
import { ThreatDetection, PlatformStatus } from '../types';

describe('SecurityAnalyzer', () => {
  let analyzer: SecurityAnalyzer;

  beforeEach(() => {
    analyzer = new SecurityAnalyzer();
  });

  const mockThreats: ThreatDetection[] = [
    {
      id: 't1',
      type: 'prompt-injection',
      severity: 'high',
      platform: 'openai',
      description: 'Test threat 1',
      detectedAt: new Date('2026-06-01'),
      status: 'resolved',
      confidence: 0.9,
      evidence: { source: 'test' },
    },
    {
      id: 't2',
      type: 'data-leakage',
      severity: 'critical',
      platform: 'anthropic',
      description: 'Test threat 2',
      detectedAt: new Date('2026-06-02'),
      status: 'active',
      confidence: 0.85,
      evidence: { source: 'test' },
    },
    {
      id: 't3',
      type: 'prompt-injection',
      severity: 'medium',
      platform: 'openai',
      description: 'Test threat 3',
      detectedAt: new Date('2026-06-03'),
      status: 'resolved',
      confidence: 0.75,
      evidence: {},
    },
  ];

  describe('analyzeThreatPatterns', () => {
    it('should return patterns, trends, and recommendations', () => {
      const result = analyzer.analyzeThreatPatterns(mockThreats);
      expect(result).toHaveProperty('patterns');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.patterns)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should handle empty threats array', () => {
      const result = analyzer.analyzeThreatPatterns([]);
      expect(result.patterns).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.trends).toBeDefined();
    });
  });

  describe('analyzeTrends', () => {
    it('should return trend analysis with correct shape', () => {
      const trends = analyzer.analyzeTrends(mockThreats);
      expect(trends).toHaveProperty('volumeTrend');
      expect(trends).toHaveProperty('severityTrend');
      expect(trends).toHaveProperty('platformDistribution');
      expect(trends).toHaveProperty('typeDistribution');
    });

    it('should compute platform distribution', () => {
      const trends = analyzer.analyzeTrends(mockThreats);
      expect(trends.platformDistribution).toBeDefined();
      expect(typeof trends.platformDistribution).toBe('object');
    });

    it('should compute type distribution', () => {
      const trends = analyzer.analyzeTrends(mockThreats);
      expect(trends.typeDistribution).toBeDefined();
      expect(typeof trends.typeDistribution).toBe('object');
    });
  });

  describe('generateSecurityPosture', () => {
    it('should return posture assessment', () => {
      const platforms: PlatformStatus[] = [
        { name: 'openai', score: 85, threats: 2, incidents: 1, lastUpdated: new Date() },
        { name: 'anthropic', score: 92, threats: 0, incidents: 0, lastUpdated: new Date() },
      ];
      const result = analyzer.generateSecurityPosture(platforms);
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('riskLevel');
      expect(typeof result.overallScore).toBe('number');
    });

    it('should handle empty platforms', () => {
      const result = analyzer.generateSecurityPosture([]);
      expect(result.overallScore).toBe(0);
    });
  });

  describe('calculateIncidentResponseTime', () => {
    it('should calculate response times for resolved threats', () => {
      const result = analyzer.calculateIncidentResponseTime(mockThreats);
      expect(result).toHaveProperty('averageTime');
      expect(result).toHaveProperty('medianTime');
      expect(result).toHaveProperty('minTime');
      expect(result).toHaveProperty('maxTime');
      expect(typeof result.averageTime).toBe('number');
    });

    it('should return zeros for no resolved threats', () => {
      const activeOnly = mockThreats.filter(t => t.status === 'active');
      const result = analyzer.calculateIncidentResponseTime(activeOnly);
      expect(result.averageTime).toBe(0);
      expect(result.medianTime).toBe(0);
    });
  });

  describe('getHistoricalData', () => {
    it('should return historical data object', () => {
      const result = analyzer.getHistoricalData(7);
      expect(result).toHaveProperty('threats');
      expect(result).toHaveProperty('incidents');
      expect(result).toHaveProperty('compliance');
      expect(Array.isArray(result.threats)).toBe(true);
    });
  });

  describe('exportAnalysis', () => {
    it('should export as JSON string', () => {
      const result = analyzer.exportAnalysis(mockThreats, 'json');
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('analysis');
    });

    it('should export as CSV string', () => {
      const result = analyzer.exportAnalysis(mockThreats, 'csv');
      expect(typeof result).toBe('string');
      expect(result).toContain(',');
    });
  });
});
