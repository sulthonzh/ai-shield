import { ThreatDetection, PlatformConfig, SecurityPolicy, SecurityPosture } from '../types';

describe('Type Definitions', () => {
  describe('ThreatDetection', () => {
    it('should create a valid ThreatDetection object', () => {
      const threat: ThreatDetection = {
        id: 't1',
        type: 'prompt-injection',
        severity: 'high',
        platform: 'openai',
        description: 'Test threat',
        detectedAt: new Date(),
        status: 'active',
        confidence: 0.9,
        evidence: { source: 'test' },
      };
      expect(threat.id).toBe('t1');
      expect(threat.type).toBe('prompt-injection');
      expect(threat.severity).toBe('high');
    });

    it('should support all threat types', () => {
      const types: ThreatDetection['type'][] = [
        'prompt-injection',
        'data-leakage',
        'policy-violation',
        'hallucination',
      ];
      types.forEach(type => {
        const threat: ThreatDetection = {
          id: 't',
          type,
          severity: 'low',
          platform: 'test',
          description: '',
          detectedAt: new Date(),
          status: 'active',
          confidence: 0.5,
          evidence: {},
        };
        expect(threat.type).toBe(type);
      });
    });

    it('should support all severity levels', () => {
      const severities: ThreatDetection['severity'][] = ['low', 'medium', 'high', 'critical'];
      severities.forEach(severity => {
        const threat: ThreatDetection = {
          id: 't',
          type: 'prompt-injection',
          severity,
          platform: 'test',
          description: '',
          detectedAt: new Date(),
          status: 'active',
          confidence: 0.5,
          evidence: {},
        };
        expect(threat.severity).toBe(severity);
      });
    });

    it('should support all status values', () => {
      const statuses: ThreatDetection['status'][] = [
        'active',
        'investigating',
        'resolved',
        'false-positive',
      ];
      statuses.forEach(status => {
        const threat: ThreatDetection = {
          id: 't',
          type: 'prompt-injection',
          severity: 'low',
          platform: 'test',
          description: '',
          detectedAt: new Date(),
          status,
          confidence: 0.5,
          evidence: {},
        };
        expect(threat.status).toBe(status);
      });
    });
  });

  describe('PlatformConfig', () => {
    it('should create a valid PlatformConfig object', () => {
      const config: PlatformConfig = {
        name: 'openai',
        apiKey: 'sk-test',
        enabled: true,
      };
      expect(config.name).toBe('openai');
      expect(config.apiKey).toBe('sk-test');
    });

    it('should support optional baseUrl', () => {
      const config: PlatformConfig = {
        name: 'azure',
        apiKey: 'key',
        baseUrl: 'https://custom.api.com',
        enabled: true,
      };
      expect(config.baseUrl).toBe('https://custom.api.com');
    });

    it('should support all platform names', () => {
      const names: PlatformConfig['name'][] = ['openai', 'anthropic', 'google', 'azure'];
      names.forEach(name => {
        const config: PlatformConfig = {
          name,
          apiKey: 'key',
          enabled: true,
        };
        expect(config.name).toBe(name);
      });
    });
  });

  describe('SecurityPolicy', () => {
    it('should create a valid SecurityPolicy object', () => {
      const policy: SecurityPolicy = {
        id: 'p1',
        name: 'Test Policy',
        description: 'A test policy',
        severity: 'high',
        enabled: true,
        rule: 'block-secrets',
        platform: ['openai'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(policy.id).toBe('p1');
      expect(policy.enabled).toBe(true);
    });
  });

  describe('SecurityPosture', () => {
    it('should create a valid SecurityPosture object', () => {
      const posture: SecurityPosture = {
        overallScore: 85,
        platforms: [],
        threats: { active: 0, resolved: 0, falsePositives: 0 },
        policies: { total: 0, enabled: 0, disabled: 0 },
        lastUpdated: new Date(),
      };
      expect(posture.overallScore).toBe(85);
    });
  });
});
