import { ThreatDetection } from '../types';
import { ConfigManager } from '../utils/config-manager';
export declare class PlatformSecurityChecker {
    private config;
    constructor(config?: ConfigManager);
    checkPlatformSecurity(platform: string): Promise<{
        score: number;
        threats: number;
        incidents: number;
        riskFactors: string[];
        lastUpdated: Date;
    }>;
    detectThreats(platform: string): Promise<ThreatDetection[]>;
    checkCompliance(platform: string): Promise<{
        overallScore: number;
        checks: Array<{
            name: string;
            status: 'pass' | 'fail' | 'warning';
            score: number;
            details: string;
        }>;
        standards: Record<string, number>;
        lastUpdated: Date;
    }>;
    testPlatformConnectivity(platform: string): Promise<{
        success: boolean;
        latency: number;
        responseTime: number;
        error?: string;
    }>;
    getPlatformMetrics(platform: string): Promise<{
        usage: {
            requests: number;
            tokens: number;
            cost: number;
        };
        security: {
            blockedRequests: number;
            flaggedRequests: number;
            threatsDetected: number;
        };
        performance: {
            averageResponseTime: number;
            uptime: number;
            errorRate: number;
        };
        lastUpdated: Date;
    }>;
    private checkPlatformSpecificIssues;
    private shouldDetectThreat;
    private generateThreat;
    private generateThreatId;
    getPlatformHealth(platform: string): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        uptime: number;
        responseTime: number;
        errorRate: number;
        lastChecked: Date;
    }>;
}
//# sourceMappingURL=security-checker.d.ts.map