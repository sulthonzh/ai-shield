#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigManager } from './utils/config-manager';
import { StatusCommand } from './commands/status';
import { MonitorCommand } from './commands/monitor';
import { ConfigureCommand } from './commands/configure';
import { PolicyCommand } from './commands/policy';
import { ComplianceCommand } from './commands/compliance';
import { ThreatCommand } from './commands/threat';
import { ReportCommand } from './commands/report';
import AlertsCommand from './commands/alerts';

const program = new Command();
const version = '1.0.0';

program
  .name('ai-shield')
  .description('AI Security Orchestration CLI - Unified security management across AI platforms')
  .version(version);

// Configuration
const config = new ConfigManager();

// Main commands
program
  .command('status')
  .description('Show overall security posture across all platforms')
  .option('-v, --verbose', 'Show detailed information')
  .option('-j, --json', 'Output in JSON format')
  .action((options) => {
    const statusCmd = new StatusCommand(config);
    statusCmd.execute(options);
  });

program
  .command('monitor')
  .description('Start security monitoring across platforms')
  .option('-c, --continuous', 'Run continuous monitoring')
  .option('-t, --timeout <seconds>', 'Monitoring timeout in seconds', '300')
  .option('-j, --json', 'Output in JSON format')
  .action((options) => {
    const monitorCmd = new MonitorCommand(config);
    monitorCmd.execute(options);
  });

program
  .command('configure')
  .description('Configure AI platform connections')
  .option('-p, --platform <platform>', 'Platform to configure (openai|anthropic|google|azure)')
  .option('-k, --api-key <key>', 'API key for the platform')
  .option('-u, --base-url <url>', 'Custom base URL')
  .option('-l, --list', 'List current configurations')
  .option('-e, --enable', 'Enable platform')
  .option('-d, --disable', 'Disable platform')
  .action((options) => {
    const configCmd = new ConfigureCommand(config);
    configCmd.execute(options);
  });

program
  .command('policy')
  .description('Manage security policies')
  .action((options) => {
    const policyCmd = new PolicyCommand(config);
    policyCmd.execute(options);
  });

program
  .command('compliance')
  .description('Check compliance status across platforms')
  .option('-p, --platform <platform>', 'Check specific platform')
  .option('-r, --report <type>', 'Generate report (summary|detailed|audit)')
  .option('-j, --json', 'Output in JSON format')
  .action((options) => {
    const complianceCmd = new ComplianceCommand(config);
    complianceCmd.execute(options);
  });

program
  .command('threat-detect')
  .description('Run threat detection across platforms')
  .option('-t, --type <type>', 'Threat type (all|prompt-injection|data-leakage|policy-violation)')
  .option('-p, --platform <platform>', 'Run on specific platform')
  .option('-s, --severity <level>', 'Filter by severity (low|medium|high|critical)')
  .option('-j, --json', 'Output in JSON format')
  .action((options) => {
    const threatCmd = new ThreatCommand(config);
    threatCmd.execute(options);
  });

program
  .command('threat-history')
  .description('View threat detection history')
  .option('-p, --platform <platform>', 'Filter by platform')
  .option('-s, --severity <level>', 'Filter by severity')
  .option('--days <days>', 'Show last N days', '7')
  .option('-j, --json', 'Output in JSON format')
  .action((options) => {
    const threatCmd = new ThreatCommand(config);
    threatCmd.showHistory(options);
  });

program
  .command('threat-response')
  .description('Respond to security incidents')
  .requiredOption('-i, --id <id>', 'Incident ID')
  .option('-a, --action <action>', 'Action (quarantine|block|investigate|resolve)')
  .option('-n, --notes <notes>', 'Response notes')
  .action((options) => {
    const threatCmd = new ThreatCommand(config);
    threatCmd.respond(options);
  });

program
  .command('report')
  .description('Generate security reports')
  .option('-t, --type <type>', 'Report type (overview|threats|compliance|incident)')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format <format>', 'Output format (json|md|pdf)')
  .option('-p, --period <period>', 'Time period (7d|30d|90d|1y)', '30d')
  .action((options) => {
    const reportCmd = new ReportCommand(config);
    reportCmd.execute(options);
  });

program
  .command('alerts')
  .description('Manage security alerts')
  .action((options, cmd) => {
    const alertsCmd = new AlertsCommand(config);
    alertsCmd.execute(options, cmd);
  });

// Error handling
program.exitOverride();
program.configureOutput({
  writeErr: (str) => process.stderr.write(str),
  outputError: (str) => process.stdout.write(str)
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
try {
  program.parse();
} catch (error) {
  if (error instanceof Error && error.message.includes('unknown command')) {
    console.error(`Unknown command. Use 'ai-shield --help' for available commands.`);
    process.exit(1);
  }
  throw error;
}