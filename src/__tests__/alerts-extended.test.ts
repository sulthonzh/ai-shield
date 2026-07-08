import { SecurityMonitor } from '../security/monitor';
import { ConfigManager } from '../utils/config-manager';

// Mock fs and path globally before any imports
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(false),
  readFileSync: jest.fn().mockReturnValue('{}'),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn().mockReturnValue(''),
  unlinkSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue([]),
  statSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/tmp/test-config.json'),
  dirname: jest.fn().mockReturnValue('/tmp'),
  basename: jest.fn().mockReturnValue('test-config.json'),
  extname: jest.fn().mockReturnValue('.json'),
  resolve: jest.fn().mockReturnValue('/tmp/test-config.json'),
}));

describe('Alerts Command — List', () => {
  let monitor: SecurityMonitor;

  beforeEach(async () => {
    jest.clearAllMocks();
    const config = new ConfigManager();
    monitor = new SecurityMonitor(config);
    // Seed some alerts
    await monitor.createAlert({
      platform: 'openai',
      threat: 'prompt-injection',
      severity: 'high',
      title: 'Test Alert 1',
      description: 'Test description 1',
    });
    await monitor.createAlert({
      platform: 'anthropic',
      threat: 'data-leakage',
      severity: 'critical',
      title: 'Test Alert 2',
      description: 'Test description 2',
    });
    await monitor.createAlert({
      platform: 'openai',
      threat: 'policy-violation',
      severity: 'low',
      title: 'Test Alert 3',
      description: 'Test description 3',
    });
  });

  it('should list all active alerts', async () => {
    const alerts = await monitor.getActiveAlerts();
    expect(alerts).toHaveLength(3);
    expect(alerts[0].title).toBe('Test Alert 1');
    expect(alerts[1].title).toBe('Test Alert 2');
    expect(alerts[2].title).toBe('Test Alert 3');
  });

  it('should filter alerts by platform', async () => {
    const alerts = await monitor.getActiveAlerts({ platform: 'openai' });
    expect(alerts).toHaveLength(2);
    expect(alerts.every(a => a.platform === 'openai')).toBe(true);
  });

  it('should filter alerts by severity', async () => {
    const alerts = await monitor.getActiveAlerts({ severity: 'critical' });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('critical');
  });

  it('should filter alerts by platform and severity', async () => {
    const alerts = await monitor.getActiveAlerts({ platform: 'openai', severity: 'high' });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].title).toBe('Test Alert 1');
  });

  it('should return empty array when no alerts match filter', async () => {
    const alerts = await monitor.getActiveAlerts({ platform: 'google' });
    expect(alerts).toHaveLength(0);
  });

  it('should return empty array when no active alerts exist', async () => {
    const config = new ConfigManager();
    const emptyMonitor = new SecurityMonitor(config);
    const alerts = await emptyMonitor.getActiveAlerts();
    expect(alerts).toHaveLength(0);
  });

  it('should only show unacknowledged alerts', async () => {
    const alertsBefore = await monitor.getActiveAlerts();
    expect(alertsBefore).toHaveLength(3);

    // Acknowledge one
    await monitor.acknowledgeAlert(alertsBefore[0].id, { acknowledgedBy: 'test' });

    const alertsAfter = await monitor.getActiveAlerts();
    expect(alertsAfter).toHaveLength(2);
    expect(alertsAfter.find(a => a.id === alertsBefore[0].id)).toBeUndefined();
  });
});

