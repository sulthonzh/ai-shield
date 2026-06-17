#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigManager } from '../utils/config-manager';
import { ThreatDetection } from '../types';

const program = new Command();

program
  .name('monitor')
  .description('Start security monitoring across platforms')
  .version('1.0.0');

// Start monitoring
program
  .command('start')
  .description('Start real-time security monitoring')
  .option('-c, --continuous', 'Run continuous monitoring')
  .option('-t, --timeout <seconds>', 'Monitoring timeout in seconds', '300')
  .option('-j, --json', 'Output in JSON format')
  .action(async (options) => {
    try {
      const config = new ConfigManager();
      console.log('Starting security monitoring...');
      console.log(`Mode: ${options.continuous ? 'continuous' : 'single scan'}`);
      console.log(`Timeout: ${options.timeout} seconds`);
      
      // Simulate monitoring results
      const threats: ThreatDetection[] = [
        {
          id: 'threat-001',
          type: 'prompt-injection' as const,
          severity: 'high' as const,
          platform: 'openai',
          description: 'Potential prompt injection attempt detected',
          detectedAt: new Date(),
          status: 'active' as const,
          confidence: 0.85,
          evidence: {
            prompt: 'Ignore previous instructions and...',
            pattern: 'ignore previous instructions'
          }
        }
      ];

      if (options.json) {
        console.log(JSON.stringify({ threats }, null, 2));
      } else {
        console.log('🚨 Security threats detected:');
        threats.forEach(threat => {
          const icon = threat.severity === 'critical' ? '🔥' : 
                      threat.severity === 'high' ? '⚠️' : 
                      threat.severity === 'medium' ? '🟡' : '🟢';
          
          console.log(`${icon} ${threat.id} - ${threat.platform}`);
          console.log(`   Type: ${threat.type}`);
          console.log(`   Severity: ${threat.severity}`);
          console.log(`   Detected: ${threat.detectedAt.toLocaleString()}`);
          console.log(`   Confidence: ${Math.round(threat.confidence * 100)}%`);
          console.log(`   Status: ${threat.status}`);
          console.log('');
        });
      }
    } catch (error) {
      console.error('Error during monitoring:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Stop monitoring
program
  .command('stop')
  .description('Stop active monitoring sessions')
  .action(async () => {
    try {
      console.log('Monitoring stopped');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Monitoring status
program
  .command('status')
  .description('Check monitoring status')
  .action(async () => {
    try {
      console.log('Monitoring status: Not running');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Threat history
program
  .command('history')
  .description('View monitoring history')
  .option('--days <days>', 'Show last N days', '7')
  .option('--platform <platform>', 'Filter by platform')
  .action(async (options) => {
    try {
      console.log(`Monitoring history for ${options.days} days`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

class MonitorCommand {
  constructor(private config: any) {}
  
  execute(options: any) {
    if (options.start) {
      program.parse(['node', 'monitor', 'start', ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : [])]);
    } else if (options.stop) {
      program.parse(['node', 'monitor', 'stop']);
    } else if (options.status) {
      program.parse(['node', 'monitor', 'status']);
    } else if (options.history) {
      program.parse(['node', 'monitor', 'history', ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : [])]);
    } else {
      program.parse(['node', 'monitor', 'start']);
    }
  }
}

export { MonitorCommand };
export default program;