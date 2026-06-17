import { ConfigManager } from '../utils/config-manager';
import { ComplianceCheck } from '../types';

interface ComplianceReport {
  platform: string;
  overallScore: number;
  lastChecked: Date;
  checks: ComplianceCheck[];
}

export class ComplianceChecker {
  private config: ConfigManager;

  constructor(config: ConfigManager) {
    this.config = config;
  }

  /**
   * Run compliance checks for a specific platform
   */
  async checkCompliance(platform: string): Promise<ComplianceReport> {
    const checks = this.getComplianceChecks(platform);
    const passedChecks = checks.filter(check => check.status === 'pass');
    const failedChecks = checks.filter(check => check.status === 'fail');
    const warningChecks = checks.filter(check => check.status === 'warning');

    const overallScore = Math.round(
      (passedChecks.reduce((sum, check) => sum + check.score, 0) +
       warningChecks.reduce((sum, check) => sum + check.score, 0) * 0.8 +
       failedChecks.reduce((sum, check) => sum + check.score, 0) * 0.5) / checks.length
    );

    return {
      platform,
      overallScore,
      lastChecked: new Date(),
      checks
    };
  }

  /**
   * Get compliance checks for a platform
   */
  private getComplianceChecks(platform: string): ComplianceCheck[] {
    // Mock compliance checks - in real implementation, these would be actual security checks
    const baseChecks = [
      {
        name: 'Data Protection',
        status: 'pass' as const,
        score: 90,
        details: 'GDPR compliant data handling'
      },
      {
        name: 'Access Control',
        status: 'pass' as const,
        score: 85,
        details: 'Proper authentication and authorization'
      },
      {
        name: 'Audit Logging',
        status: 'warning' as const,
        score: 75,
        details: 'Limited retention period for logs'
      },
      {
        name: 'Encryption',
        status: 'pass' as const,
        score: 95,
        details: 'End-to-end encryption implemented'
      },
      {
        name: 'Incident Response',
        status: 'fail' as const,
        score: 60,
        details: 'No formal incident response plan'
      }
    ];

    // Platform-specific checks
    if (platform === 'openai') {
      return [
        ...baseChecks,
        {
          name: 'Output Safety',
          status: 'pass' as const,
          score: 88,
          details: 'Content safety filters active'
        },
        {
          name: 'Bias Detection',
          status: 'warning' as const,
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
          status: 'pass' as const,
          score: 92,
          details: 'Constitutional AI safety measures'
        },
        {
          name: 'Red Teaming',
          status: 'pass' as const,
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
          status: 'pass' as const,
          score: 85,
          details: 'Google Cloud security controls'
        },
        {
          name: 'Data Loss Prevention',
          status: 'pass' as const,
          score: 90,
          details: 'DLP policies configured'
        }
      ];
    }

    return baseChecks;
  }

  /**
   * Check compliance across all platforms
   */
  async checkAllPlatforms(): Promise<ComplianceReport[]> {
    const platforms = this.config.getPlatforms()
      .filter(p => p.enabled)
      .map(p => p.name);

    const reports = [];
    for (const platform of platforms) {
      try {
        const report = await this.checkCompliance(platform);
        reports.push(report);
      } catch (error) {
        console.error(`Error checking compliance for ${platform}:`, error);
      }
    }

    return reports;
  }

  /**
   * Generate compliance summary
   */
  generateComplianceSummary(reports: ComplianceReport[]): {
    overallScore: number;
    platforms: Array<{
      name: string;
      score: number;
      status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    }>;
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warningChecks: number;
  } {
    const totalChecks = reports.reduce((sum, report) => sum + report.checks.length, 0);
    const passedChecks = reports.reduce((sum, report) => 
      sum + report.checks.filter(check => check.status === 'pass').length, 0);
    const failedChecks = reports.reduce((sum, report) => 
      sum + report.checks.filter(check => check.status === 'fail').length, 0);
    const warningChecks = reports.reduce((sum, report) => 
      sum + report.checks.filter(check => check.status === 'warning').length, 0);

    const overallScore = reports.reduce((sum, report) => sum + report.overallScore, 0) / reports.length;

    const platforms = reports.map(report => {
      let status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
      if (report.overallScore >= 90) status = 'excellent';
      else if (report.overallScore >= 75) status = 'good';
      else if (report.overallScore >= 60) status = 'needs-improvement';
      else status = 'poor';

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

  /**
   * Get compliance recommendations
   */
  getComplianceRecommendations(reports: ComplianceReport[]): string[] {
    const recommendations: string[] = [];

    const summary = this.generateComplianceSummary(reports);
    
    if (summary.overallScore < 80) {
      recommendations.push('Overall compliance score is below acceptable threshold. Review security policies and controls.');
    }

    const failingPlatforms = summary.platforms.filter(p => p.status === 'poor');
    if (failingPlatforms.length > 0) {
      recommendations.push(`Immediate attention required for: ${failingPlatforms.map(p => p.name).join(', ')}`);
    }

    const highRiskChecks = reports.flatMap(report => 
      report.checks.filter(check => check.status === 'fail' && check.score < 50)
    );
    
    if (highRiskChecks.length > 0) {
      recommendations.push(`Critical compliance issues: ${highRiskChecks.map(c => c.name).join(', ')}`);
    }

    recommendations.push('Schedule regular compliance audits');
    recommendations.push('Update compliance policies to reflect regulatory changes');
    recommendations.push('Implement continuous compliance monitoring');

    return recommendations;
  }

  /**
   * Export compliance report
   */
  exportComplianceReport(reports: ComplianceReport[], format: 'json' | 'pdf' | 'csv'): string {
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
        const rows = reports.flatMap(report => 
          report.checks.map(check => 
            `${report.platform},${report.overallScore},${report.overallScore >= 90 ? 'Excellent' : report.overallScore >= 75 ? 'Good' : 'Needs Improvement'},${check.name},${check.status},${check.score},"${check.details}"`
          )
        ).join('\n');
        return headers + rows;
      
      case 'pdf':
        // Would use a PDF library to generate formatted report
        return 'PDF report would be generated here';
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Get compliance history
   */
  getComplianceHistory(days: number): Array<{
    date: string;
    platform: string;
    score: number;
    status: string;
  }> {
    const history = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      // Mock history data
      const platforms = ['openai', 'anthropic', 'google'];
      platforms.forEach(platform => {
        const score = Math.floor(Math.random() * 30) + 70; // 70-100
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