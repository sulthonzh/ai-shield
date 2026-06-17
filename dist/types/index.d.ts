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
export interface ThreatDetection {
    id: string;
    type: 'prompt-injection' | 'data-leakage' | 'policy-violation' | 'anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    platform: string;
    description: string;
    detectedAt: Date;
    status: 'active' | 'investigating' | 'resolved' | 'false-positive';
    confidence: number;
    evidence: Record<string, any>;
}
export interface ComplianceStatus {
    platform: string;
    overallScore: number;
    checks: {
        name: string;
        status: 'pass' | 'fail' | 'warning';
        score: number;
        details: string;
    }[];
    lastChecked: Date;
}
export interface SecurityIncident {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    platform: string;
    description: string;
    detectedAt: Date;
    status: 'open' | 'investigating' | 'resolved' | 'false-positive';
    affectedSystems: string[];
    responseActions: string[];
    assignedTo?: string;
}
export interface SecurityPosture {
    overallScore: number;
    platforms: {
        name: string;
        score: number;
        threats: number;
        incidents: number;
        lastUpdated: Date;
    }[];
    policies: {
        total: number;
        enabled: number;
        disabled: number;
    };
    threats: {
        active: number;
        resolved: number;
        falsePositives: number;
    };
    lastUpdated: Date;
}
export interface AlertConfig {
    email?: string;
    webhook?: string;
    slack?: string;
    sms?: string;
}
export interface OrganizationConfig {
    name: string;
    departments: Department[];
    alertConfig: AlertConfig;
    securityLevel: 'basic' | 'standard' | 'enhanced' | 'custom';
}
export interface Department {
    id: string;
    name: string;
    users: string[];
    policies: string[];
    accessLevel: 'read' | 'read-write' | 'admin';
}
//# sourceMappingURL=index.d.ts.map