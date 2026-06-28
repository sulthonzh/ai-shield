import { PlatformConfig, SecurityPolicy, OrganizationConfig, SecurityPosture, ThreatDetection } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigManager {
  private configPath: string;
  private config: {
    platforms: PlatformConfig[];
    policies: SecurityPolicy[];
    organization: OrganizationConfig;
  };

  constructor() {
    this.configPath = path.join(process.cwd(), 'ai-shield-config.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): {
    platforms: PlatformConfig[];
    policies: SecurityPolicy[];
    organization: OrganizationConfig;
  } {
    const defaultConfig = {
      platforms: [],
      policies: [
        {
          id: 'prompt-injection-detection',
          name: 'Prompt Injection Detection',
          description: 'Detects attempts to manipulate AI systems through prompt injection',
          rule: 'Detect patterns like "ignore previous instructions", "disregard safety measures"',
          enabled: true,
          platform: ['openai', 'anthropic', 'google', 'azure'],
          severity: 'high' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'data-leakage-prevention',
          name: 'Data Leakage Prevention',
          description: 'Prevents sensitive data from being leaked in AI responses',
          rule: 'Detect PII, confidential information, and restricted data patterns',
          enabled: true,
          platform: ['openai', 'anthropic', 'google', 'azure'],
          severity: 'critical' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'pii-detection',
          name: 'PII Detection',
          description: 'Detects personally identifiable information in prompts and responses',
          rule: 'Detect names, emails, phone numbers, addresses, and other PII patterns',
          enabled: true,
          platform: ['openai', 'anthropic', 'google', 'azure'],
          severity: 'high' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'hallucination-detection',
          name: 'Hallucination Detection',
          description: 'Detects AI hallucinations and factual inaccuracies',
          rule: 'Cross-reference claims with trusted knowledge sources',
          enabled: true,
          platform: ['openai', 'anthropic', 'google', 'azure'],
          severity: 'medium' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      organization: {
        name: 'Default Organization',
        departments: [],
        alertConfig: {},
        securityLevel: 'standard' as const
      }
    };

    try {
      if (fs.existsSync(this.configPath)) {
        const savedConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        
        // Convert date strings back to Date objects
        savedConfig.policies = savedConfig.policies.map((policy: Record<string, unknown>) => ({
          ...policy,
          createdAt: new Date(policy.createdAt as string),
          updatedAt: new Date(policy.updatedAt as string)
        }));
        
        return { ...defaultConfig, ...savedConfig };
      }
    } catch (error) {
      console.warn('Error loading config, using defaults:', error instanceof Error ? error.message : 'Unknown error');
    }

    return defaultConfig;
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Platform management
  getPlatforms(): PlatformConfig[] {
    return this.config.platforms;
  }

  getPlatform(name: string): PlatformConfig | undefined {
    return this.config.platforms.find(p => p.name === name);
  }

  addPlatform(config: PlatformConfig): void {
    const existingIndex = this.config.platforms.findIndex(p => p.name === config.name);
    
    if (existingIndex >= 0) {
      this.config.platforms[existingIndex] = config;
    } else {
      this.config.platforms.push(config);
    }
    
    this.saveConfig();
  }

  removePlatform(name: string): boolean {
    const initialLength = this.config.platforms.length;
    this.config.platforms = this.config.platforms.filter(p => p.name !== name);
    
    if (this.config.platforms.length < initialLength) {
      this.saveConfig();
      return true;
    }
    
    return false;
  }

  togglePlatform(name: string, enabled: boolean): void {
    const platform = this.getPlatform(name);
    if (platform) {
      platform.enabled = enabled;
      this.saveConfig();
    }
  }

  // Policy management
  getPolicies(): SecurityPolicy[] {
    return this.config.policies;
  }

  getPolicy(id: string): SecurityPolicy | undefined {
    return this.config.policies.find(p => p.id === id);
  }

  addPolicy(policy: SecurityPolicy): void {
    policy.updatedAt = new Date();
    this.config.policies.push(policy);
    this.saveConfig();
  }

  updatePolicy(id: string, updates: Partial<SecurityPolicy>): boolean {
    const index = this.config.policies.findIndex(p => p.id === id);
    if (index >= 0) {
      this.config.policies[index] = {
        ...this.config.policies[index],
        ...updates,
        updatedAt: new Date()
      };
      this.saveConfig();
      return true;
    }
    return false;
  }

  removePolicy(id: string): boolean {
    const initialLength = this.config.policies.length;
    this.config.policies = this.config.policies.filter(p => p.id !== id);
    
    if (this.config.policies.length < initialLength) {
      this.saveConfig();
      return true;
    }
    
    return false;
  }

  enablePolicy(id: string): boolean {
    return this.updatePolicy(id, { enabled: true });
  }

  disablePolicy(id: string): boolean {
    return this.updatePolicy(id, { enabled: false });
  }

  // Validation
  validatePlatformConfig(config: PlatformConfig): string[] {
    const errors: string[] = [];

    if (!config.name || !['openai', 'anthropic', 'google', 'azure'].includes(config.name)) {
      errors.push('Invalid platform name');
    }

    if (!config.apiKey || config.apiKey.trim() === '') {
      errors.push('API key is required');
    }

    if (config.baseUrl && !config.baseUrl.startsWith('http')) {
      errors.push('Base URL must start with http:// or https://');
    }

    return errors;
  }

  validatePolicy(policy: SecurityPolicy): string[] {
    const errors: string[] = [];

    if (!policy.id || policy.id.trim() === '') {
      errors.push('Policy ID is required');
    }

    if (!policy.name || policy.name.trim() === '') {
      errors.push('Policy name is required');
    }

    if (!policy.rule || policy.rule.trim() === '') {
      errors.push('Policy rule is required');
    }

    if (!['low', 'medium', 'high', 'critical'].includes(policy.severity)) {
      errors.push('Invalid severity level');
    }

    if (!policy.platform || policy.platform.length === 0) {
      errors.push('At least one platform must be specified');
    }

    policy.platform.forEach(platform => {
      if (!['openai', 'anthropic', 'google', 'azure'].includes(platform)) {
        errors.push(`Invalid platform: ${platform}`);
      }
    });

    return errors;
  }

  // Configuration reset
  reset(): void {
    this.config = this.loadConfig();
    this.saveConfig();
  }

  // Export/Import
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson: string): boolean {
    try {
      const imported = JSON.parse(configJson);
      this.config = { ...this.loadConfig(), ...imported };
      this.saveConfig();
      return true;
    } catch (error) {
      console.error('Error importing config:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // Security posture calculation
  calculateSecurityPosture(): SecurityPosture {
    const platforms = this.getPlatforms();
    const enabledPolicies = this.getPolicies().filter(p => p.enabled);

    let totalScore = 0;
    const platformScores: { name: string; score: number; threats: number; incidents: number; lastUpdated: Date; }[] = [];

    platforms.forEach(platform => {
      if (platform.enabled) {
        // Mock scores for demonstration
        const score = Math.floor(Math.random() * 30) + 70; // 70-100
        totalScore += score;
        
        platformScores.push({
          name: platform.name,
          score,
          threats: Math.floor(Math.random() * 5), // 0-4 threats
          incidents: Math.floor(Math.random() * 2), // 0-1 incidents
          lastUpdated: new Date()
        });
      } else {
        platformScores.push({
          name: platform.name,
          score: 0,
          threats: 0,
          incidents: 0,
          lastUpdated: new Date()
        });
      }
    });

    const averageScore = platforms.length > 0 ? Math.round(totalScore / platforms.length) : 0;

    return {
      overallScore: averageScore,
      platforms: platformScores,
      policies: {
        total: this.getPolicies().length,
        enabled: enabledPolicies.length,
        disabled: this.getPolicies().length - enabledPolicies.length
      },
      threats: {
        active: Math.floor(Math.random() * 15), // 0-14 active threats
        resolved: Math.floor(Math.random() * 30), // 0-29 resolved threats
        falsePositives: Math.floor(Math.random() * 5) // 0-4 false positives
      },
      lastUpdated: new Date()
    };
  }

  // Mock threat detection for testing
  async detectThreats(options: {
    platform?: string;
    type?: string;
    severity?: string;
  }): Promise<ThreatDetection[]> {
    // Mock threat detection - in real implementation, this would call actual APIs
    const mockThreats: ThreatDetection[] = [
      {
        id: 'threat-001',
        type: 'prompt-injection',
        severity: 'high',
        platform: options.platform || 'openai',
        description: 'Potential prompt injection attempt detected',
        detectedAt: new Date(),
        status: 'active',
        confidence: 0.85,
        evidence: {
          pattern: 'ignore previous instructions',
          context: 'User prompt contains suspicious sequence'
        }
      },
      {
        id: 'threat-002',
        type: 'data-leakage',
        severity: 'medium',
        platform: options.platform || 'google',
        description: 'Sensitive data pattern detected in response',
        detectedAt: new Date(),
        status: 'active',
        confidence: 0.72,
        evidence: {
          data_type: 'PII',
          confidence_score: 0.72
        }
      }
    ];

    // Filter threats based on options
    if (options.type) {
      return mockThreats.filter(t => t.type === options.type);
    }
    if (options.severity) {
      return mockThreats.filter(t => t.severity === options.severity);
    }
    if (options.platform) {
      return mockThreats.filter(t => t.platform === options.platform);
    }

    return mockThreats;
  }

  // File utility methods
  getConfigPath(): string {
    return this.configPath;
  }

  configExists(): boolean {
    return fs.existsSync(this.configPath);
  }

  deleteConfig(): boolean {
    try {
      if (fs.existsSync(this.configPath)) {
        fs.unlinkSync(this.configPath);
        return true;
      }
    } catch (error) {
      console.error('Error deleting config:', error instanceof Error ? error.message : 'Unknown error');
    }
    return false;
  }
}