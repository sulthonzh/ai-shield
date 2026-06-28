// Type definitions for AI Shield

export interface ThreatDetection {
  id: string;
  type: 'prompt-injection' | 'data-leakage' | 'policy-violation' | 'hallucination';
  severity: 'low' | 'medium' | 'high' | 'critical';
  platform: string;
  description: string;
  detectedAt: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false-positive';
  confidence: number;
  evidence: Record<string, unknown>;
}

export interface PlatformConfig {
  name: 'openai' | 'anthropic' | 'google' | 'azure';
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rule: string;
  enabled: boolean;
  platform: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationConfig {
  name: string;
  departments: string[];
  alertConfig: Record<string, unknown>;
  securityLevel: 'basic' | 'standard' | 'advanced';
}

export interface SecurityPosture {
  overallScore: number;
  platforms: PlatformStatus[];
  policies: PolicyStatus;
  threats: ThreatStats;
  lastUpdated: Date;
}

export interface PlatformStatus {
  name: string;
  score: number;
  threats: number;
  incidents: number;
  lastUpdated: Date;
}

export interface PolicyStatus {
  total: number;
  enabled: number;
  disabled: number;
}

export interface ThreatStats {
  active: number;
  resolved: number;
  falsePositives: number;
}

export interface ComplianceCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  score: number;
  details: string;
}

export interface ComplianceReport {
  platform: string;
  overallScore: number;
  lastChecked: Date;
  checks: ComplianceCheck[];
}

export interface SecurityAlert {
  id: string;
  platform: string;
  threat: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  metadata: Record<string, unknown>;
}