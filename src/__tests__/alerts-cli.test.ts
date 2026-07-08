// Mock SecurityMonitor before any imports
const mockGetActiveAlerts = jest.fn();
const mockAcknowledgeAlert = jest.fn();
const mockCreateAlert = jest.fn();
const mockGetAlertStats = jest.fn();

jest.mock('../security/monitor', () => ({
  SecurityMonitor: jest.fn().mockImplementation(() => ({
    getActiveAlerts: mockGetActiveAlerts,
    acknowledgeAlert: mockAcknowledgeAlert,
    createAlert: mockCreateAlert,
    getAlertStats: mockGetAlertStats,
    startRealTimeMonitoring: jest.fn(),
    stopRealTimeMonitoring: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
  })),
}));

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

import { listAction, acknowledgeAction, createAction, statsAction } from '../commands/alerts';
import { SecurityMonitor } from '../security/monitor';
import { ConfigManager } from '../utils/config-manager';

function makeMockMonitor(): SecurityMonitor {
  return new SecurityMonitor(new ConfigManager());
}

// Helper: catch process.exit throws
async function runSafe(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch {
    // process.exit throws - expected
  }
}

describe('Alerts CLI — listAction', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should display alerts in table format', async () => {
    const monitor = makeMockMonitor();
    mockGetActiveAlerts.mockResolvedValue([
      { id: 'alert-1', severity: 'high', platform: 'openai', title: 'Test Alert 1' },
      { id: 'alert-2', severity: 'critical', platform: 'anthropic', title: 'Test Alert 2' },
    ]);

    await runSafe(() => listAction({ format: 'table', limit: '20' }, monitor));

    expect(mockGetActiveAlerts).toHaveBeenCalledWith(undefined);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Active Security Alerts'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('alert-1'));
  });

  it('should display "No active alerts found" when empty', async () => {
    const monitor = makeMockMonitor();
    mockGetActiveAlerts.mockResolvedValue([]);

    await runSafe(() => listAction({ format: 'table', limit: '20' }, monitor));

    expect(logSpy).toHaveBeenCalledWith('No active alerts found.');
  });

  it('should output JSON format when format is json', async () => {
    const monitor = makeMockMonitor();
    const mockAlerts = [{ id: 'alert-1', severity: 'high', platform: 'openai', title: 'Test' }];
    mockGetActiveAlerts.mockResolvedValue(mockAlerts);

    await runSafe(() => listAction({ format: 'json', limit: '20' }, monitor));

    expect(logSpy).toHaveBeenCalledWith(JSON.stringify(mockAlerts, null, 2));
  });

  it('should pass platform filter to monitor', async () => {
    const monitor = makeMockMonitor();
    mockGetActiveAlerts.mockResolvedValue([]);

    await runSafe(() => listAction({ format: 'table', limit: '20', platform: 'openai' }, monitor));

    expect(mockGetActiveAlerts).toHaveBeenCalledWith({ platform: 'openai' });
  });

  it('should pass severity filter to monitor', async () => {
    const monitor = makeMockMonitor();
    mockGetActiveAlerts.mockResolvedValue([]);

    await runSafe(() => listAction({ format: 'table', limit: '20', severity: 'critical' }, monitor));

    expect(mockGetActiveAlerts).toHaveBeenCalledWith({ severity: 'critical' });
  });

  it('should pass both filters to monitor', async () => {
    const monitor = makeMockMonitor();
    mockGetActiveAlerts.mockResolvedValue([]);

    await runSafe(() => listAction({ format: 'table', limit: '20', platform: 'openai', severity: 'high' }, monitor));

    expect(mockGetActiveAlerts).toHaveBeenCalledWith({ platform: 'openai', severity: 'high' });
  });

  it('should respect --limit option', async () => {
    const monitor = makeMockMonitor();
    const alerts = Array.from({ length: 5 }, (_, i) => ({
      id: `alert-${i}`, severity: 'low', platform: 'openai', title: `Alert ${i}`,
    }));
    mockGetActiveAlerts.mockResolvedValue(alerts);

    await runSafe(() => listAction({ format: 'table', limit: '2' }, monitor));

    const calls = logSpy.mock.calls.filter(c => typeof c[0] === 'string' && c[0].startsWith('alert-'));
    expect(calls).toHaveLength(2);
  });

  it('should use default limit of 20 when not provided', async () => {
    const monitor = makeMockMonitor();
    mockGetActiveAlerts.mockResolvedValue([]);

    await runSafe(() => listAction({ format: 'table' }, monitor));

    expect(mockGetActiveAlerts).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const monitor = makeMockMonitor();
    mockGetActiveAlerts.mockRejectedValue(new Error('Database connection failed'));

    await runSafe(() => listAction({ format: 'table', limit: '20' }, monitor));

    expect(errorSpy).toHaveBeenCalledWith('Error:', 'Database connection failed');
  });

  it('should handle unknown error type', async () => {
    const monitor = makeMockMonitor();
    mockGetActiveAlerts.mockRejectedValue('string error');

    await runSafe(() => listAction({ format: 'table', limit: '20' }, monitor));

    expect(errorSpy).toHaveBeenCalledWith('Error:', 'Unknown error');
  });
});

