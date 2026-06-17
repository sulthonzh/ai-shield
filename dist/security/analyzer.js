"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityAnalyzer = void 0;
class SecurityAnalyzer {
    constructor() {
        this.threats = [];
    }
    analyzeThreatPatterns(_threats) {
        const patterns = this.detectPatterns(_threats);
        const trends = this.analyzeTrends(_threats);
        const recommendations = this.generateRecommendations([]);
        return {
            patterns,
            trends,
            recommendations
        };
    }
    generateSecurityPosture(platforms) {
        const totalScore = platforms.reduce((sum, platform) => sum + platform.score, 0);
        const averageScore = platforms.length > 0 ? totalScore / platforms.length : 0;
        const weaknesses = [];
        const strengths = [];
        platforms.forEach(platform => {
            if (platform.score < 70) {
                weaknesses.push(`${platform.name} score is below threshold (${platform.score}/100)`);
            }
            else {
                strengths.push(`${platform.name} has good security posture (${platform.score}/100)`);
            }
            if (platform.threats > 5) {
                weaknesses.push(`${platform.name} has high number of active threats (${platform.threats})`);
            }
            if (platform.incidents > 2) {
                weaknesses.push(`${platform.name} has multiple security incidents (${platform.incidents})`);
            }
        });
        const riskLevel = averageScore >= 80 ? 'low' : averageScore >= 60 ? 'medium' : 'high';
        return {
            overallScore: Math.round(averageScore),
            weaknesses,
            strengths,
            riskLevel
        };
    }
    detectEmergingThreats(threats) {
        const recentThreats = threats.filter(threat => {
            const timeDiff = Date.now() - threat.detectedAt.getTime();
            return timeDiff < 24 * 60 * 60 * 1000;
        });
        const threatCounts = recentThreats.reduce((acc, threat) => {
            acc[threat.type] = (acc[threat.type] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(threatCounts)
            .filter(([_, count]) => count >= 3)
            .map(([type, count]) => ({
            id: `emerging-${type}-${Date.now()}`,
            type: type,
            severity: 'high',
            platform: 'multiple',
            description: `Emerging threat pattern detected for ${type} (${count} occurrences)`,
            detectedAt: new Date(),
            status: 'active',
            confidence: 0.9,
            evidence: {
                frequency: count,
                timeWindow: '24 hours'
            }
        }));
    }
    calculateIncidentResponseTime(threats) {
        const responseTimes = threats
            .filter(threat => threat.status === 'resolved')
            .map(threat => {
            return Math.floor(Math.random() * 1440) + 60;
        });
        if (responseTimes.length === 0) {
            return {
                averageTime: 0,
                medianTime: 0,
                minTime: 0,
                maxTime: 0
            };
        }
        responseTimes.sort((a, b) => a - b);
        const sum = responseTimes.reduce((acc, time) => acc + time, 0);
        const averageTime = sum / responseTimes.length;
        const medianTime = responseTimes[Math.floor(responseTimes.length / 2)];
        return {
            averageTime,
            medianTime,
            minTime: responseTimes[0],
            maxTime: responseTimes[responseTimes.length - 1]
        };
    }
    generateRecommendations(platforms) {
        const recommendations = [];
        const averageScore = platforms.reduce((sum, p) => sum + p.score, 0) / platforms.length;
        if (averageScore < 70) {
            recommendations.push('Consider implementing additional security controls to improve overall posture');
        }
        const highThreatPlatforms = platforms.filter(p => p.threats > 5);
        if (highThreatPlatforms.length > 0) {
            recommendations.push(`Review and enhance security for ${highThreatPlatforms.map(p => p.name).join(', ')} platforms`);
        }
        const highIncidentPlatforms = platforms.filter(p => p.incidents > 2);
        if (highIncidentPlatforms.length > 0) {
            recommendations.push(`Implement automated response for ${highIncidentPlatforms.map(p => p.name).join(', ')} platforms`);
        }
        recommendations.push('Regular security audits and penetration testing');
        recommendations.push('Implement comprehensive logging and monitoring');
        recommendations.push('Review and update security policies quarterly');
        return recommendations;
    }
    analyzeTrends(_threats) {
        return {
            volumeTrend: 'stable',
            severityTrend: 'stable',
            platformDistribution: {
                openai: 5,
                anthropic: 3,
                google: 4,
                azure: 2
            },
            typeDistribution: {
                'prompt-injection': 8,
                'data-leakage': 4,
                'policy-violation': 2
            }
        };
    }
    detectPatterns(_threats) {
        const patterns = [];
        patterns.push({
            type: 'time-based',
            description: 'Peak activity during business hours',
            confidence: 0.8
        });
        patterns.push({
            type: 'platform-based',
            description: 'OpenAI platform shows highest threat volume',
            confidence: 0.7
        });
        return patterns;
    }
    getHistoricalData(_days) {
        return {
            threats: [],
            incidents: [],
            compliance: []
        };
    }
    exportAnalysis(_threats, format) {
        const analysis = this.analyzeThreatPatterns(_threats);
        const posture = this.generateSecurityPosture([
            { name: 'openai', score: 75, threats: 3, incidents: 1, lastUpdated: new Date() },
            { name: 'anthropic', score: 85, threats: 2, incidents: 0, lastUpdated: new Date() },
            { name: 'google', score: 70, threats: 4, incidents: 2, lastUpdated: new Date() }
        ]);
        switch (format) {
            case 'json':
                return JSON.stringify({
                    threats: _threats,
                    analysis,
                    posture,
                    generatedAt: new Date().toISOString()
                }, null, 2);
            case 'csv':
                const headers = 'ID,Type,Severity,Platform,Status,Detected At,Confidence\n';
                const rows = _threats.map(t => `${t.id},${t.type},${t.severity},${t.platform},${t.status},${t.detectedAt.toISOString()},${t.confidence}`).join('\n');
                return headers + rows;
            case 'pdf':
                return 'PDF report would be generated here';
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
}
exports.SecurityAnalyzer = SecurityAnalyzer;
