#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyCommand = void 0;
const commander_1 = require("commander");
const config_manager_1 = require("../utils/config-manager");
const program = new commander_1.Command();
program
    .name('policy')
    .description('Manage security policies')
    .version('1.0.0');
program
    .command('list')
    .description('List all security policies')
    .option('--platform <platform>', 'Filter by platform')
    .option('--enabled', 'Show only enabled policies')
    .action(async (options) => {
    try {
        const config = new config_manager_1.ConfigManager();
        const policies = config.getPolicies();
        if (options.platform) {
            const filtered = policies.filter(p => p.platform.includes(options.platform));
            displayPolicies(filtered);
        }
        else {
            displayPolicies(policies);
        }
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
program
    .command('enable')
    .description('Enable a security policy')
    .argument('<policy-id>', 'ID of the policy to enable')
    .action(async (policyId) => {
    try {
        console.log(`Enabling policy: ${policyId}`);
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
program
    .command('disable')
    .description('Disable a security policy')
    .argument('<policy-id>', 'ID of the policy to disable')
    .action(async (policyId) => {
    try {
        console.log(`Disabling policy: ${policyId}`);
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
program
    .command('create')
    .description('Create a new security policy')
    .option('-n, --name <name>', 'Policy name')
    .option('-d, --description <description>', 'Policy description')
    .option('-r, --rule <rule>', 'Policy rule')
    .option('-p, --platform <platform>', 'Target platform (comma-separated)')
    .option('-s, --severity <severity>', 'Severity level (low|medium|high|critical)', 'medium')
    .action(async (options) => {
    try {
        console.log('Policy creation not yet implemented');
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
program
    .command('test')
    .description('Test a security policy')
    .argument('<policy-id>', 'ID of the policy to test')
    .option('--sample <text>', 'Sample text to test against')
    .action(async (policyId, options) => {
    try {
        console.log(`Testing policy: ${policyId}`);
        if (options.sample) {
            console.log(`Sample: ${options.sample}`);
        }
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
function displayPolicies(policies) {
    if (policies.length === 0) {
        console.log('No policies found');
        return;
    }
    console.log('📋 Security Policies');
    console.log('─'.repeat(60));
    console.log('ID                | NAME               | PLATFORM | SEVERITY | STATUS');
    console.log('─'.repeat(60));
    policies.forEach(policy => {
        const id = policy.id.padEnd(18);
        const name = (policy.name || 'Unknown').padEnd(17);
        const platform = (policy.platform?.join(',') || 'All').padEnd(10);
        const severity = (policy.severity || 'medium').padEnd(8);
        const status = policy.enabled ? '✅' : '❌';
        console.log(`${id} | ${name} | ${platform} | ${severity} | ${status}`);
    });
    console.log('─'.repeat(60));
    console.log(`Total: ${policies.length} policy(s)`);
}
class PolicyCommand {
    constructor(config) {
        this.config = config;
    }
    execute(options) {
        if (options.list) {
            program.parse(['node', 'policy', 'list', ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : [])]);
        }
        else if (options.enable) {
            program.parse(['node', 'policy', 'enable', String(options.enable)]);
        }
        else if (options.disable) {
            program.parse(['node', 'policy', 'disable', String(options.disable)]);
        }
        else if (options.create) {
            program.parse(['node', 'policy', 'create', ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : [])]);
        }
        else if (options.test) {
            program.parse(['node', 'policy', 'test', String(options.test), ...Object.entries(options).flatMap(([key, value]) => value ? [`--${key}`, String(value)] : [])]);
        }
        else {
            program.parse(['node', 'policy', 'list']);
        }
    }
}
exports.PolicyCommand = PolicyCommand;
exports.default = program;
