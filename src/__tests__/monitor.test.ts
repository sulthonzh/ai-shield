import { SecurityMonitor, AlertFilter } from '../security/monitor';
import { ConfigManager } from '../utils/config-manager';

jest.mock('../utils/config-manager');

describe('SecurityMonitor', () => {
  let monitor: SecurityMonitor;
  let mockConfig: jest.Mocked<ConfigManager>;

  beforeEach(() => {
    mockConfig = new ConfigManager() as jest.Mocked<ConfigManager>;
    monitor = new SecurityMonitor(mockConfig);
  });

  describe('createAlert', () => {
    it('should create an alert and return it', async () => {
      const alert = await monitor.createAlert({
        platform: 'openai',
        threat: 'prompt-injection',
        severity: 'high',
        title: 'Test Alert',
        description: 'Test description',
      });
      expect(alert).toBeDefined();
      expect(alert.id).toBeDefined();
      expect(alert.platform).toBe('openai');
      expect(alert.severity).toBe('high');
      expect(alert.acknowledged).toBe(false);
    });

    it('should generate unique alert IDs', async () => {
      const alert1 = await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'low', title: 'A1', description: 'D1',
      });
      // Add small delay to ensure different Date.now()
      await new Promise(r => setTimeout(r, 10));
      const alert2 = await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'low', title: 'A2', description: 'D2',
      });
      expect(alert1.id).not.toBe(alert2.id);
    });

    it('should store metadata when provided', async () => {
      const alert = await monitor.createAlert({
        platform: 'openai', threat: 't', severity: 'low', title: 'A', description: 'D',
        metadata: { source: 'test' },
      });
      expect(alert.metadata).toEqual({ source: 'test' });
    });
  });

  describe('getActiveAlerts', () => {
    it('should return unacknowledged alerts', async () => {
      await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1' });
      await monitor.createAlert({ platform: 'anthropic', threat: 't', severity: 'low', title: 'A2', description: 'D2' });
      const alerts = await monitor.getActiveAlerts();
      expect(alerts.length).toBe(2);
    });

    it('should filter by platform', async () => {
      await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1' });
      await monitor.createAlert({ platform: 'anthropic', threat: 't', severity: 'low', title: 'A2', description: 'D2' });
      const filter: AlertFilter = { platform: 'openai' };
      const alerts = await monitor.getActiveAlerts(filter);
      expect(alerts.length).toBe(1);
      expect(alerts[0].platform).toBe('openai');
    });

    it('should filter by severity', async () => {
      await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1' });
      await monitor.createAlert({ platform: 'anthropic', threat: 't', severity: 'low', title: 'A2', description: 'D2' });
      const filter: AlertFilter = { severity: 'high' };
      const alerts = await monitor.getActiveAlerts(filter);
      expect(alerts.length).toBe(1);
      expect(alerts[0].severity).toBe('high');
    });

    it('should filter by both platform and severity', async () => {
      await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1' });
      await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'low', title: 'A2', description: 'D2' });
      await monitor.createAlert({ platform: 'anthropic', threat: 't', severity: 'high', title: 'A3', description: 'D3' });
      const filter: AlertFilter = { platform: 'openai', severity: 'high' };
      const alerts = await monitor.getActiveAlerts(filter);
      expect(alerts.length).toBe(1);
    });

    it('should exclude acknowledged alerts', async () => {
      const alert = await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1' });
      await monitor.acknowledgeAlert(alert.id, { acknowledgedBy: 'admin' });
      const alerts = await monitor.getActiveAlerts();
      expect(alerts.length).toBe(0);
    });
  });

  describe('acknowledgeAlert', () => {
    it('should mark alert as acknowledged', async () => {
      const alert = await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1' });
      const result = await monitor.acknowledgeAlert(alert.id, { acknowledgedBy: 'admin' });
      expect(result).toBe(true);
      const active = await monitor.getActiveAlerts();
      expect(active.length).toBe(0);
    });

    it('should return false for non-existent alert', async () => {
      const result = await monitor.acknowledgeAlert('nonexistent', { acknowledgedBy: 'admin' });
      expect(result).toBe(false);
    });

    it('should default acknowledgedBy to "user" when not specified', async () => {
      const alert = await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1' });
      const result = await monitor.acknowledgeAlert(alert.id, {});
      expect(result).toBe(true);
      const active = await monitor.getActiveAlerts();
      expect(active.length).toBe(0);
    });
  });

  describe('escalateAlert', () => {
    it('should change alert severity', async () => {
      const alert = await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'low', title: 'A1', description: 'D1' });
      const result = await monitor.escalateAlert(alert.id, { newSeverity: 'critical', escalatedBy: 'admin' });
      expect(result).toBe(true);
    });

    it('should return false for non-existent alert', async () => {
      const result = await monitor.escalateAlert('nonexistent', { newSeverity: 'high' });
      expect(result).toBe(false);
    });
  });

  describe('getAlertStats', () => {
    it('should return alert statistics', async () => {
      await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1' });
      await monitor.createAlert({ platform: 'anthropic', threat: 't', severity: 'critical', title: 'A2', description: 'D2' });
      await monitor.createAlert({ platform: 'google', threat: 't', severity: 'low', title: 'A3', description: 'D3' });
      const stats = await monitor.getAlertStats({ period: 'all' });
      expect(stats).toHaveProperty('totalAlerts');
      expect(stats.totalAlerts).toBe(3);
    });

    it('should handle empty state', async () => {
      const stats = await monitor.getAlertStats({ period: 'all' });
      expect(stats.totalAlerts).toBe(0);
    });
  });

  describe('getAlertHistory', () => {
    it('should return alert history', async () => {
      await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1' });
      const history = await monitor.getAlertHistory({ days: 7 });
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should filter history by platform', async () => {
      await monitor.createAlert({ platform: 'openai', threat: 't', severity: 'high', title: 'A1', description: 'D1' });
      await monitor.createAlert({ platform: 'anthropic', threat: 't', severity: 'low', title: 'A2', description: 'D2' });
      const history = await monitor.getAlertHistory({ days: 7, platform: 'openai' });
      expect(history.length).toBe(1);
    });
  });
});
