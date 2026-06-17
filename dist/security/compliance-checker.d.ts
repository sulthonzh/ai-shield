import { ComplianceStatus } from '../types';
import { ConfigManager } from '../utils/config-manager';
export declare class ComplianceChecker {
    private config;
    constructor(config?: ConfigManager);
    checkPlatformCompliance(platform: string): Promise<ComplianceStatus>;
    runComplianceChecks(platform: string): Promise<Array<{
        name: string;
        status: 'pass' | 'fail' | 'warning';
        score: number;
        details: string;
    }>>;
    private checkAccessControl;
    private checkDataEncryption;
    private checkAuditLogging;
    private checkIncidentResponse;
    private checkSecurityTraining;
    private checkDataGovernance;
    private checkVendorManagement;
    private checkBusinessContinuity;
    checkStandardCompliance(platform: string, standard: string): Promise<{
        standard: string;
        score: number;
        status: 'compliant' | 'partial' | 'non-compliant';
        requirements: Array<{
            requirement: string;
            status: 'pass' | 'fail' | 'warning';
            evidence?: string;
        }>;
        lastUpdated: Date;
    }>;
    private getStandardRequirements;
    private checkStandardRequirement;
    generateComplianceReport(platform: string): Promise<{
        platform: string;
        overallScore: number;
        standards: Record<string, number>;
        criticalFindings: string[];
        recommendations: string[];
        generatedAt: Date;
    }>;
}
//# sourceMappingURL=compliance-checker.d.ts.map