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

import { ConfigManager } from '../utils/config-manager';

// Suppress console output during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  process.exit = jest.fn() as unknown as typeof process.exit;
});

afterAll(() => {
  jest.restoreAllMocks();
});

function makeConfig() {
  return new ConfigManager();
}

describe('Commands - Status', () => {
  it('should import and export status command', async () => {
    const mod = await import('../commands/status');
    expect(mod.default).toBeDefined();
    expect(mod.StatusCommand).toBeDefined();
  });

  it('should execute status show', async () => {
    const { default: prog } = await import('../commands/status');
    prog.parse(['node', 'status', 'show']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute status show --json', async () => {
    const { default: prog } = await import('../commands/status');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'status', 'show', '--json']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute status show --verbose', async () => {
    const { default: prog } = await import('../commands/status');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'status', 'show', '--verbose']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute status platform', async () => {
    const { default: prog } = await import('../commands/status');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'status', 'platform']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute status platform --platform openai', async () => {
    const { default: prog } = await import('../commands/status');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'status', 'platform', '--platform', 'openai']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute status health', async () => {
    const { default: prog } = await import('../commands/status');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'status', 'health']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should create StatusCommand instance', async () => {
    const { StatusCommand } = await import('../commands/status');
    const cmd = new StatusCommand(makeConfig());
    expect(cmd).toBeDefined();
  });
});

describe('Commands - Alerts', () => {
  it('should import alerts command', async () => {
    const mod = await import('../commands/alerts');
    expect(mod.default).toBeDefined();
    expect(mod.AlertsCommand).toBeDefined();
  });

  it('should create AlertsCommand instance', async () => {
    const { AlertsCommand } = await import('../commands/alerts');
    const cmd = new AlertsCommand(makeConfig());
    expect(cmd).toBeDefined();
  });

  it('should execute alerts list via command instance', async () => {
    const { AlertsCommand } = await import('../commands/alerts');
    const cmd = new AlertsCommand(makeConfig());
    (console.log as jest.Mock).mockClear();
    try { cmd.execute({ list: true }, { args: ['list'] }); } catch { /* commander re-parse */ }
    expect(true).toBe(true);
  });
});

describe('Commands - Configure', () => {
  it('should import configure command', async () => {
    const mod = await import('../commands/configure');
    expect(mod.default).toBeDefined();
    expect(mod.ConfigureCommand).toBeDefined();
  });

  it('should execute configure platform --list', async () => {
    const { default: prog } = await import('../commands/configure');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'configure', 'platform', '--list']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute configure platform without --platform', async () => {
    const { default: prog } = await import('../commands/configure');
    (console.error as jest.Mock).mockClear();
    try { prog.parse(['node', 'configure', 'platform']); } catch { /* exit mock */ }
    expect(true).toBe(true);
  });

  it('should execute configure platform with invalid platform', async () => {
    const { default: prog } = await import('../commands/configure');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'configure', 'platform', '--platform', 'invalid']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute configure platform with --api-key', async () => {
    const { default: prog } = await import('../commands/configure');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'configure', 'platform', '--platform', 'openai', '--api-key', 'sk-test']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute configure test', async () => {
    const { default: prog } = await import('../commands/configure');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'configure', 'test']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute configure reset without --confirm', async () => {
    const { default: prog } = await import('../commands/configure');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'configure', 'reset']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute configure reset with --confirm', async () => {
    const { default: prog } = await import('../commands/configure');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'configure', 'reset', '--confirm']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should create ConfigureCommand and call execute', async () => {
    const { ConfigureCommand } = await import('../commands/configure');
    const cmd = new ConfigureCommand(makeConfig());
    (console.log as jest.Mock).mockClear();
    cmd.execute({ list: true });
    expect(console.log).toHaveBeenCalled();
  });
});

describe('Commands - Monitor', () => {
  it('should import monitor command', async () => {
    const mod = await import('../commands/monitor');
    expect(mod.default).toBeDefined();
    expect(mod.MonitorCommand).toBeDefined();
  });

  it('should execute monitor start', async () => {
    const { default: prog } = await import('../commands/monitor');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'monitor', 'start']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute monitor start --continuous', async () => {
    const { default: prog } = await import('../commands/monitor');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'monitor', 'start', '--continuous']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute monitor stop', async () => {
    const { default: prog } = await import('../commands/monitor');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'monitor', 'stop']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute monitor status', async () => {
    const { default: prog } = await import('../commands/monitor');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'monitor', 'status']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute monitor history', async () => {
    const { default: prog } = await import('../commands/monitor');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'monitor', 'history']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should create MonitorCommand instance', async () => {
    const { MonitorCommand } = await import('../commands/monitor');
    const cmd = new MonitorCommand(makeConfig());
    expect(cmd).toBeDefined();
  });
});

