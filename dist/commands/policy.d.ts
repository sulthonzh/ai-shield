#!/usr/bin/env node
import { Command } from 'commander';
declare const program: Command;
declare class PolicyCommand {
    private config;
    constructor(config: any);
    execute(options: any, cmd: any): void;
}
export { PolicyCommand };
export default program;
//# sourceMappingURL=policy.d.ts.map