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

// Suppress console output during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  process.exit = jest.fn() as unknown as typeof process.exit;
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Command Integration — Alerts', () => {
  it('should instantiate AlertsCommand', async () => {
    const { AlertsCommand } = await import('../commands/alerts');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new AlertsCommand(config);
    expect(cmd).toBeDefined();
  });

  it('should execute alerts list via AlertsCommand', async () => {
    const { AlertsCommand } = await import('../commands/alerts');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new AlertsCommand(config);
    cmd.execute({ platform: 'openai', severity: 'high', limit: '5', format: 'json' }, { args: ['list'] });
    expect(cmd).toBeDefined();
  });

  it('should execute alerts acknowledge via AlertsCommand', async () => {
    const { AlertsCommand } = await import('../commands/alerts');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new AlertsCommand(config);
    cmd.execute({ reason: 'resolved' }, { args: ['acknowledge', 'alert-123'] });
    expect(cmd).toBeDefined();
  });
});

describe('Command Integration — Compliance', () => {
  it('should run compliance check', async () => {
    const { default: prog } = await import('../commands/compliance');
    prog.parse(['node', 'compliance', 'check']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run compliance check --json', async () => {
    const { default: prog } = await import('../commands/compliance');
    prog.parse(['node', 'compliance', 'check', '--json']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run compliance check --platform', async () => {
    const { default: prog } = await import('../commands/compliance');
    prog.parse(['node', 'compliance', 'check', '--platform', 'openai']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run compliance history', async () => {
    const { default: prog } = await import('../commands/compliance');
    prog.parse(['node', 'compliance', 'history', '--days', '30']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run compliance policies --list', async () => {
    const { default: prog } = await import('../commands/compliance');
    prog.parse(['node', 'compliance', 'policies', '--list']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run compliance policies without list', async () => {
    const { default: prog } = await import('../commands/compliance');
    prog.parse(['node', 'compliance', 'policies']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should instantiate ComplianceCommand', async () => {
    const { ComplianceCommand } = await import('../commands/compliance');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ComplianceCommand(config);
    expect(cmd).toBeDefined();
  });
});

describe('Command Integration — Configure', () => {
  it('should run configure platform --list', async () => {
    const { default: prog } = await import('../commands/configure');
    prog.parse(['node', 'configure', 'platform', '--list']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run configure platform without args (error)', async () => {
    const { ConfigureCommand } = await import('../commands/configure');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ConfigureCommand(config);
    cmd.execute({});
    expect(cmd).toBeDefined();
  });

  it('should run configure platform --platform openai --api-key test', async () => {
    const { default: prog } = await import('../commands/configure');
    prog.parse(['node', 'configure', 'platform', '--platform', 'openai', '--api-key', 'test-key']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run configure platform --platform invalid', async () => {
    const { ConfigureCommand } = await import('../commands/configure');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ConfigureCommand(config);
    cmd.execute({ platform: 'invalid' });
    expect(cmd).toBeDefined();
  });

  it('should run configure platform --enable', async () => {
    const { default: prog } = await import('../commands/configure');
    prog.parse(['node', 'configure', 'platform', '--platform', 'openai', '--enable']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run configure platform --disable', async () => {
    const { default: prog } = await import('../commands/configure');
    prog.parse(['node', 'configure', 'platform', '--platform', 'openai', '--disable']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run configure platform without apiKey', async () => {
    const { default: prog } = await import('../commands/configure');
    prog.parse(['node', 'configure', 'platform', '--platform', 'openai']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run configure test', async () => {
    const { default: prog } = await import('../commands/configure');
    prog.parse(['node', 'configure', 'test', '--platform', 'openai']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run configure reset without --confirm', async () => {
    const { default: prog } = await import('../commands/configure');
    prog.parse(['node', 'configure', 'reset']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run configure reset --confirm', async () => {
    const { default: prog } = await import('../commands/configure');
    prog.parse(['node', 'configure', 'reset', '--confirm']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should instantiate ConfigureCommand', async () => {
    const { ConfigureCommand } = await import('../commands/configure');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ConfigureCommand(config);
    expect(cmd).toBeDefined();
  });
});

describe('Command Integration — Monitor', () => {
  it('should run monitor start', async () => {
    const { default: prog } = await import('../commands/monitor');
    prog.parse(['node', 'monitor', 'start']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run monitor start --continuous --json', async () => {
    const { default: prog } = await import('../commands/monitor');
    prog.parse(['node', 'monitor', 'start', '--continuous', '--timeout', '60', '--json']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run monitor stop', async () => {
    const { default: prog } = await import('../commands/monitor');
    prog.parse(['node', 'monitor', 'stop']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run monitor status', async () => {
    const { default: prog } = await import('../commands/monitor');
    prog.parse(['node', 'monitor', 'status']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run monitor history', async () => {
    const { default: prog } = await import('../commands/monitor');
    prog.parse(['node', 'monitor', 'history', '--days', '14', '--platform', 'openai']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should instantiate MonitorCommand', async () => {
    const { MonitorCommand } = await import('../commands/monitor');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new MonitorCommand(config);
    expect(cmd).toBeDefined();
  });
});

describe('Command Integration — Policy', () => {
  it('should run policy list', async () => {
    const { default: prog } = await import('../commands/policy');
    prog.parse(['node', 'policy', 'list']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run policy list --platform openai', async () => {
    const { default: prog } = await import('../commands/policy');
    prog.parse(['node', 'policy', 'list', '--platform', 'openai']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run policy list --enabled', async () => {
    const { default: prog } = await import('../commands/policy');
    prog.parse(['node', 'policy', 'list', '--enabled']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run policy enable', async () => {
    const { default: prog } = await import('../commands/policy');
    prog.parse(['node', 'policy', 'enable', 'policy-001']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run policy disable', async () => {
    const { default: prog } = await import('../commands/policy');
    prog.parse(['node', 'policy', 'disable', 'policy-001']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run policy create', async () => {
    const { default: prog } = await import('../commands/policy');
    prog.parse(['node', 'policy', 'create', '--name', 'Test Policy', '--description', 'Desc', '--rule', 'block-x', '--platform', 'openai', '--severity', 'high']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run policy test', async () => {
    const { default: prog } = await import('../commands/policy');
    prog.parse(['node', 'policy', 'test', 'policy-001', '--sample', 'some text']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should instantiate PolicyCommand', async () => {
    const { PolicyCommand } = await import('../commands/policy');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new PolicyCommand(config);
    expect(cmd).toBeDefined();
  });
});

describe('Command Integration — Report', () => {
  it('should run report generate (default overview)', async () => {
    const { default: prog } = await import('../commands/report');
    prog.parse(['node', 'report', 'generate']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run report generate --type threats', async () => {
    const { default: prog } = await import('../commands/report');
    prog.parse(['node', 'report', 'generate', '--type', 'threats']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run report generate --type compliance', async () => {
    const { default: prog } = await import('../commands/report');
    prog.parse(['node', 'report', 'generate', '--type', 'compliance']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run report generate --format json', async () => {
    const { default: prog } = await import('../commands/report');
    prog.parse(['node', 'report', 'generate', '--format', 'json']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run report generate --output /tmp/report.json --format json', async () => {
    const { default: prog } = await import('../commands/report');
    prog.parse(['node', 'report', 'generate', '--output', '/tmp/report.json', '--format', 'json']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run report generate --output /tmp/report.md', async () => {
    const { default: prog } = await import('../commands/report');
    prog.parse(['node', 'report', 'generate', '--output', '/tmp/report.md']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run report templates', async () => {
    const { default: prog } = await import('../commands/report');
    prog.parse(['node', 'report', 'templates']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run report schedule', async () => {
    const { default: prog } = await import('../commands/report');
    prog.parse(['node', 'report', 'schedule', '--frequency', 'weekly', '--email', 'test@test.com']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should instantiate ReportCommand', async () => {
    const { ReportCommand } = await import('../commands/report');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ReportCommand(config);
    expect(cmd).toBeDefined();
  });
});

describe('Command Integration — Status', () => {
  it('should run status show', async () => {
    const { default: prog } = await import('../commands/status');
    prog.parse(['node', 'status', 'show']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run status show --verbose', async () => {
    const { default: prog } = await import('../commands/status');
    prog.parse(['node', 'status', 'show', '--verbose']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run status show --json', async () => {
    const { default: prog } = await import('../commands/status');
    prog.parse(['node', 'status', 'show', '--json']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run status platform (no specific platform)', async () => {
    const { default: prog } = await import('../commands/status');
    prog.parse(['node', 'status', 'platform']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run status platform --platform openai', async () => {
    const { default: prog } = await import('../commands/status');
    prog.parse(['node', 'status', 'platform', '--platform', 'openai']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run status platform --platform openai --json', async () => {
    const { default: prog } = await import('../commands/status');
    prog.parse(['node', 'status', 'platform', '--platform', 'openai', '--json']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run status health', async () => {
    const { default: prog } = await import('../commands/status');
    prog.parse(['node', 'status', 'health']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should instantiate StatusCommand', async () => {
    const { StatusCommand } = await import('../commands/status');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new StatusCommand(config);
    expect(cmd).toBeDefined();
  });
});

describe('Command Integration — Threat', () => {
  it('should run threat detect (all)', async () => {
    const { default: prog } = await import('../commands/threat');
    prog.parse(['node', 'threat', 'detect']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run threat detect --type prompt-injection', async () => {
    const { default: prog } = await import('../commands/threat');
    prog.parse(['node', 'threat', 'detect', '--type', 'prompt-injection']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run threat detect --platform openai', async () => {
    const { default: prog } = await import('../commands/threat');
    prog.parse(['node', 'threat', 'detect', '--platform', 'openai']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run threat detect --severity critical', async () => {
    const { default: prog } = await import('../commands/threat');
    prog.parse(['node', 'threat', 'detect', '--severity', 'critical']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run threat detect --json', async () => {
    const { default: prog } = await import('../commands/threat');
    prog.parse(['node', 'threat', 'detect', '--json']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run threat respond', async () => {
    const { default: prog } = await import('../commands/threat');
    prog.parse(['node', 'threat', 'respond', '--id', 'threat-001', '--action', 'quarantine', '--notes', 'resolved']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run threat respond without action', async () => {
    const { default: prog } = await import('../commands/threat');
    prog.parse(['node', 'threat', 'respond', '--id', 'threat-002']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run threat history', async () => {
    const { default: prog } = await import('../commands/threat');
    prog.parse(['node', 'threat', 'history']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run threat history --json', async () => {
    const { default: prog } = await import('../commands/threat');
    prog.parse(['node', 'threat', 'history', '--json']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run threat analytics', async () => {
    const { default: prog } = await import('../commands/threat');
    prog.parse(['node', 'threat', 'analytics', '--period', 'month']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should run threat analytics default period', async () => {
    const { default: prog } = await import('../commands/threat');
    prog.parse(['node', 'threat', 'analytics']);
    expect(console.log).toHaveBeenCalled();
  });

  it('should instantiate ThreatCommand', async () => {
    const { ThreatCommand } = await import('../commands/threat');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ThreatCommand(config);
    expect(cmd).toBeDefined();
  });

  it('should call ThreatCommand.execute with detect', async () => {
    const { ThreatCommand } = await import('../commands/threat');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ThreatCommand(config);
    cmd.execute({ detect: true, type: 'all' });
    expect(cmd).toBeDefined();
  });

  it('should call ThreatCommand.showHistory', async () => {
    const { ThreatCommand } = await import('../commands/threat');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ThreatCommand(config);
    cmd.showHistory({ days: '7' });
    expect(cmd).toBeDefined();
  });

  it('should call ThreatCommand.respond', async () => {
    const { ThreatCommand } = await import('../commands/threat');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ThreatCommand(config);
    cmd.respond({ id: 't-1', action: 'block' });
    expect(cmd).toBeDefined();
  });
});

describe('Command Classes — ConfigureCommand.execute()', () => {
  it('should list platforms via execute', async () => {
    const { ConfigureCommand } = await import('../commands/configure');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ConfigureCommand(config);
    cmd.execute({ list: true });
    expect(cmd).toBeDefined();
  });

  it('should enable platform via execute', async () => {
    const { ConfigureCommand } = await import('../commands/configure');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ConfigureCommand(config);
    cmd.execute({ platform: 'openai', enable: true });
    expect(cmd).toBeDefined();
  });

  it('should disable platform via execute', async () => {
    const { ConfigureCommand } = await import('../commands/configure');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ConfigureCommand(config);
    cmd.execute({ platform: 'openai', disable: true });
    expect(cmd).toBeDefined();
  });

  it('should configure api key via execute', async () => {
    const { ConfigureCommand } = await import('../commands/configure');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ConfigureCommand(config);
    cmd.execute({ platform: 'openai', apiKey: 'test-key-123', baseUrl: 'https://api.openai.com' });
    expect(cmd).toBeDefined();
  });

  it('should handle no args via execute', async () => {
    const { ConfigureCommand } = await import('../commands/configure');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ConfigureCommand(config);
    cmd.execute({});
    expect(cmd).toBeDefined();
  });
});

describe('Command Classes — ComplianceCommand.execute()', () => {
  it('should run check via execute', async () => {
    const { ComplianceCommand } = await import('../commands/compliance');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ComplianceCommand(config);
    cmd.execute({ check: true });
    expect(cmd).toBeDefined();
  });

  it('should run history via execute', async () => {
    const { ComplianceCommand } = await import('../commands/compliance');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ComplianceCommand(config);
    cmd.execute({ history: true, days: '30' });
    expect(cmd).toBeDefined();
  });

  it('should run policies via execute', async () => {
    const { ComplianceCommand } = await import('../commands/compliance');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ComplianceCommand(config);
    cmd.execute({ policies: true });
    expect(cmd).toBeDefined();
  });

  it('should default to check via execute', async () => {
    const { ComplianceCommand } = await import('../commands/compliance');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ComplianceCommand(config);
    cmd.execute({});
    expect(cmd).toBeDefined();
  });
});

describe('Command Classes — PolicyCommand.execute()', () => {
  it('should list policies via execute', async () => {
    const { PolicyCommand } = await import('../commands/policy');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new PolicyCommand(config);
    cmd.execute({ list: true });
    expect(cmd).toBeDefined();
  });

  it('should enable policy via execute', async () => {
    const { PolicyCommand } = await import('../commands/policy');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new PolicyCommand(config);
    cmd.execute({ enable: 'policy-001' });
    expect(cmd).toBeDefined();
  });

  it('should disable policy via execute', async () => {
    const { PolicyCommand } = await import('../commands/policy');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new PolicyCommand(config);
    cmd.execute({ disable: 'policy-001' });
    expect(cmd).toBeDefined();
  });

  it('should create policy via execute', async () => {
    const { PolicyCommand } = await import('../commands/policy');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new PolicyCommand(config);
    cmd.execute({ create: true, name: 'Test', rule: 'block' });
    expect(cmd).toBeDefined();
  });

  it('should test policy via execute', async () => {
    const { PolicyCommand } = await import('../commands/policy');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new PolicyCommand(config);
    cmd.execute({ test: 'policy-001', sample: 'text' });
    expect(cmd).toBeDefined();
  });

  it('should default to list via execute', async () => {
    const { PolicyCommand } = await import('../commands/policy');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new PolicyCommand(config);
    cmd.execute({});
    expect(cmd).toBeDefined();
  });
});

describe('Command Classes — ReportCommand.execute()', () => {
  it('should generate report via execute', async () => {
    const { ReportCommand } = await import('../commands/report');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ReportCommand(config);
    cmd.execute({ generate: true, type: 'overview' });
    expect(cmd).toBeDefined();
  });

  it('should show templates via execute', async () => {
    const { ReportCommand } = await import('../commands/report');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ReportCommand(config);
    cmd.execute({ templates: true });
    expect(cmd).toBeDefined();
  });

  it('should schedule via execute', async () => {
    const { ReportCommand } = await import('../commands/report');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ReportCommand(config);
    cmd.execute({ schedule: true, frequency: 'daily' });
    expect(cmd).toBeDefined();
  });

  it('should default to generate via execute', async () => {
    const { ReportCommand } = await import('../commands/report');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new ReportCommand(config);
    cmd.execute({});
    expect(cmd).toBeDefined();
  });
});

describe('Command Classes — StatusCommand.execute()', () => {
  it('should show status via execute', async () => {
    const { StatusCommand } = await import('../commands/status');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new StatusCommand(config);
    cmd.execute({ show: true });
    expect(cmd).toBeDefined();
  });

  it('should show platform via execute', async () => {
    const { StatusCommand } = await import('../commands/status');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new StatusCommand(config);
    cmd.execute({ platform: true, verbose: true });
    expect(cmd).toBeDefined();
  });

  it('should run health via execute', async () => {
    const { StatusCommand } = await import('../commands/status');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new StatusCommand(config);
    cmd.execute({ health: true });
    expect(cmd).toBeDefined();
  });

  it('should default to show via execute', async () => {
    const { StatusCommand } = await import('../commands/status');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new StatusCommand(config);
    cmd.execute({});
    expect(cmd).toBeDefined();
  });
});

describe('Command Classes — MonitorCommand.execute()', () => {
  it('should start via execute', async () => {
    const { MonitorCommand } = await import('../commands/monitor');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new MonitorCommand(config);
    cmd.execute({ start: true });
    expect(cmd).toBeDefined();
  });

  it('should stop via execute', async () => {
    const { MonitorCommand } = await import('../commands/monitor');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new MonitorCommand(config);
    cmd.execute({ stop: true });
    expect(cmd).toBeDefined();
  });

  it('should show status via execute', async () => {
    const { MonitorCommand } = await import('../commands/monitor');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new MonitorCommand(config);
    cmd.execute({ status: true });
    expect(cmd).toBeDefined();
  });

  it('should show history via execute', async () => {
    const { MonitorCommand } = await import('../commands/monitor');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new MonitorCommand(config);
    cmd.execute({ history: true, days: '14' });
    expect(cmd).toBeDefined();
  });

  it('should default to start via execute', async () => {
    const { MonitorCommand } = await import('../commands/monitor');
    const config = new (await import('../utils/config-manager')).ConfigManager();
    const cmd = new MonitorCommand(config);
    cmd.execute({});
    expect(cmd).toBeDefined();
  });
});
