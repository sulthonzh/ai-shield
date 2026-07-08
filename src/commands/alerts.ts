#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigManager } from '../utils/config-manager';
import { SecurityMonitor } from '../security/monitor';

// Action handler: list alerts
export async function listAction(options: {
  platform?: string;
  severity?: string;
  limit?: string;
  format?: string;
}, monitor?: SecurityMonitor): Promise<void> {
  try {
    const m = monitor || new SecurityMonitor(new ConfigManager());
    const filter: { platform?: string; severity?: 'low' | 'medium' | 'high' | 'critical' } = {};
    if (options.platform) filter.platform = options.platform;
    if (options.severity) filter.severity = options.severity as 'low' | 'medium' | 'high' | 'critical';

    const alerts = await m.getActiveAlerts(Object.keys(filter).length > 0 ? filter : undefined);
    const limit = parseInt(options.limit || '20', 10) || 20;
    const limited = alerts.slice(0, limit);

    if (limited.length === 0) {
      console.log('No active alerts found.');
      return;
    }

    if (options.format === 'json') {
      console.log(JSON.stringify(limited, null, 2));
    } else {
      console.log('\nActive Security Alerts:\n');
      console.log('ID'.padEnd(30) + 'Severity'.padEnd(12) + 'Platform'.padEnd(15) + 'Title');
      console.log('-'.repeat(80));
      for (const alert of limited) {
        console.log(alert.id.padEnd(30) + alert.severity.padEnd(12) + alert.platform.padEnd(15) + alert.title);
      }
      console.log(`\nTotal: ${limited.length} alert(s)`);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Action handler: acknowledge alert
export async function acknowledgeAction(alertId: string, options: {
  reason?: string;
}, monitor?: SecurityMonitor): Promise<void> {
  try {
    const m = monitor || new SecurityMonitor(new ConfigManager());
    const success = await m.acknowledgeAlert(alertId, {
      reason: options.reason,
      acknowledgedBy: 'cli-user',
    });

    if (success) {
      console.log(`✅ Alert ${alertId} acknowledged successfully.`);
      if (options.reason) {
        console.log(`   Reason: ${options.reason}`);
      }
    } else {
      console.error(`❌ Alert ${alertId} not found or already acknowledged.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Action handler: create alert
export async function createAction(options: {
  platform?: string;
  threat?: string;
  severity?: string;
  title?: string;
  description?: string;
}, monitor?: SecurityMonitor): Promise<void> {
  try {
    if (!options.platform || !options.title) {
      console.error('❌ --platform and --title are required for alert creation.');
      process.exit(1);
    }

    const severity = options.severity || 'medium';
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      console.error(`❌ Invalid severity: ${options.severity}. Must be one of: ${validSeverities.join(', ')}`);
      process.exit(1);
    }

    const m = monitor || new SecurityMonitor(new ConfigManager());
    const alert = await m.createAlert({
      platform: options.platform,
      threat: options.threat || 'unknown',
      severity: severity as 'low' | 'medium' | 'high' | 'critical',
      title: options.title,
      description: options.description || '',
    });

    console.log(`✅ Alert created: ${alert.id}`);
    console.log(`   Severity: ${alert.severity}`);
    console.log(`   Platform: ${alert.platform}`);
    console.log(`   Title: ${alert.title}`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Action handler: alert statistics
export async function statsAction(options: {
  platform?: string;
}, monitor?: SecurityMonitor): Promise<void> {
  try {
    const m = monitor || new SecurityMonitor(new ConfigManager());
    const stats = await m.getAlertStats({
      period: 'all',
      platform: options.platform,
    });

    console.log('\nSecurity Alert Statistics:\n');
    console.log(`Total Alerts:     ${stats.totalAlerts}`);
    console.log(`Active:           ${stats.activeAlerts}`);
    console.log(`Acknowledged:     ${stats.acknowledgedAlerts}`);
    console.log(`Escalated:        ${stats.escalatedAlerts}`);
    console.log(`Avg Response Time: ${stats.avgResponseTime}s`);

    if (Object.keys(stats.bySeverity).length > 0) {
      console.log('\nBy Severity:');
      for (const [severity, count] of Object.entries(stats.bySeverity)) {
        console.log(`  ${severity.padEnd(12)} ${count}`);
      }
    }

    if (Object.keys(stats.byPlatform).length > 0) {
      console.log('\nBy Platform:');
      for (const [platform, count] of Object.entries(stats.byPlatform)) {
        console.log(`  ${platform.padEnd(15)} ${count}`);
      }
    }
    console.log('');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Build CLI program
function buildProgram(monitor?: SecurityMonitor): Command {
  const program = new Command();

  program
    .name('alerts')
    .description('Manage security alerts and notifications')
    .version('1.0.0');

  program
    .command('list')
    .description('List all active security alerts')
    .option('--platform <platform>', 'Filter alerts by platform')
    .option('--severity <severity>', 'Filter alerts by severity (low|medium|high|critical)')
    .option('--limit <number>', 'Maximum number of alerts to show', '20')
    .option('--format <format>', 'Output format (table|json)', 'table')
    .action(async (options) => {
      await listAction(options, monitor);
    });

  program
    .command('acknowledge')
    .description('Acknowledge a security alert')
    .argument('<alert-id>', 'ID of the alert to acknowledge')
    .option('--reason <reason>', 'Reason for acknowledging the alert')
    .action(async (alertId: string, options: { reason?: string }) => {
      await acknowledgeAction(alertId, options, monitor);
    });

  program
    .command('create')
    .description('Create a new security alert')
    .option('--platform <platform>', 'Platform where the alert originated')
    .option('--threat <threat>', 'Type of threat detected')
    .option('--severity <severity>', 'Alert severity (low|medium|high|critical)', 'medium')
    .option('--title <title>', 'Alert title')
    .option('--description <description>', 'Detailed description of the alert')
    .action(async (options) => {
      await createAction(options, monitor);
    });

  program
    .command('stats')
    .description('Show security alert statistics')
    .option('--platform <platform>', 'Filter by platform')
    .action(async (options) => {
      await statsAction(options, monitor);
    });

  return program;
}

const program = buildProgram();

if (require.main === module) {
  program.parse();
}

class AlertsCommand {
  private monitor: SecurityMonitor;

  constructor(config: ConfigManager, monitor?: SecurityMonitor) {
    this.monitor = monitor || new SecurityMonitor(config);
  }

  execute(options: Record<string, unknown>, cmd: { args?: string[] }) {
    const prog = buildProgram(this.monitor);
    prog.parse(['node', 'alerts', ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : []), ...(cmd.args || [])]);
  }

  getMonitor(): SecurityMonitor {
    return this.monitor;
  }
}

export { AlertsCommand, SecurityMonitor, buildProgram, program };
export default AlertsCommand;
