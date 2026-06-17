#!/usr/bin/env node
import { Command } from 'commander';
declare const program: Command;
declare class ConfigureCommand {
    private config;
    constructor(config: any);
    execute(options: any): void;
}
export { ConfigureCommand };
export default program;
//# sourceMappingURL=configure.d.ts.map