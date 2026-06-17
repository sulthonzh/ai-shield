#!/usr/bin/env node
import { Command } from 'commander';
declare const program: Command;
declare class ComplianceCommand {
    private config;
    constructor(config: any);
    execute(options: any): void;
}
export { ComplianceCommand };
export default program;
//# sourceMappingURL=compliance.d.ts.map