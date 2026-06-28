import { EventEmitter } from 'events';
import { ConfigManager } from '../utils/config-manager';
import { ThreatDetection } from '../types';

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
  metadata: Record<string, unknown>;
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

export class SecurityMonitor extends EventEmitter {
  private config: ConfigManager;
  private alerts: Map<string, Alert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(config: ConfigManager) {
    super();
    this.config = config;
  }

  async getActiveAlerts(filter?: AlertFilter): Promise<Alert[]> {
    const alerts = Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged);

    let filtered = alerts;

    if (filter?.platform) {
      filtered = filtered.filter(alert => alert.platform === filter.platform);
    }

    if (filter?.severity) {
      filtered = filtered.filter(alert => alert.severity === filter.severity);
    }

    return filtered;
  }

  async acknowledgeAlert(alertId: string, options: {
    reason?: string;
    acknowledgedBy?: string;
  } = {}): Promise<boolean> {
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

  async escalateAlert(alertId: string, options: {
    reason?: string;
    newSeverity: 'low' | 'medium' | 'high' | 'critical';
    escalatedBy?: string;
  }): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.severity = options.newSeverity;
    this.emit('alert:escalated', alert);
    return true;
  }

  async createAlert(options: {
    platform: string;
    threat: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    metadata?: Record<string, unknown>;
  }): Promise<Alert> {
    const alert: Alert = {
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

  async getAlertHistory(options: {
    days: number;
    platform?: string;
  }): Promise<Array<{
    date: string;
    platform?: string;
    severity?: string;
    count: number;
  }>> {
    const days = options.days;
    const history = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const alerts = Array.from(this.alerts.values())
        .filter(alert => 
          alert.createdAt.toISOString().split('T')[0] === dateStr &&
          (!options.platform || alert.platform === options.platform)
        );

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

  async getAlertStats(options: {
    platform?: string;
    period: 'today' | 'week' | 'month' | 'all';
  }): Promise<AlertStats> {
    const now = new Date();
    let alerts = Array.from(this.alerts.values());

    // Filter by period
    if (options.period === 'today') {
      const today = now.toDateString();
      alerts = alerts.filter(alert => alert.createdAt.toDateString() === today);
    } else if (options.period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      alerts = alerts.filter(alert => alert.createdAt >= weekAgo);
    } else if (options.period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      alerts = alerts.filter(alert => alert.createdAt >= monthAgo);
    }

    // Filter by platform if specified
    if (options.platform) {
      alerts = alerts.filter(alert => alert.platform === options.platform);
    }

    const stats: AlertStats = {
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter(a => !a.acknowledged).length,
      acknowledgedAlerts: alerts.filter(a => a.acknowledged).length,
      escalatedAlerts: alerts.filter(a => a.severity === 'critical').length,
      avgResponseTime: 120, // Mock average response time
      bySeverity: {},
      byPlatform: {}
    };

    // Count by severity
    alerts.forEach(alert => {
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
    });

    // Count by platform
    alerts.forEach(alert => {
      stats.byPlatform[alert.platform] = (stats.byPlatform[alert.platform] || 0) + 1;
    });

    return stats;
  }

  async startRealTimeMonitoring(options: {
    platform?: string;
    minSeverity: 'low' | 'medium' | 'high' | 'critical';
    interval: number;
  }): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    console.log(`Starting real-time monitoring with ${options.interval}ms interval`);

    this.monitoringInterval = setInterval(async () => {
      try {
        // Simulate threat detection
        const mockThreat: ThreatDetection = {
          id: `threat-${Date.now()}`,
          type: 'prompt-injection',
          severity: options.minSeverity,
          platform: options.platform || 'openai',
          description: 'Potential threat detected',
          detectedAt: new Date(),
          status: 'active',
          confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
          evidence: {
            timestamp: new Date().toISOString(),
            source: 'real-time-monitor'
          }
        };

        // Create alert from detected threat
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
      } catch (error) {
        console.error('Error during real-time monitoring:', error);
      }
    }, options.interval);

    // Stop monitoring on process exit
    process.on('SIGINT', () => {
      this.stopRealTimeMonitoring();
    });
  }

  stopRealTimeMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Real-time monitoring stopped');
    }
  }

  getAlert(id: string): Alert | undefined {
    return this.alerts.get(id);
  }

  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }
}