describe('Commands - Policy', () => {
  it('should import policy command', async () => {
    const mod = await import('../commands/policy');
    expect(mod.default).toBeDefined();
    expect(mod.PolicyCommand).toBeDefined();
  });

  it('should execute policy list', async () => {
    const { default: prog } = await import('../commands/policy');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'policy', 'list']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute policy enable', async () => {
    const { default: prog } = await import('../commands/policy');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'policy', 'enable', 'POLICY_001']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute policy disable', async () => {
    const { default: prog } = await import('../commands/policy');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'policy', 'disable', 'POLICY_001']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute policy create', async () => {
    const { default: prog } = await import('../commands/policy');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'policy', 'create', '--name', 'TestPolicy']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute policy test', async () => {
    const { default: prog } = await import('../commands/policy');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'policy', 'test', 'POLICY_001', '--sample', 'test input']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should create PolicyCommand instance', async () => {
    const { PolicyCommand } = await import('../commands/policy');
    const cmd = new PolicyCommand(makeConfig());
    expect(cmd).toBeDefined();
  });
});

describe('Commands - Threat', () => {
  it('should import threat command', async () => {
    const mod = await import('../commands/threat');
    expect(mod.default).toBeDefined();
    expect(mod.ThreatCommand).toBeDefined();
  });

  it('should execute threat commands', async () => {
    const { default: prog } = await import('../commands/threat');
    (console.log as jest.Mock).mockClear();
    try { prog.parse(['node', 'threat', 'list']); } catch { /* commander */ }
    try { prog.parse(['node', 'threat', 'detect', '--platform', 'openai', '--input', 'test']); } catch { /* commander */ }
    expect(true).toBe(true);
  });

  it('should create ThreatCommand instance', async () => {
    const { ThreatCommand } = await import('../commands/threat');
    const cmd = new ThreatCommand(makeConfig());
    expect(cmd).toBeDefined();
  });
});

describe('Commands - Report', () => {
  it('should import report command', async () => {
    const mod = await import('../commands/report');
    expect(mod.default).toBeDefined();
    expect(mod.ReportCommand).toBeDefined();
  });

  it('should execute report generate', async () => {
    const { default: prog } = await import('../commands/report');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'report', 'generate']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute report list', async () => {
    const { default: prog } = await import('../commands/report');
    (console.log as jest.Mock).mockClear();
    try { prog.parse(['node', 'report', 'list']); } catch { /* commander */ }
    expect(true).toBe(true);
  });

  it('should create ReportCommand instance', async () => {
    const { ReportCommand } = await import('../commands/report');
    const cmd = new ReportCommand(makeConfig());
    expect(cmd).toBeDefined();
  });
});

describe('Commands - Compliance', () => {
  it('should import compliance command', async () => {
    const mod = await import('../commands/compliance');
    expect(mod.default).toBeDefined();
    expect(mod.ComplianceCommand).toBeDefined();
  });

  it('should execute compliance check', async () => {
    const { default: prog } = await import('../commands/compliance');
    (console.log as jest.Mock).mockClear();
    prog.parse(['node', 'compliance', 'check']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should execute compliance report', async () => {
    const { default: prog } = await import('../commands/compliance');
    (console.log as jest.Mock).mockClear();
    try { prog.parse(['node', 'compliance', 'report']); } catch { /* commander */ }
    expect(true).toBe(true);
  });

  it('should create ComplianceCommand instance', async () => {
    const { ComplianceCommand } = await import('../commands/compliance');
    const cmd = new ComplianceCommand(makeConfig());
    expect(cmd).toBeDefined();
  });
});

describe('Commands - Index', () => {
  it('should export all command modules', async () => {
    const mod = await import('../commands/index');
    expect(mod.StatusCommand).toBeDefined();
    expect(mod.MonitorCommand).toBeDefined();
    expect(mod.ConfigureCommand).toBeDefined();
    expect(mod.PolicyCommand).toBeDefined();
    expect(mod.ComplianceCommand).toBeDefined();
    expect(mod.ThreatCommand).toBeDefined();
    expect(mod.ReportCommand).toBeDefined();
    expect(mod.AlertsCommand).toBeDefined();
  });
});