describe('Alerts CLI — acknowledgeAction', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should acknowledge alert successfully', async () => {
    const monitor = makeMockMonitor();
    mockAcknowledgeAlert.mockResolvedValue(true);

    await runSafe(() => acknowledgeAction('alert-123', {}, monitor));

    expect(mockAcknowledgeAlert).toHaveBeenCalledWith('alert-123', expect.objectContaining({ acknowledgedBy: 'cli-user' }));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Alert alert-123 acknowledged'));
  });

  it('should pass reason option', async () => {
    const monitor = makeMockMonitor();
    mockAcknowledgeAlert.mockResolvedValue(true);

    await runSafe(() => acknowledgeAction('alert-456', { reason: 'False positive' }, monitor));

    expect(mockAcknowledgeAlert).toHaveBeenCalledWith('alert-456', expect.objectContaining({ reason: 'False positive' }));
    expect(logSpy).toHaveBeenCalledWith('   Reason: False positive');
  });

  it('should not log reason when not provided', async () => {
    const monitor = makeMockMonitor();
    mockAcknowledgeAlert.mockResolvedValue(true);

    await runSafe(() => acknowledgeAction('alert-789', {}, monitor));

    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('Reason:'));
  });

  it('should exit with error when alert not found', async () => {
    const monitor = makeMockMonitor();
    mockAcknowledgeAlert.mockResolvedValue(false);

    await runSafe(() => acknowledgeAction('nonexistent', {}, monitor));

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('❌ Alert nonexistent not found'));
  });

  it('should handle errors gracefully', async () => {
    const monitor = makeMockMonitor();
    mockAcknowledgeAlert.mockRejectedValue(new Error('Network error'));

    await runSafe(() => acknowledgeAction('alert-1', {}, monitor));

    expect(errorSpy).toHaveBeenCalledWith('Error:', 'Network error');
  });

  it('should handle unknown error type', async () => {
    const monitor = makeMockMonitor();
    mockAcknowledgeAlert.mockRejectedValue(42);

    await runSafe(() => acknowledgeAction('alert-1', {}, monitor));

    expect(errorSpy).toHaveBeenCalledWith('Error:', 'Unknown error');
  });
});

describe('Alerts CLI — createAction', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should create alert with all fields', async () => {
    const monitor = makeMockMonitor();
    mockCreateAlert.mockResolvedValue({ id: 'alert-new-1', severity: 'high', platform: 'openai', title: 'Test Alert' });

    await runSafe(() => createAction({
      platform: 'openai', title: 'Test Alert', severity: 'high',
      threat: 'prompt-injection', description: 'Test description',
    }, monitor));

    expect(mockCreateAlert).toHaveBeenCalledWith(expect.objectContaining({
      platform: 'openai', title: 'Test Alert', severity: 'high',
      threat: 'prompt-injection', description: 'Test description',
    }));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Alert created: alert-new-1'));
  });

  it('should use default severity medium', async () => {
    const monitor = makeMockMonitor();
    mockCreateAlert.mockResolvedValue({ id: 'a', severity: 'medium', platform: 'openai', title: 'T' });

    await runSafe(() => createAction({ platform: 'openai', title: 'Test' }, monitor));

    expect(mockCreateAlert).toHaveBeenCalledWith(expect.objectContaining({ severity: 'medium' }));
  });

  it('should use default threat "unknown" when not provided', async () => {
    const monitor = makeMockMonitor();
    mockCreateAlert.mockResolvedValue({ id: 'a', severity: 'medium', platform: 'openai', title: 'T' });

    await runSafe(() => createAction({ platform: 'openai', title: 'T' }, monitor));

    expect(mockCreateAlert).toHaveBeenCalledWith(expect.objectContaining({ threat: 'unknown' }));
  });

  it('should use empty string for missing description', async () => {
    const monitor = makeMockMonitor();
    mockCreateAlert.mockResolvedValue({ id: 'a', severity: 'medium', platform: 'openai', title: 'T' });

    await runSafe(() => createAction({ platform: 'openai', title: 'T' }, monitor));

    expect(mockCreateAlert).toHaveBeenCalledWith(expect.objectContaining({ description: '' }));
  });

  it('should exit with error when --platform missing', async () => {
    const monitor = makeMockMonitor();

    await runSafe(() => createAction({ title: 'Test' }, monitor));

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('❌ --platform and --title are required'));
  });

  it('should exit with error when --title missing', async () => {
    const monitor = makeMockMonitor();

    await runSafe(() => createAction({ platform: 'openai' }, monitor));

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('❌ --platform and --title are required'));
  });

  it('should exit with error for invalid severity', async () => {
    const monitor = makeMockMonitor();

    await runSafe(() => createAction({ platform: 'openai', title: 'Test', severity: 'invalid' }, monitor));

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('❌ Invalid severity: invalid'));
  });

  it('should handle errors gracefully', async () => {
    const monitor = makeMockMonitor();
    mockCreateAlert.mockRejectedValue(new Error('DB write failed'));

    await runSafe(() => createAction({ platform: 'openai', title: 'Test' }, monitor));

    expect(errorSpy).toHaveBeenCalledWith('Error:', 'DB write failed');
  });

  it('should handle unknown error type', async () => {
    const monitor = makeMockMonitor();
    mockCreateAlert.mockRejectedValue({});

    await runSafe(() => createAction({ platform: 'openai', title: 'Test' }, monitor));

    expect(errorSpy).toHaveBeenCalledWith('Error:', 'Unknown error');
  });
});