describe('Alerts Command — Acknowledge', () => {
  let monitor: SecurityMonitor;

  beforeEach(async () => {
    jest.clearAllMocks();
    const config = new ConfigManager();
    monitor = new SecurityMonitor(config);
    await monitor.createAlert({
      platform: 'openai',
      threat: 'prompt-injection',
      severity: 'high',
      title: 'Test Alert',
      description: 'Test description',
    });
  });

  it('should acknowledge an existing alert', async () => {
    const alerts = await monitor.getActiveAlerts();
    const alertId = alerts[0].id;

    const result = await monitor.acknowledgeAlert(alertId, {
      reason: 'Resolved',
      acknowledgedBy: 'admin',
    });

    expect(result).toBe(true);
    const alert = monitor.getAlert(alertId);
    expect(alert?.acknowledged).toBe(true);
    expect(alert?.acknowledgedBy).toBe('admin');
    expect(alert?.acknowledgedAt).toBeInstanceOf(Date);
  });

  it('should acknowledge with default user when no acknowledgedBy provided', async () => {
    const alerts = await monitor.getActiveAlerts();
    const alertId = alerts[0].id;

    const result = await monitor.acknowledgeAlert(alertId);

    expect(result).toBe(true);
    const alert = monitor.getAlert(alertId);
    expect(alert?.acknowledgedBy).toBe('user');
  });

  it('should return false for non-existent alert', async () => {
    const result = await monitor.acknowledgeAlert('nonexistent-id', {});
    expect(result).toBe(false);
  });

  it('should emit alert:acknowledged event', async () => {
    const alerts = await monitor.getActiveAlerts();
    const alertId = alerts[0].id;

    const handler = jest.fn();
    monitor.on('alert:acknowledged', handler);

    await monitor.acknowledgeAlert(alertId, { acknowledgedBy: 'test' });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].id).toBe(alertId);
  });
});

describe('Alerts Command — Create', () => {
  let monitor: SecurityMonitor;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = new ConfigManager();
    monitor = new SecurityMonitor(config);
  });

  it('should create an alert with all fields', async () => {
    const alert = await monitor.createAlert({
      platform: 'openai',
      threat: 'prompt-injection',
      severity: 'critical',
      title: 'Critical Threat',
      description: 'A critical threat was detected',
      metadata: { source: 'test', score: 0.95 },
    });

    expect(alert.id).toMatch(/^alert-\d+-/);
    expect(alert.platform).toBe('openai');
    expect(alert.threat).toBe('prompt-injection');
    expect(alert.severity).toBe('critical');
    expect(alert.title).toBe('Critical Threat');
    expect(alert.description).toBe('A critical threat was detected');
    expect(alert.acknowledged).toBe(false);
    expect(alert.metadata).toEqual({ source: 'test', score: 0.95 });
  });

  it('should create an alert with default metadata', async () => {
    const alert = await monitor.createAlert({
      platform: 'anthropic',
      threat: 'data-leakage',
      severity: 'medium',
      title: 'Data Leak',
      description: 'Potential data leak',
    });

    expect(alert.metadata).toEqual({});
  });

  it('should generate unique IDs for each alert', async () => {
    const alert1 = await monitor.createAlert({
      platform: 'openai', threat: 'a', severity: 'low', title: 'A', description: 'a',
    });
    const alert2 = await monitor.createAlert({
      platform: 'openai', threat: 'b', severity: 'low', title: 'B', description: 'b',
    });

    expect(alert1.id).not.toBe(alert2.id);
  });

  it('should emit alert:created event', async () => {
    const handler = jest.fn();
    monitor.on('alert:created', handler);

    await monitor.createAlert({
      platform: 'openai', threat: 'test', severity: 'low', title: 'Test', description: 'test',
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].title).toBe('Test');
  });

  it('should store alert in monitor', async () => {
    const alert = await monitor.createAlert({
      platform: 'google', threat: 'hallucination', severity: 'medium', title: 'Hallucination', description: 'AI hallucination',
    });

    const retrieved = monitor.getAlert(alert.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Hallucination');
  });
});

