#!/usr/bin/env node
import { Command } from 'commander';
declare const program: Command;
declare class ThreatCommand {
    private config;
    constructor(config: any);
    execute(options: any): void;
    showHistory(options: any): void;
    respond(options: any): void;
}
export { ThreatCommand };
export default program;
//# sourceMappingURL=threat.d.ts.map