describe('Alerts CLI — statsAction', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should display stats with all sections', async () => {
    const monitor = makeMockMonitor();
    mockGetAlertStats.mockResolvedValue({
      totalAlerts: 10, activeAlerts: 7, acknowledgedAlerts: 3, escalatedAlerts: 2,
      avgResponseTime: 120,
      bySeverity: { low: 3, medium: 4, high: 2, critical: 1 },
      byPlatform: { openai: 6, anthropic: 4 },
    });

    await runSafe(() => statsAction({}, monitor));

    expect(mockGetAlertStats).toHaveBeenCalledWith({ period: 'all', platform: undefined });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Security Alert Statistics'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Total Alerts:     10'));
  });

  it('should display bySeverity section when present', async () => {
    const monitor = makeMockMonitor();
    mockGetAlertStats.mockResolvedValue({
      totalAlerts: 5, activeAlerts: 5, acknowledgedAlerts: 0, escalatedAlerts: 0,
      avgResponseTime: 0, bySeverity: { high: 3, critical: 2 }, byPlatform: {},
    });

    await runSafe(() => statsAction({}, monitor));

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('By Severity:'));
  });

  it('should display byPlatform section when present', async () => {
    const monitor = makeMockMonitor();
    mockGetAlertStats.mockResolvedValue({
      totalAlerts: 5, activeAlerts: 5, acknowledgedAlerts: 0, escalatedAlerts: 0,
      avgResponseTime: 0, bySeverity: {}, byPlatform: { openai: 3, anthropic: 2 },
    });

    await runSafe(() => statsAction({}, monitor));

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('By Platform:'));
  });

  it('should not display bySeverity/byPlatform when empty', async () => {
    const monitor = makeMockMonitor();
    mockGetAlertStats.mockResolvedValue({
      totalAlerts: 0, activeAlerts: 0, acknowledgedAlerts: 0, escalatedAlerts: 0,
      avgResponseTime: 0, bySeverity: {}, byPlatform: {},
    });

    await runSafe(() => statsAction({}, monitor));

    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('By Severity:'));
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('By Platform:'));
  });

  it('should pass platform filter to stats', async () => {
    const monitor = makeMockMonitor();
    mockGetAlertStats.mockResolvedValue({
      totalAlerts: 0, activeAlerts: 0, acknowledgedAlerts: 0, escalatedAlerts: 0,
      avgResponseTime: 0, bySeverity: {}, byPlatform: {},
    });

    await runSafe(() => statsAction({ platform: 'openai' }, monitor));

    expect(mockGetAlertStats).toHaveBeenCalledWith({ period: 'all', platform: 'openai' });
  });

  it('should handle errors gracefully', async () => {
    const monitor = makeMockMonitor();
    mockGetAlertStats.mockRejectedValue(new Error('Stats error'));

    await runSafe(() => statsAction({}, monitor));

    expect(errorSpy).toHaveBeenCalledWith('Error:', 'Stats error');
  });

  it('should handle unknown error type', async () => {
    const monitor = makeMockMonitor();
    mockGetAlertStats.mockRejectedValue(null);

    await runSafe(() => statsAction({}, monitor));

    expect(errorSpy).toHaveBeenCalledWith('Error:', 'Unknown error');
  });
});
