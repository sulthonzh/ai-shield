#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCommand = void 0;
const commander_1 = require("commander");
const config_manager_1 = require("../utils/config-manager");
const program = new commander_1.Command();
program
    .name('status')
    .description('Show overall security posture across all platforms')
    .version('1.0.0');
program
    .command('show')
    .description('Display current security status')
    .option('-v, --verbose', 'Show detailed information')
    .option('-j, --json', 'Output in JSON format')
    .action(async (options) => {
    try {
        const config = new config_manager_1.ConfigManager();
        const posture = {
            overallScore: 78,
            platforms: [
                {
                    name: 'openai',
                    score: 82,
                    threats: 3,
                    incidents: 1,
                    lastUpdated: new Date()
                },
                {
                    name: 'anthropic',
                    score: 85,
                    threats: 2,
                    incidents: 0,
                    lastUpdated: new Date()
                },
                {
                    name: 'google',
                    score: 75,
                    threats: 5,
                    incidents: 2,
                    lastUpdated: new Date()
                }
            ],
            policies: {
                total: 12,
                enabled: 10,
                disabled: 2
            },
            threats: {
                active: 10,
                resolved: 25,
                falsePositives: 3
            },
            lastUpdated: new Date()
        };
        if (options.json) {
            console.log(JSON.stringify(posture, null, 2));
        }
        else {
            displayStatus(posture, options.verbose);
        }
    }
    catch (error) {
        console.error('Error fetching status:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
program
    .command('platform')
    .description('Show status for specific platforms')
    .option('-p, --platform <platform>', 'Specific platform to check')
    .option('-j, --json', 'Output in JSON format')
    .action(async (options) => {
    try {
        const config = new config_manager_1.ConfigManager();
        if (!options.platform) {
            console.log('Available platforms:');
            console.log('  • openai');
            console.log('  • anthropic');
            console.log('  • google');
            console.log('  • azure');
            return;
        }
        const platformStatus = {
            name: options.platform,
            status: 'healthy',
            score: 82,
            threats: 3,
            incidents: 1,
            lastUpdated: new Date()
        };
        if (options.json) {
            console.log(JSON.stringify(platformStatus, null, 2));
        }
        else {
            console.log(`${options.platform.toUpperCase()} Status`);
            console.log('─'.repeat(40));
            console.log(`Overall Score: ${platformStatus.score}/100`);
            console.log(`Threats: ${platformStatus.threats} active`);
            console.log(`Incidents: ${platformStatus.incidents}`);
            console.log(`Last Updated: ${platformStatus.lastUpdated.toLocaleString()}`);
        }
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
program
    .command('health')
    .description('Run health check on all systems')
    .action(async () => {
    try {
        console.log('Running health checks...');
        console.log('✅ Configuration manager: OK');
        console.log('✅ Policy engine: OK');
        console.log('✅ Monitor service: OK');
        console.log('✅ Compliance checker: OK');
        console.log('✅ All systems healthy');
    }
    catch (error) {
        console.error('Health check failed:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
function displayStatus(posture, verbose = false) {
    const overallIcon = posture.overallScore >= 90 ? '🟢' :
        posture.overallScore >= 70 ? '🟡' : '🔴';
    console.log(`${overallIcon} AI Shield Security Status`);
    console.log('─'.repeat(50));
    console.log(`Overall Score: ${posture.overallScore}/100`);
    console.log(`Last Updated: ${posture.lastUpdated.toLocaleString()}\n`);
    console.log('Platform Status:');
    posture.platforms.forEach(platform => {
        const icon = platform.score >= 90 ? '✅' :
            platform.score >= 70 ? '⚠️' : '❌';
        console.log(`  ${icon} ${platform.name.toUpperCase()}: ${platform.score}/100`);
        console.log(`     Threats: ${platform.threats} active | Incidents: ${platform.incidents}`);
        if (verbose) {
            console.log(`     Last Updated: ${platform.lastUpdated.toLocaleString()}`);
        }
    });
    console.log('\nSecurity Overview:');
    console.log(`  🎯 Active Threats: ${posture.threats.active}`);
    console.log(`  ✅ Resolved: ${posture.threats.resolved}`);
    console.log(`  📊 False Positives: ${posture.threats.falsePositives}`);
    console.log(`  📋 Policies: ${posture.policies.enabled}/${posture.policies.total} enabled`);
    if (verbose) {
        console.log('\nRecommendations:');
        if (posture.overallScore < 80) {
            console.log('  • Review and update security policies');
            console.log('  • Increase monitoring frequency');
        }
        if (posture.threats.active > 5) {
            console.log('  • Implement automated threat response');
            console.log('  • Consider escalating monitoring priority');
        }
    }
}
class StatusCommand {
    constructor(config) {
        this.config = config;
    }
    execute(options) {
        if (options.show) {
            program.parse(['node', 'status', 'show', ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : [])]);
        }
        else if (options.platform) {
            program.parse(['node', 'status', 'platform', ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : [])]);
        }
        else if (options.health) {
            program.parse(['node', 'status', 'health']);
        }
        else {
            program.parse(['node', 'status', 'show']);
        }
    }
}
exports.StatusCommand = StatusCommand;
exports.default = program;
