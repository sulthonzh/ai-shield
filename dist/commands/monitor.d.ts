#!/usr/bin/env node
import { Command } from 'commander';
declare const program: Command;
declare class MonitorCommand {
    private config;
    constructor(config: any);
    execute(options: any): void;
}
export { MonitorCommand };
export default program;
//# sourceMappingURL=monitor.d.ts.map