#!/usr/bin/env node
import { Command } from 'commander';
declare const program: Command;
declare class AlertsCommand {
    private config;
    constructor(config: any);
    execute(options: any, cmd: any): void;
}
export { AlertsCommand };
export default program;
//# sourceMappingURL=alerts.d.ts.map