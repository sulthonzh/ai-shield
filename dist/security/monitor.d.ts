import { EventEmitter } from 'events';
import { ConfigManager } from '../utils/config-manager';
export interface AlertFilter {
    platform?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}
export interface Alert {
    id: string;
    platform: string;
    threat: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    createdAt: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    metadata: Record<string, any>;
}
export interface AlertStats {
    totalAlerts: number;
    activeAlerts: number;
    acknowledgedAlerts: number;
    escalatedAlerts: number;
    avgResponseTime: number;
    bySeverity: Record<string, number>;
    byPlatform: Record<string, number>;
}
export declare class SecurityMonitor extends EventEmitter {
    private config;
    private alerts;
    private monitoringInterval;
    constructor(config: ConfigManager);
    getActiveAlerts(filter?: AlertFilter): Promise<Alert[]>;
    acknowledgeAlert(alertId: string, options?: {
        reason?: string;
        acknowledgedBy?: string;
    }): Promise<boolean>;
    escalateAlert(alertId: string, options: {
        reason?: string;
        newSeverity: 'low' | 'medium' | 'high' | 'critical';
        escalatedBy?: string;
    }): Promise<boolean>;
    createAlert(options: {
        platform: string;
        threat: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        title: string;
        description: string;
        metadata?: Record<string, any>;
    }): Promise<Alert>;
    getAlertHistory(options: {
        days: number;
        platform?: string;
    }): Promise<Array<{
        date: string;
        platform?: string;
        severity?: string;
        count: number;
    }>>;
    getAlertStats(options: {
        platform?: string;
        period: 'today' | 'week' | 'month' | 'all';
    }): Promise<AlertStats>;
    startRealTimeMonitoring(options: {
        platform?: string;
        minSeverity: 'low' | 'medium' | 'high' | 'critical';
        interval: number;
    }): Promise<void>;
    stopRealTimeMonitoring(): void;
    getAlert(id: string): Alert | undefined;
    getAllAlerts(): Alert[];
}
//# sourceMappingURL=monitor.d.ts.map