"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityMonitor = void 0;
const events_1 = require("events");
class SecurityMonitor extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.alerts = new Map();
        this.monitoringInterval = null;
        this.config = config;
    }
    async getActiveAlerts(filter) {
        const alerts = Array.from(this.alerts.values())
            .filter(alert => !alert.acknowledged);
        if (filter?.platform) {
            alerts.filter(alert => alert.platform === filter.platform);
        }
        if (filter?.severity) {
            alerts.filter(alert => alert.severity === filter.severity);
        }
        return alerts;
    }
    async acknowledgeAlert(alertId, options = {}) {
        const alert = this.alerts.get(alertId);
        if (!alert) {
            return false;
        }
        alert.acknowledged = true;
        alert.acknowledgedBy = options.acknowledgedBy || 'user';
        alert.acknowledgedAt = new Date();
        this.emit('alert:acknowledged', alert);
        return true;
    }
    async escalateAlert(alertId, options) {
        const alert = this.alerts.get(alertId);
        if (!alert) {
            return false;
        }
        alert.severity = options.newSeverity;
        this.emit('alert:escalated', alert);
        return true;
    }
    async createAlert(options) {
        const alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            platform: options.platform,
            threat: options.threat,
            severity: options.severity,
            title: options.title,
            description: options.description,
            createdAt: new Date(),
            acknowledged: false,
            metadata: options.metadata || {}
        };
        this.alerts.set(alert.id, alert);
        this.emit('alert:created', alert);
        return alert;
    }
    async getAlertHistory(options) {
        const days = options.days;
        const history = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const alerts = Array.from(this.alerts.values())
                .filter(alert => alert.createdAt.toISOString().split('T')[0] === dateStr &&
                (!options.platform || alert.platform === options.platform));
            if (alerts.length > 0) {
                history.push({
                    date: dateStr,
                    platform: options.platform,
                    count: alerts.length
                });
            }
        }
        return history;
    }
    async getAlertStats(options) {
        const now = new Date();
        let alerts = Array.from(this.alerts.values());
        if (options.period === 'today') {
            const today = now.toDateString();
            alerts = alerts.filter(alert => alert.createdAt.toDateString() === today);
        }
        else if (options.period === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            alerts = alerts.filter(alert => alert.createdAt >= weekAgo);
        }
        else if (options.period === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            alerts = alerts.filter(alert => alert.createdAt >= monthAgo);
        }
        if (options.platform) {
            alerts = alerts.filter(alert => alert.platform === options.platform);
        }
        const stats = {
            totalAlerts: alerts.length,
            activeAlerts: alerts.filter(a => !a.acknowledged).length,
            acknowledgedAlerts: alerts.filter(a => a.acknowledged).length,
            escalatedAlerts: alerts.filter(a => a.severity === 'critical').length,
            avgResponseTime: 120,
            bySeverity: {},
            byPlatform: {}
        };
        alerts.forEach(alert => {
            stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
        });
        alerts.forEach(alert => {
            stats.byPlatform[alert.platform] = (stats.byPlatform[alert.platform] || 0) + 1;
        });
        return stats;
    }
    async startRealTimeMonitoring(options) {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        console.log(`Starting real-time monitoring with ${options.interval}ms interval`);
        this.monitoringInterval = setInterval(async () => {
            try {
                const mockThreat = {
                    id: `threat-${Date.now()}`,
                    type: 'prompt-injection',
                    severity: options.minSeverity,
                    platform: options.platform || 'openai',
                    description: 'Potential threat detected',
                    detectedAt: new Date(),
                    status: 'active',
                    confidence: Math.random() * 0.3 + 0.7,
                    evidence: {
                        timestamp: new Date().toISOString(),
                        source: 'real-time-monitor'
                    }
                };
                await this.createAlert({
                    platform: mockThreat.platform,
                    threat: mockThreat.type,
                    severity: mockThreat.severity,
                    title: `Threat Detected: ${mockThreat.type}`,
                    description: mockThreat.description,
                    metadata: mockThreat.evidence
                });
                this.emit('threat:detected', mockThreat);
                console.log(`🚨 Threat detected: ${mockThreat.id} - ${mockThreat.severity}`);
            }
            catch (error) {
                console.error('Error during real-time monitoring:', error);
            }
        }, options.interval);
        process.on('SIGINT', () => {
            this.stopRealTimeMonitoring();
        });
    }
    stopRealTimeMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('Real-time monitoring stopped');
        }
    }
    getAlert(id) {
        return this.alerts.get(id);
    }
    getAllAlerts() {
        return Array.from(this.alerts.values());
    }
}
exports.SecurityMonitor = SecurityMonitor;
