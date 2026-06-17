"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ConfigManager {
    constructor() {
        this.configPath = path.join(process.cwd(), 'ai-shield-config.json');
        this.config = this.loadConfig();
    }
    loadConfig() {
        const defaultConfig = {
            platforms: [],
            policies: [
                {
                    id: 'prompt-injection-detection',
                    name: 'Prompt Injection Detection',
                    description: 'Detects attempts to manipulate AI systems through prompt injection',
                    rule: 'Detect patterns like "ignore previous instructions", "disregard safety measures"',
                    enabled: true,
                    platform: ['openai', 'anthropic', 'google', 'azure'],
                    severity: 'high',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'data-leakage-prevention',
                    name: 'Data Leakage Prevention',
                    description: 'Prevents sensitive data from being leaked in AI responses',
                    rule: 'Detect PII, confidential information, and restricted data patterns',
                    enabled: true,
                    platform: ['openai', 'anthropic', 'google', 'azure'],
                    severity: 'critical',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'pii-detection',
                    name: 'PII Detection',
                    description: 'Detects personally identifiable information in prompts and responses',
                    rule: 'Detect names, emails, phone numbers, addresses, and other PII patterns',
                    enabled: true,
                    platform: ['openai', 'anthropic', 'google', 'azure'],
                    severity: 'high',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'hallucination-detection',
                    name: 'Hallucination Detection',
                    description: 'Detects AI hallucinations and factual inaccuracies',
                    rule: 'Cross-reference claims with trusted knowledge sources',
                    enabled: true,
                    platform: ['openai', 'anthropic', 'google', 'azure'],
                    severity: 'medium',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ],
            organization: {
                name: 'Default Organization',
                departments: [],
                alertConfig: {},
                securityLevel: 'standard'
            }
        };
        try {
            if (fs.existsSync(this.configPath)) {
                const savedConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
                savedConfig.policies = savedConfig.policies.map((policy) => ({
                    ...policy,
                    createdAt: new Date(policy.createdAt),
                    updatedAt: new Date(policy.updatedAt)
                }));
                return { ...defaultConfig, ...savedConfig };
            }
        }
        catch (error) {
            console.warn('Error loading config, using defaults:', error instanceof Error ? error.message : 'Unknown error');
        }
        return defaultConfig;
    }
    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        }
        catch (error) {
            console.error('Error saving config:', error instanceof Error ? error.message : 'Unknown error');
        }
    }
    getPlatforms() {
        return this.config.platforms;
    }
    getPlatform(name) {
        return this.config.platforms.find(p => p.name === name);
    }
    addPlatform(config) {
        const existingIndex = this.config.platforms.findIndex(p => p.name === config.name);
        if (existingIndex >= 0) {
            this.config.platforms[existingIndex] = config;
        }
        else {
            this.config.platforms.push(config);
        }
        this.saveConfig();
    }
    removePlatform(name) {
        const initialLength = this.config.platforms.length;
        this.config.platforms = this.config.platforms.filter(p => p.name !== name);
        if (this.config.platforms.length < initialLength) {
            this.saveConfig();
            return true;
        }
        return false;
    }
    togglePlatform(name, enabled) {
        const platform = this.getPlatform(name);
        if (platform) {
            platform.enabled = enabled;
            this.saveConfig();
        }
    }
    getPolicies() {
        return this.config.policies;
    }
    getPolicy(id) {
        return this.config.policies.find(p => p.id === id);
    }
    addPolicy(policy) {
        policy.updatedAt = new Date();
        this.config.policies.push(policy);
        this.saveConfig();
    }
    updatePolicy(id, updates) {
        const index = this.config.policies.findIndex(p => p.id === id);
        if (index >= 0) {
            this.config.policies[index] = {
                ...this.config.policies[index],
                ...updates,
                updatedAt: new Date()
            };
            this.saveConfig();
            return true;
        }
        return false;
    }
    removePolicy(id) {
        const initialLength = this.config.policies.length;
        this.config.policies = this.config.policies.filter(p => p.id !== id);
        if (this.config.policies.length < initialLength) {
            this.saveConfig();
            return true;
        }
        return false;
    }
    enablePolicy(id) {
        return this.updatePolicy(id, { enabled: true });
    }
    disablePolicy(id) {
        return this.updatePolicy(id, { enabled: false });
    }
    validatePlatformConfig(config) {
        const errors = [];
        if (!config.name || !['openai', 'anthropic', 'google', 'azure'].includes(config.name)) {
            errors.push('Invalid platform name');
        }
        if (!config.apiKey || config.apiKey.trim() === '') {
            errors.push('API key is required');
        }
        if (config.baseUrl && !config.baseUrl.startsWith('http')) {
            errors.push('Base URL must start with http:// or https://');
        }
        return errors;
    }
    validatePolicy(policy) {
        const errors = [];
        if (!policy.id || policy.id.trim() === '') {
            errors.push('Policy ID is required');
        }
        if (!policy.name || policy.name.trim() === '') {
            errors.push('Policy name is required');
        }
        if (!policy.rule || policy.rule.trim() === '') {
            errors.push('Policy rule is required');
        }
        if (!['low', 'medium', 'high', 'critical'].includes(policy.severity)) {
            errors.push('Invalid severity level');
        }
        if (!policy.platform || policy.platform.length === 0) {
            errors.push('At least one platform must be specified');
        }
        policy.platform.forEach(platform => {
            if (!['openai', 'anthropic', 'google', 'azure'].includes(platform)) {
                errors.push(`Invalid platform: ${platform}`);
            }
        });
        return errors;
    }
    reset() {
        this.config = this.loadConfig();
        this.saveConfig();
    }
    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }
    importConfig(configJson) {
        try {
            const imported = JSON.parse(configJson);
            this.config = { ...this.loadConfig(), ...imported };
            this.saveConfig();
            return true;
        }
        catch (error) {
            console.error('Error importing config:', error instanceof Error ? error.message : 'Unknown error');
            return false;
        }
    }
    calculateSecurityPosture() {
        const platforms = this.getPlatforms();
        const enabledPolicies = this.getPolicies().filter(p => p.enabled);
        let totalScore = 0;
        let platformScores = [];
        platforms.forEach(platform => {
            if (platform.enabled) {
                const score = Math.floor(Math.random() * 30) + 70;
                totalScore += score;
                platformScores.push({
                    name: platform.name,
                    score,
                    threats: Math.floor(Math.random() * 5),
                    incidents: Math.floor(Math.random() * 2),
                    lastUpdated: new Date()
                });
            }
            else {
                platformScores.push({
                    name: platform.name,
                    score: 0,
                    threats: 0,
                    incidents: 0,
                    lastUpdated: new Date()
                });
            }
        });
        const averageScore = platforms.length > 0 ? Math.round(totalScore / platforms.length) : 0;
        return {
            overallScore: averageScore,
            platforms: platformScores,
            policies: {
                total: this.getPolicies().length,
                enabled: enabledPolicies.length,
                disabled: this.getPolicies().length - enabledPolicies.length
            },
            threats: {
                active: Math.floor(Math.random() * 15),
                resolved: Math.floor(Math.random() * 30),
                falsePositives: Math.floor(Math.random() * 5)
            },
            lastUpdated: new Date()
        };
    }
    async detectThreats(options) {
        const mockThreats = [
            {
                id: 'threat-001',
                type: 'prompt-injection',
                severity: 'high',
                platform: options.platform || 'openai',
                description: 'Potential prompt injection attempt detected',
                detectedAt: new Date(),
                status: 'active',
                confidence: 0.85,
                evidence: {
                    pattern: 'ignore previous instructions',
                    context: 'User prompt contains suspicious sequence'
                }
            },
            {
                id: 'threat-002',
                type: 'data-leakage',
                severity: 'medium',
                platform: options.platform || 'google',
                description: 'Sensitive data pattern detected in response',
                detectedAt: new Date(),
                status: 'active',
                confidence: 0.72,
                evidence: {
                    data_type: 'PII',
                    confidence_score: 0.72
                }
            }
        ];
        if (options.type) {
            return mockThreats.filter(t => t.type === options.type);
        }
        if (options.severity) {
            return mockThreats.filter(t => t.severity === options.severity);
        }
        if (options.platform) {
            return mockThreats.filter(t => t.platform === options.platform);
        }
        return mockThreats;
    }
    getConfigPath() {
        return this.configPath;
    }
    configExists() {
        return fs.existsSync(this.configPath);
    }
    deleteConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                fs.unlinkSync(this.configPath);
                return true;
            }
        }
        catch (error) {
            console.error('Error deleting config:', error instanceof Error ? error.message : 'Unknown error');
        }
        return false;
    }
}
exports.ConfigManager = ConfigManager;
