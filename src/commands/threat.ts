#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigManager } from '../utils/config-manager';
import { ThreatDetection } from '../types';

const program = new Command();

program
  .name('threat')
  .description('Manage threat detection and response')
  .version('1.0.0');

// Detect threats
program
  .command('detect')
  .description('Run threat detection across platforms')
  .option('-t, --type <type>', 'Threat type (all|prompt-injection|data-leakage|policy-violation)')
  .option('-p, --platform <platform>', 'Run on specific platform')
  .option('-s, --severity <level>', 'Filter by severity (low|medium|high|critical)')
  .option('-j, --json', 'Output in JSON format')
  .action(async (options) => {
    try {

      
      // Mock threat detection results
      const threats: ThreatDetection[] = [
        {
          id: 'threat-001',
          type: 'prompt-injection',
          severity: 'high',
          platform: 'openai',
          description: 'Potential prompt injection attempt detected in user prompt',
          detectedAt: new Date(),
          status: 'active',
          confidence: 0.85,
          evidence: {
            pattern: 'ignore previous instructions',
            context: 'User prompt contains suspicious instruction sequence'
          }
        },
        {
          id: 'threat-002',
          type: 'data-leakage',
          severity: 'medium',
          platform: 'google',
          description: 'Potential data leakage detected in response',
          detectedAt: new Date(),
          status: 'active',
          confidence: 0.72,
          evidence: {
            response_size: 'unusually_large',
            content_type: 'sensitive_information'
          }
        },
        {
          id: 'threat-003',
          type: 'policy-violation',
          severity: 'critical',
          platform: 'anthropic',
          description: 'Policy violation detected - restricted content generation',
          detectedAt: new Date(),
          status: 'active',
          confidence: 0.95,
          evidence: {
            category: 'restricted_content',
            policy: 'content_safety_policy_001'
          }
        }
      ];

      let filteredThreats = threats;
      
      if (options.type && options.type !== 'all') {
        filteredThreats = filteredThreats.filter(t => t.type === options.type);
      }
      
      if (options.platform) {
        filteredThreats = filteredThreats.filter(t => t.platform === options.platform);
      }
      
      if (options.severity) {
        filteredThreats = filteredThreats.filter(t => t.severity === options.severity);
      }

      if (options.json) {
        console.log(JSON.stringify(filteredThreats, null, 2));
      } else {
        displayThreats(filteredThreats);
      }
    } catch (error) {
      console.error('Error during threat detection:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Respond to threats
program
  .command('respond')
  .description('Respond to security incidents')
  .requiredOption('-i, --id <id>', 'Incident ID')
  .option('-a, --action <action>', 'Action (quarantine|block|investigate|resolve)')
  .option('-n, --notes <notes>', 'Response notes')
  .action(async (options) => {
    try {
      console.log(`Responding to incident ${options.id}`);
      console.log(`Action: ${options.action || 'investigate'}`);
      if (options.notes) {
        console.log(`Notes: ${options.notes}`);
      }
      
      console.log(`✅ Incident ${options.id} processed successfully`);
    } catch (error) {
      console.error('Error responding to incident:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Threat history
program
  .command('history')
  .description('View threat detection history')
  .option('-p, --platform <platform>', 'Filter by platform')
  .option('-s, --severity <level>', 'Filter by severity')
  .option('--days <days>', 'Show last N days', '7')
  .option('-j, --json', 'Output in JSON format')
  .action(async (options) => {
    try {

      
      // Mock history data
      const history = [
        { date: '2026-06-17', platform: 'openai', count: 3, types: ['prompt-injection', 'data-leakage'] },
        { date: '2026-06-16', platform: 'google', count: 2, types: ['policy-violation'] },
        { date: '2026-06-15', platform: 'anthropic', count: 1, types: ['prompt-injection'] }
      ];

      if (options.json) {
        console.log(JSON.stringify(history, null, 2));
      } else {
        console.log('📈 Threat Detection History');
        console.log('─'.repeat(50));
        history.forEach(item => {
          console.log(`${item.date}: ${item.count} threats on ${item.platform}`);
          console.log(`  Types: ${item.types.join(', ')}`);
        });
      }
    } catch (error) {
      console.error('Error fetching threat history:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Threat analytics
program
  .command('analytics')
  .description('Show threat analytics and trends')
  .option('-p, --period <period>', 'Time period (today|week|month|all)', 'week')
  .action(async (options) => {
    try {
      console.log(`Threat analytics for ${options.period}`);
      
      // Mock analytics data
      const analytics = {
        totalThreats: 15,
        resolvedThreats: 12,
        falsePositives: 2,
        avgResolutionTime: '2.3 hours',
        topThreatTypes: [
          { type: 'prompt-injection', count: 8 },
          { type: 'data-leakage', count: 4 },
          { type: 'policy-violation', count: 3 }
        ],
        platformRisks: [
          { platform: 'openai', riskScore: 7.5 },
          { platform: 'google', riskScore: 6.2 },
          { platform: 'anthropic', riskScore: 4.8 }
        ]
      };

      displayAnalytics(analytics);
    } catch (error) {
      console.error('Error generating analytics:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

function displayThreats(threats: ThreatDetection[]) {
  if (threats.length === 0) {
    console.log('📭 No threats detected');
    return;
  }

  console.log('🚨 Detected Security Threats');
  console.log('─'.repeat(80));
  
  threats.forEach(threat => {
    const icon = threat.severity === 'critical' ? '🔥' : 
                  threat.severity === 'high' ? '⚠️' : 
                  threat.severity === 'medium' ? '🟡' : '🟢';
    
    console.log(`${icon} ${threat.id} - ${threat.platform.toUpperCase()}`);
    console.log(`   Type: ${threat.type}`);
    console.log(`   Severity: ${threat.severity.toUpperCase()}`);
    console.log(`   Detected: ${threat.detectedAt.toLocaleString()}`);
    console.log(`   Confidence: ${Math.round(threat.confidence * 100)}%`);
    console.log(`   Status: ${threat.status}`);
    console.log(`   Description: ${threat.description}`);
    
    if (threat.evidence && Object.keys(threat.evidence).length > 0) {
      console.log(`   Evidence:`);
      Object.entries(threat.evidence).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
    }
    
    console.log('');
  });
  
  console.log(`Total: ${threats.length} threat(s) detected`);
}

function displayAnalytics(analytics: {
  totalThreats: number;
  resolvedThreats: number;
  falsePositives: number;
  avgResolutionTime: string;
  topThreatTypes: Array<{ type: string; count: number }>;
  platformRisks: Array<{ platform: string; riskScore: number }>;
}) {
  console.log('📊 Threat Analytics');
  console.log('─'.repeat(50));
  console.log(`Total Threats: ${analytics.totalThreats}`);
  console.log(`Resolved: ${analytics.resolvedThreats}`);
  console.log(`False Positives: ${analytics.falsePositives}`);
  console.log(`Avg Resolution Time: ${analytics.avgResolutionTime}`);
  
  console.log('\nTop Threat Types:');
  analytics.topThreatTypes.forEach((item: { type: string; count: number }) => {
    console.log(`  ${item.type}: ${item.count} incidents`);
  });
  
  console.log('\nPlatform Risk Scores:');
  analytics.platformRisks.forEach((item: { platform: string; riskScore: number }) => {
    const riskIcon = item.riskScore >= 7 ? '🔴' : 
                    item.riskScore >= 5 ? '🟡' : '🟢';
    console.log(`  ${riskIcon} ${item.platform}: ${item.riskScore}/10`);
  });
}

class ThreatCommand {
  constructor(private config: ConfigManager) {}
  
  execute(options: Record<string, unknown>) {
    if (options.detect) {
      program.parse(['node', 'threat', 'detect', ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : [])]);
    } else if (options.respond) {
      program.parse(['node', 'threat', 'respond', ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : [])]);
    } else if (options.history) {
      program.parse(['node', 'threat', 'history', ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : [])]);
    } else if (options.analytics) {
      program.parse(['node', 'threat', 'analytics', ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : [])]);
    } else {
      program.parse(['node', 'threat', 'detect']);
    }
  }
  
  showHistory(options: Record<string, unknown>) {
    this.execute({ ...options, history: true });
  }
  
  respond(options: Record<string, unknown>) {
    this.execute({ ...options, respond: true });
  }
}

export { ThreatCommand };
export default program;