describe('Alerts Command — Stats', () => {
  let monitor: SecurityMonitor;

  beforeEach(async () => {
    jest.clearAllMocks();
    const config = new ConfigManager();
    monitor = new SecurityMonitor(config);

    // Create alerts with different severities and platforms
    await monitor.createAlert({ platform: 'openai', threat: 'a', severity: 'high', title: 'A', description: 'a' });
    await monitor.createAlert({ platform: 'openai', threat: 'b', severity: 'low', title: 'B', description: 'b' });
    await monitor.createAlert({ platform: 'anthropic', threat: 'c', severity: 'critical', title: 'C', description: 'c' });
    await monitor.createAlert({ platform: 'anthropic', threat: 'd', severity: 'critical', title: 'D', description: 'd' });

    // Acknowledge one
    const alerts = monitor.getAllAlerts();
    await monitor.acknowledgeAlert(alerts[0].id, {});
  });

  it('should return correct stats for all alerts', async () => {
    const stats = await monitor.getAlertStats({ period: 'all' });

    expect(stats.totalAlerts).toBe(4);
    expect(stats.activeAlerts).toBe(3);
    expect(stats.acknowledgedAlerts).toBe(1);
    expect(stats.escalatedAlerts).toBe(2); // critical alerts
  });

  it('should return correct bySeverity counts', async () => {
    const stats = await monitor.getAlertStats({ period: 'all' });

    expect(stats.bySeverity['high']).toBe(1);
    expect(stats.bySeverity['low']).toBe(1);
    expect(stats.bySeverity['critical']).toBe(2);
  });

  it('should return correct byPlatform counts', async () => {
    const stats = await monitor.getAlertStats({ period: 'all' });

    expect(stats.byPlatform['openai']).toBe(2);
    expect(stats.byPlatform['anthropic']).toBe(2);
  });

  it('should filter stats by platform', async () => {
    const stats = await monitor.getAlertStats({ period: 'all', platform: 'openai' });

    expect(stats.totalAlerts).toBe(2);
    expect(stats.byPlatform['openai']).toBe(2);
    expect(stats.byPlatform['anthropic']).toBeUndefined();
  });

  it('should return empty stats for non-existent platform', async () => {
    const stats = await monitor.getAlertStats({ period: 'all', platform: 'google' });

    expect(stats.totalAlerts).toBe(0);
    expect(stats.activeAlerts).toBe(0);
    expect(stats.acknowledgedAlerts).toBe(0);
  });

  it('should return empty stats when no alerts exist', async () => {
    const config = new ConfigManager();
    const emptyMonitor = new SecurityMonitor(config);
    const stats = await emptyMonitor.getAlertStats({ period: 'all' });

    expect(stats.totalAlerts).toBe(0);
    expect(stats.activeAlerts).toBe(0);
    expect(stats.acknowledgedAlerts).toBe(0);
    expect(stats.escalatedAlerts).toBe(0);
  });
});

describe('Alerts Command — Escalate', () => {
  let monitor: SecurityMonitor;

  beforeEach(async () => {
    jest.clearAllMocks();
    const config = new ConfigManager();
    monitor = new SecurityMonitor(config);
    await monitor.createAlert({
      platform: 'openai', threat: 'test', severity: 'low', title: 'Test', description: 'test',
    });
  });

  it('should escalate an alert severity', async () => {
    const alerts = await monitor.getActiveAlerts();
    const alertId = alerts[0].id;

    const result = await monitor.escalateAlert(alertId, {
      newSeverity: 'critical',
      reason: 'Severity increased',
      escalatedBy: 'admin',
    });

    expect(result).toBe(true);
    const alert = monitor.getAlert(alertId);
    expect(alert?.severity).toBe('critical');
  });

  it('should return false for non-existent alert', async () => {
    const result = await monitor.escalateAlert('nonexistent', {
      newSeverity: 'high',
    });
    expect(result).toBe(false);
  });

  it('should emit alert:escalated event', async () => {
    const alerts = await monitor.getActiveAlerts();
    const alertId = alerts[0].id;

    const handler = jest.fn();
    monitor.on('alert:escalated', handler);

    await monitor.escalateAlert(alertId, { newSeverity: 'high' });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].severity).toBe('high');
  });
});

describe('Alerts Command — Alert History', () => {
  let monitor: SecurityMonitor;

  beforeEach(async () => {
    jest.clearAllMocks();
    const config = new ConfigManager();
    monitor = new SecurityMonitor(config);
    await monitor.createAlert({
      platform: 'openai', threat: 'a', severity: 'low', title: 'A', description: 'a',
    });
  });

  it('should return alert history for today', async () => {
    const history = await monitor.getAlertHistory({ days: 1 });

    expect(history).toHaveLength(1);
    expect(history[0].count).toBe(1);
  });

  it('should return empty history for days with no alerts', async () => {
    const history = await monitor.getAlertHistory({ days: 7 });

    // Only today has an alert
    expect(history).toHaveLength(1);
  });

  it('should filter history by platform', async () => {
    const history = await monitor.getAlertHistory({ days: 1, platform: 'openai' });
    expect(history).toHaveLength(1);
    expect(history[0].platform).toBe('openai');
  });

  it('should return empty history for non-matching platform', async () => {
    const history = await monitor.getAlertHistory({ days: 1, platform: 'google' });
    expect(history).toHaveLength(0);
  });
});

