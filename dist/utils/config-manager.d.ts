import { PlatformConfig, SecurityPolicy, SecurityPosture, ThreatDetection } from '../types';
export declare class ConfigManager {
    private configPath;
    private config;
    constructor();
    private loadConfig;
    private saveConfig;
    getPlatforms(): PlatformConfig[];
    getPlatform(name: string): PlatformConfig | undefined;
    addPlatform(config: PlatformConfig): void;
    removePlatform(name: string): boolean;
    togglePlatform(name: string, enabled: boolean): void;
    getPolicies(): SecurityPolicy[];
    getPolicy(id: string): SecurityPolicy | undefined;
    addPolicy(policy: SecurityPolicy): void;
    updatePolicy(id: string, updates: Partial<SecurityPolicy>): boolean;
    removePolicy(id: string): boolean;
    enablePolicy(id: string): boolean;
    disablePolicy(id: string): boolean;
    validatePlatformConfig(config: PlatformConfig): string[];
    validatePolicy(policy: SecurityPolicy): string[];
    reset(): void;
    exportConfig(): string;
    importConfig(configJson: string): boolean;
    calculateSecurityPosture(): SecurityPosture;
    detectThreats(options: {
        platform?: string;
        type?: string;
        severity?: string;
    }): Promise<ThreatDetection[]>;
    getConfigPath(): string;
    configExists(): boolean;
    deleteConfig(): boolean;
}
//# sourceMappingURL=config-manager.d.ts.map