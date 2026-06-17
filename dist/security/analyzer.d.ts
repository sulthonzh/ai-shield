import { SecurityPosture, ThreatDetection } from '../types';
import { ConfigManager } from '../utils/config-manager';
export declare class SecurityAnalyzer {
    private config;
    constructor(config?: ConfigManager);
    analyzeSecurityPosture(platforms: string[]): Promise<SecurityPosture>;
    analyzePlatformSecurity(platform: string): Promise<{
        overallScore: number;
        threats: number;
        incidents: number;
        policyCompliance: number;
        riskFactors: string[];
        recommendations: string[];
    }>;
    detectThreats(platform: string): Promise<ThreatDetection[]>;
    private shouldDetectThreat;
    private generateThreat;
    private generateThreatId;
    analyzeThreatPatterns(threats: ThreatDetection[]): Promise<{
        totalThreats: number;
        byType: Record<string, number>;
        bySeverity: Record<string, number>;
        byPlatform: Record<string, number>;
        trendingUp: boolean;
        recommendations: string[];
    }>;
    getSecurityRecommendations(posture: SecurityPosture): Promise<string[]>;
    calculateRiskScore(posture: SecurityPosture): number;
}
//# sourceMappingURL=analyzer.d.ts.map