describe('Alerts Command — GetAllAlerts', () => {
  it('should return all alerts including acknowledged', async () => {
    jest.clearAllMocks();
    const config = new ConfigManager();
    const monitor = new SecurityMonitor(config);

    await monitor.createAlert({ platform: 'openai', threat: 'a', severity: 'low', title: 'A', description: 'a' });
    await monitor.createAlert({ platform: 'openai', threat: 'b', severity: 'high', title: 'B', description: 'b' });

    const all = monitor.getAllAlerts();
    expect(all).toHaveLength(2);

    // Acknowledge one
    await monitor.acknowledgeAlert(all[0].id, {});

    // getAllAlerts still returns both
    const allAfter = monitor.getAllAlerts();
    expect(allAfter).toHaveLength(2);
  });
});

describe('Alerts Command — CLI Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear module cache to get fresh imports
    jest.resetModules();
  });

  it('should parse list command with no filters', async () => {
    const { AlertsCommand } = await import('../commands/alerts');
    const config = new ConfigManager();
    const cmd = new AlertsCommand(config);
    expect(cmd).toBeDefined();
    expect(cmd.getMonitor).toBeDefined();
  });

  it('should export AlertsCommand class', async () => {
    const { AlertsCommand } = await import('../commands/alerts');
    const config = new ConfigManager();
    const cmd = new AlertsCommand(config);
    expect(cmd).toBeDefined();
    expect(cmd.getMonitor).toBeDefined();
  });

  it('should accept custom monitor via constructor', async () => {
    const { AlertsCommand } = await import('../commands/alerts');
    const config = new ConfigManager();
    const monitor = new SecurityMonitor(config);
    const cmd = new AlertsCommand(config, monitor);
    expect(cmd.getMonitor()).toBe(monitor);
  });

  it('should create default monitor when none provided', async () => {
    const { AlertsCommand, SecurityMonitor: MonitorFromModule } = await import('../commands/alerts');
    const config = new ConfigManager();
    const cmd = new AlertsCommand(config);
    expect(cmd.getMonitor()).toBeInstanceOf(MonitorFromModule);
  });
});

describe('Alerts Command — Stop Real-time Monitoring', () => {
  it('should stop monitoring and clear interval', () => {
    jest.clearAllMocks();
    const config = new ConfigManager();
    const monitor = new SecurityMonitor(config);

    // stopRealTimeMonitoring should not throw even when not started
    expect(() => monitor.stopRealTimeMonitoring()).not.toThrow();
  });

  it('should log when monitoring stopped', () => {
    jest.clearAllMocks();
    const config = new ConfigManager();
    const monitor = new SecurityMonitor(config);

    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    // Start monitoring with a long interval, then stop
    monitor.startRealTimeMonitoring({ minSeverity: 'low', interval: 60000 });
    monitor.stopRealTimeMonitoring();

    expect(logSpy).toHaveBeenCalledWith('Real-time monitoring stopped');
    logSpy.mockRestore();
  });
});

describe('Alerts Command — GetAlert', () => {
  it('should return undefined for non-existent alert', () => {
    jest.clearAllMocks();
    const config = new ConfigManager();
    const monitor = new SecurityMonitor(config);

    const result = monitor.getAlert('nonexistent');
    expect(result).toBeUndefined();
  });

  it('should return alert for existing id', async () => {
    jest.clearAllMocks();
    const config = new ConfigManager();
    const monitor = new SecurityMonitor(config);

    const created = await monitor.createAlert({
      platform: 'openai', threat: 'test', severity: 'low', title: 'Test', description: 'test',
    });

    const retrieved = monitor.getAlert(created.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
  });
});
