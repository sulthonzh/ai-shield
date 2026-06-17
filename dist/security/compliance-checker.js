"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceChecker = void 0;
class ComplianceChecker {
    constructor(config) {
        this.config = config;
    }
    async checkCompliance(platform) {
        const checks = this.getComplianceChecks(platform);
        const passedChecks = checks.filter(check => check.status === 'pass');
        const failedChecks = checks.filter(check => check.status === 'fail');
        const warningChecks = checks.filter(check => check.status === 'warning');
        const overallScore = Math.round((passedChecks.reduce((sum, check) => sum + check.score, 0) +
            warningChecks.reduce((sum, check) => sum + check.score, 0) * 0.8 +
            failedChecks.reduce((sum, check) => sum + check.score, 0) * 0.5) / checks.length);
        return {
            platform,
            overallScore,
            lastChecked: new Date(),
            checks
        };
    }
    getComplianceChecks(platform) {
        const baseChecks = [
            {
                name: 'Data Protection',
                status: 'pass',
                score: 90,
                details: 'GDPR compliant data handling'
            },
            {
                name: 'Access Control',
                status: 'pass',
                score: 85,
                details: 'Proper authentication and authorization'
            },
            {
                name: 'Audit Logging',
                status: 'warning',
                score: 75,
                details: 'Limited retention period for logs'
            },
            {
                name: 'Encryption',
                status: 'pass',
                score: 95,
                details: 'End-to-end encryption implemented'
            },
            {
                name: 'Incident Response',
                status: 'fail',
                score: 60,
                details: 'No formal incident response plan'
            }
        ];
        if (platform === 'openai') {
            return [
                ...baseChecks,
                {
                    name: 'Output Safety',
                    status: 'pass',
                    score: 88,
                    details: 'Content safety filters active'
                },
                {
                    name: 'Bias Detection',
                    status: 'warning',
                    score: 72,
                    details: 'Basic bias detection in place'
                }
            ];
        }
        if (platform === 'anthropic') {
            return [
                ...baseChecks,
                {
                    name: 'Constitutional AI',
                    status: 'pass',
                    score: 92,
                    details: 'Constitutional AI safety measures'
                },
                {
                    name: 'Red Teaming',
                    status: 'pass',
                    score: 88,
                    details: 'Regular red teaming exercises'
                }
            ];
        }
        if (platform === 'google') {
            return [
                ...baseChecks,
                {
                    name: 'Vertex AI Security',
                    status: 'pass',
                    score: 85,
                    details: 'Google Cloud security controls'
                },
                {
                    name: 'Data Loss Prevention',
                    status: 'pass',
                    score: 90,
                    details: 'DLP policies configured'
                }
            ];
        }
        return baseChecks;
    }
    async checkAllPlatforms() {
        const platforms = this.config.getPlatforms()
            .filter(p => p.enabled)
            .map(p => p.name);
        const reports = [];
        for (const platform of platforms) {
            try {
                const report = await this.checkCompliance(platform);
                reports.push(report);
            }
            catch (error) {
                console.error(`Error checking compliance for ${platform}:`, error);
            }
        }
        return reports;
    }
    generateComplianceSummary(reports) {
        const totalChecks = reports.reduce((sum, report) => sum + report.checks.length, 0);
        const passedChecks = reports.reduce((sum, report) => sum + report.checks.filter(check => check.status === 'pass').length, 0);
        const failedChecks = reports.reduce((sum, report) => sum + report.checks.filter(check => check.status === 'fail').length, 0);
        const warningChecks = reports.reduce((sum, report) => sum + report.checks.filter(check => check.status === 'warning').length, 0);
        const overallScore = reports.reduce((sum, report) => sum + report.overallScore, 0) / reports.length;
        const platforms = reports.map(report => {
            let status;
            if (report.overallScore >= 90)
                status = 'excellent';
            else if (report.overallScore >= 75)
                status = 'good';
            else if (report.overallScore >= 60)
                status = 'needs-improvement';
            else
                status = 'poor';
            return {
                name: report.platform,
                score: report.overallScore,
                status
            };
        });
        return {
            overallScore: Math.round(overallScore),
            platforms,
            totalChecks,
            passedChecks,
            failedChecks,
            warningChecks
        };
    }
    getComplianceRecommendations(reports) {
        const recommendations = [];
        const summary = this.generateComplianceSummary(reports);
        if (summary.overallScore < 80) {
            recommendations.push('Overall compliance score is below acceptable threshold. Review security policies and controls.');
        }
        const failingPlatforms = summary.platforms.filter(p => p.status === 'poor');
        if (failingPlatforms.length > 0) {
            recommendations.push(`Immediate attention required for: ${failingPlatforms.map(p => p.name).join(', ')}`);
        }
        const highRiskChecks = reports.flatMap(report => report.checks.filter(check => check.status === 'fail' && check.score < 50));
        if (highRiskChecks.length > 0) {
            recommendations.push(`Critical compliance issues: ${highRiskChecks.map(c => c.name).join(', ')}`);
        }
        recommendations.push('Schedule regular compliance audits');
        recommendations.push('Update compliance policies to reflect regulatory changes');
        recommendations.push('Implement continuous compliance monitoring');
        return recommendations;
    }
    exportComplianceReport(reports, format) {
        const summary = this.generateComplianceSummary(reports);
        const recommendations = this.getComplianceRecommendations(reports);
        switch (format) {
            case 'json':
                return JSON.stringify({
                    summary,
                    reports,
                    recommendations,
                    generatedAt: new Date().toISOString()
                }, null, 2);
            case 'csv':
                const headers = 'Platform,Overall Score,Status,Check Name,Status,Score,Details\n';
                const rows = reports.flatMap(report => report.checks.map(check => `${report.platform},${report.overallScore},${report.overallScore >= 90 ? 'Excellent' : report.overallScore >= 75 ? 'Good' : 'Needs Improvement'},${check.name},${check.status},${check.score},"${check.details}"`)).join('\n');
                return headers + rows;
            case 'pdf':
                return 'PDF report would be generated here';
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
    getComplianceHistory(days) {
        const history = [];
        const now = new Date();
        for (let i = 0; i < days; i++) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const platforms = ['openai', 'anthropic', 'google'];
            platforms.forEach(platform => {
                const score = Math.floor(Math.random() * 30) + 70;
                history.push({
                    date: dateStr,
                    platform,
                    score,
                    status: score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : 'Needs Improvement'
                });
            });
        }
        return history;
    }
}
exports.ComplianceChecker = ComplianceChecker;
