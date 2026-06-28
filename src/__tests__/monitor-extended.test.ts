import { SecurityMonitor } from '../security/monitor';
import { ConfigManager } from '../utils/config-manager';

jest.mock('../utils/config-manager');

describe('SecurityMonitor Extended', () => {
  let monitor: SecurityMonitor;
  let mockConfig: jest.Mocked<ConfigManager>;

  beforeEach(() => {
    mockConfig = new ConfigManager() as jest.Mocked<ConfigManager>;
    monitor = new SecurityMonitor(mockConfig);
  });

  describe('getAlert', () => {
    it('should return alert by ID', async () => {
      const created = await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A', description: 'D',
      });
      const found = monitor.getAlert(created.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
    });

    it('should return undefined for non-existent ID', () => {
      const found = monitor.getAlert('fake-id');
      expect(found).toBeUndefined();
    });
  });

  describe('getAllAlerts', () => {
    it('should return all alerts including acknowledged', async () => {
      const a1 = await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1',
      });
      await monitor.createAlert({
        platform: 'anthropic', threat: 't', severity: 'low', title: 'A2', description: 'D2',
      });
      await monitor.acknowledgeAlert(a1.id, { acknowledgedBy: 'admin' });
      const all = monitor.getAllAlerts();
      expect(all.length).toBe(2);
    });

    it('should return empty array when no alerts exist', () => {
      expect(monitor.getAllAlerts()).toEqual([]);
    });
  });

  describe('getAlertStats - period filtering', () => {
    it('should filter by today period', async () => {
      await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A', description: 'D',
      });
      const stats = await monitor.getAlertStats({ period: 'today' });
      expect(stats.totalAlerts).toBe(1);
    });

    it('should filter by week period', async () => {
      await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A', description: 'D',
      });
      const stats = await monitor.getAlertStats({ period: 'week' });
      expect(stats.totalAlerts).toBe(1);
    });

    it('should filter by month period', async () => {
      await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A', description: 'D',
      });
      const stats = await monitor.getAlertStats({ period: 'month' });
      expect(stats.totalAlerts).toBe(1);
    });

    it('should filter by platform', async () => {
      await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1',
      });
      await monitor.createAlert({
        platform: 'anthropic', threat: 't', severity: 'low', title: 'A2', description: 'D2',
      });
      const stats = await monitor.getAlertStats({ period: 'all', platform: 'openai' });
      expect(stats.totalAlerts).toBe(1);
      expect(stats.byPlatform.openai).toBe(1);
    });

    it('should compute bySeverity correctly', async () => {
      await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1',
      });
      await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'critical', title: 'A2', description: 'D2',
      });
      await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A3', description: 'D3',
      });
      const stats = await monitor.getAlertStats({ period: 'all' });
      expect(stats.bySeverity.high).toBe(2);
      expect(stats.bySeverity.critical).toBe(1);
      expect(stats.escalatedAlerts).toBe(1);
    });

    it('should compute acknowledged count', async () => {
      const a1 = await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1',
      });
      await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'low', title: 'A2', description: 'D2',
      });
      await monitor.acknowledgeAlert(a1.id, { acknowledgedBy: 'admin' });
      const stats = await monitor.getAlertStats({ period: 'all' });
      expect(stats.acknowledgedAlerts).toBe(1);
      expect(stats.activeAlerts).toBe(1);
    });
  });

  describe('escalateAlert', () => {
    it('should emit alert:escalated event', async () => {
      const alert = await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'low', title: 'A', description: 'D',
      });
      const listener = jest.fn();
      monitor.on('alert:escalated', listener);
      await monitor.escalateAlert(alert.id, { newSeverity: 'critical', escalatedBy: 'admin' });
      expect(listener).toHaveBeenCalled();
    });

    it('should update severity on alert', async () => {
      const alert = await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'low', title: 'A', description: 'D',
      });
      await monitor.escalateAlert(alert.id, { newSeverity: 'critical' });
      const updated = monitor.getAlert(alert.id);
      expect(updated!.severity).toBe('critical');
    });
  });

  describe('acknowledgeAlert', () => {
    it('should set acknowledgedBy to provided user', async () => {
      const alert = await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A', description: 'D',
      });
      await monitor.acknowledgeAlert(alert.id, { acknowledgedBy: 'sec-team', reason: 'resolved' });
      const updated = monitor.getAlert(alert.id);
      expect(updated!.acknowledgedBy).toBe('sec-team');
      expect(updated!.acknowledged).toBe(true);
    });

    it('should emit alert:acknowledged event', async () => {
      const alert = await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A', description: 'D',
      });
      const listener = jest.fn();
      monitor.on('alert:acknowledged', listener);
      await monitor.acknowledgeAlert(alert.id, { acknowledgedBy: 'admin' });
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('createAlert', () => {
    it('should emit alert:created event', async () => {
      const listener = jest.fn();
      monitor.on('alert:created', listener);
      await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A', description: 'D',
      });
      expect(listener).toHaveBeenCalled();
    });

    it('should default metadata to empty object', async () => {
      const alert = await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A', description: 'D',
      });
      expect(alert.metadata).toEqual({});
    });
  });

  describe('getAlertHistory - edge cases', () => {
    it('should return empty history when no alerts match', async () => {
      const history = await monitor.getAlertHistory({ days: 7 });
      expect(history).toEqual([]);
    });

    it('should return history without platform filter', async () => {
      await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'high', title: 'A', description: 'D',
      });
      const history = await monitor.getAlertHistory({ days: 1 });
      expect(history.length).toBe(1);
      expect(history[0].count).toBe(1);
    });
  });

  describe('stopRealTimeMonitoring', () => {
    it('should do nothing when not monitoring', () => {
      expect(() => monitor.stopRealTimeMonitoring()).not.toThrow();
    });

    it('should clear interval and log when stopping', async () => {
      // Start monitoring with a long interval to avoid creating mock threats
      await monitor.startRealTimeMonitoring({
        minSeverity: 'high',
        interval: 999999,
      });
      const spy = jest.spyOn(console, 'log').mockImplementation();
      monitor.stopRealTimeMonitoring();
      expect(spy).toHaveBeenCalledWith('Real-time monitoring stopped');
      spy.mockRestore();
    });
  });

  describe('startRealTimeMonitoring', () => {
    it('should clear existing interval before starting new one', async () => {
      const spy = jest.spyOn(console, 'log').mockImplementation();
      await monitor.startRealTimeMonitoring({
        minSeverity: 'high',
        interval: 999999,
      });
      await monitor.startRealTimeMonitoring({
        minSeverity: 'low',
        interval: 999999,
      });
      // Should have logged "Starting..." twice and not error
      expect(spy).toHaveBeenCalledTimes(2);
      monitor.stopRealTimeMonitoring();
      spy.mockRestore();
    });
  });
});
