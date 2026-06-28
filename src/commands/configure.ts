#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigManager } from '../utils/config-manager';
import { PlatformConfig } from '../types';

const program = new Command();

program
  .name('configure')
  .description('Configure AI platform connections')
  .version('1.0.0');

// Platform configuration
program
  .command('platform')
  .description('Configure AI platform settings')
  .option('-p, --platform <platform>', 'Platform to configure (openai|anthropic|google|azure)')
  .option('-k, --api-key ***', 'API key for the platform')
  .option('-u, --base-url <url>', 'Custom base URL')
  .option('-l, --list', 'List current configurations')
  .option('-e, --enable', 'Enable platform')
  .option('-d, --disable', 'Disable platform')
  .action(async (options) => {
    try {
      const config = new ConfigManager();

      if (options.list) {
        const platforms = config.getPlatforms();
        console.log('Configured platforms:');
        platforms.forEach(p => {
          console.log(`  ${p.name}: ${p.enabled ? 'enabled' : 'disabled'}`);
          if (p.baseUrl) console.log(`    URL: ${p.baseUrl}`);
        });
        return;
      }

      if (!options.platform) {
        console.error('Platform is required. Use --platform option.');
        process.exit(1);
      }

      const platformName = options.platform.toLowerCase();
      const platformNames = ['openai', 'anthropic', 'google', 'azure'];
      
      if (!platformNames.includes(platformName)) {
        console.error(`Invalid platform: ${platformName}`);
        console.log('Supported platforms: openai, anthropic, google, azure');
        return;
      }

      if (options.enable || options.disable) {
        const enabled = options.enable !== undefined;
        config.togglePlatform(platformName, enabled);
        console.log(`${platformName} ${enabled ? 'enabled' : 'disabled'}`);
        return;
      }

      if (options.apiKey) {
        console.log(`Configuring ${platformName} with API key`);
      } else {
        console.log('Interactive configuration not yet implemented');
      }
    } catch (error) {
      console.error('Error during configuration:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Test connection
program
  .command('test')
  .description('Test platform connections')
  .option('-p, --platform <platform>', 'Test specific platform')
  .action(async (_options) => {
    try {
      console.log('Connection testing not yet implemented');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Reset configuration
program
  .command('reset')
  .description('Reset all configurations')
  .option('--confirm', 'Confirm reset')
  .action(async (options) => {
    try {
      if (!options.confirm) {
        console.log('Use --confirm to reset all configurations');
        return;
      }
      
      const config = new ConfigManager();
      config.reset();
      console.log('All configurations reset');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

class ConfigureCommand {
  constructor(private config: ConfigManager) {}
  
  execute(options: Record<string, unknown>) {
    try {
      if (options.list) {
        const platforms = this.config.getPlatforms();
        console.log('Configured platforms:');
        platforms.forEach(p => {
          console.log(`  ${p.name}: ${p.enabled ? 'enabled' : 'disabled'}${p.apiKey ? ' (configured)' : ''}`);
        });
        return;
      }

      if (options.platform) {
        const platformName = options.platform as string;
        
        if (options.enable || options.disable) {
          const enabled = options.enable !== undefined;
          this.config.togglePlatform(platformName, enabled);
          console.log(`${platformName} ${enabled ? 'enabled' : 'disabled'}`);
          return;
        }

        if (options.apiKey) {
          this.config.addPlatform({
            name: platformName as PlatformConfig['name'],
            apiKey: options.apiKey as string,
            baseUrl: options.baseUrl as string | undefined,
            enabled: true,
          });
          console.log(`✅ ${platformName} configured successfully`);
        } else {
          console.log('Interactive configuration not yet implemented');
        }
        return;
      }

      if (!options.platform && !options.list && !options.test && !options.reset) {
        console.log('Platform is required. Use --platform option.');
        console.log('Or use --list to see available platforms');
      }
    } catch (error) {
      console.error('Error during configuration:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  }
}

export { ConfigureCommand };
export default program;