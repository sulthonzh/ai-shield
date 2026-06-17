#!/usr/bin/env node
import { Command } from 'commander';
declare const program: Command;
declare class ReportCommand {
    private config;
    constructor(config: any);
    execute(options: any): void;
}
export { ReportCommand };
export default program;
//# sourceMappingURL=report.d.ts.map