#!/usr/bin/env node
import { Command } from 'commander';
declare const program: Command;
declare class StatusCommand {
    private config;
    constructor(config: any);
    execute(options: any): void;
}
export { StatusCommand };
export default program;
//# sourceMappingURL=status.d.ts.map