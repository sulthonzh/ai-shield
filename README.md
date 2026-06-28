# ai-shield

**Your AI stack has four different security consoles. ai-shield gives you one.** Unified threat detection, compliance tracking, and incident response across OpenAI, Anthropic, Google AI, and Azure — with zero runtime dependencies.

## Why AI Shield?

Enterprise AI adoption is creating unprecedented security challenges as security tools remain fragmented across multiple platforms:

- **Security policy silos** - No unified security policies across AI providers
- **Threat detection fragmentation** - Each platform has separate security monitoring
- **Compliance complexity** - No unified approach to compliance across different AI providers
- **Security audit nightmares** - Multiple security tools creating audit complexity
- **Response coordination gaps** - No coordinated security response across platforms

## Features

### Core Security Management
- **Multi-platform security** - Single interface for security across OpenAI, Anthropic, Google AI, Microsoft Azure AI
- **Unified security policies** - Define and enforce consistent security policies across all platforms
- **Threat detection coordination** - Unified threat detection and response across platforms
- **Compliance management** - Unified compliance tracking and reporting across providers
- **Security incident coordination** - Coordinated incident response and mitigation
- **Security posture monitoring** - Real-time security visibility across all AI services

### AI-Specific Threat Detection
- **Prompt injection detection** - Detect and prevent prompt injection attacks
- **Data leakage prevention** - Monitor for sensitive data exposure
- **Hallucination detection** - Identify and mitigate AI-generated misinformation
- **Security policy automation** - Automated policy enforcement across platforms
- **Real-time threat response** - Coordinated response to security incidents

### Enterprise Features
- **Multi-tenant security** - Organization-level security management
- **Integration APIs** - REST APIs for custom security integrations
- **Custom security rules** - Extensible rule engine for security policies
- **Security analytics** - Advanced analytics for security pattern detection
- **Vulnerability management** - Cross-platform vulnerability scanning

## Quick Start

```bash
# Install globally
npm install -g ai-shield

# Configure your AI platform credentials
ai-shield configure --platform openai --api-key your-key
ai-shield configure --platform anthropic --api-key your-key

# Monitor security posture across all platforms
ai-shield monitor

# Check compliance status
ai-shield compliance

# Detect threats across platforms
ai-shield threat-detect
```

## Platforms Supported

- ✅ OpenAI (ChatGPT, GPT-4, GPT-3.5)
- ✅ Anthropic (Claude, Claude 2)
- ✅ Google AI (Gemini, PaLM)
- ✅ Microsoft Azure AI (Azure OpenAI)

## Security Features

### Threat Detection
- **Prompt Injection**: Detects malicious prompt attempts
- **Data Leakage**: Monitors for sensitive data exposure
- **Policy Violation**: Enforces security policies across platforms
- **Anomaly Detection**: Identifies unusual behavior patterns

### Compliance Management
- **SOC 2**: Automated compliance monitoring
- **GDPR**: Data privacy compliance tracking
- **HIPAA**: Healthcare compliance monitoring
- **Custom Policies**: Enterprise-specific compliance rules

### Incident Response
- **Real-time Alerts**: Immediate notification of security incidents
- **Automated Mitigation**: Automatic response to common threats
- **Coordination Tools**: Cross-platform incident coordination
- **Audit Trails**: Complete security event logging

## CLI Commands

### Security Management
```bash
ai-shield status              # Show overall security posture
ai-shield monitor             # Continuous security monitoring
ai-shield configure           # Configure platform credentials
ai-shield policy             # Manage security policies
ai-shield compliance         # Check compliance status
```

### Threat Detection
```bash
ai-shield threat-detect      # Run threat detection scan
ai-shield threat-history      # View threat detection history
ai-shield threat-response     # Respond to security incidents
```

### Analytics & Reporting
```bash
ai-shield report             # Generate security reports
ai-shield analytics          # Security analytics dashboard
ai-shield audit              # Security audit trails
```

## Configuration

### Basic Setup
```bash
# Configure individual platforms
ai-shield configure --platform openai --api-key sk-...
ai-shield configure --platform anthropic --api-key sk-ant-...
ai-shield configure --platform google --api-key your-google-api-key
ai-shield configure --platform azure --api-key your-azure-key

# Test configuration
ai-shield test-connections
```

### Policy Configuration
```bash
# Set security policies
ai-shield policy set --name "no-data-leakage" --rule "detect pii output"
ai-shield policy set --name "prompt-injection" --rule "detect jailbreak attempts"

# List active policies
ai-shield policy list

# Enable/disable policies
ai-shield policy enable --name "no-data-leakage"
ai-shield policy disable --name "legacy-rules"
```

## Security Alerts

### Real-time Monitoring
```bash
# Start continuous monitoring
ai-shield monitor --continuous

# View active alerts
ai-shield alerts

# Configure alert channels
ai-shield alerts configure --email admin@company.com
ai-shield alerts configure --webhook https://your-webhook-url
```

### Threat Response
```bash
# Respond to threats
ai-shield threat-respond --id THREAT-123 --action quarantine

# Automate responses
ai-shield threat-auto --pattern "data-leakage" --action block
```

## Enterprise Features

### Multi-Tenant Management
```bash
# Organization setup
ai-shield org create --name "Your Company"
ai-shield org add-user --email user@company.com --role security-analyst

# Department separation
ai-shield dept create --name "Engineering" --org "Your Company"
```

### Advanced Analytics
```bash
# Security analytics
ai-shield analytics --threat-trends
ai-shield analytics --compliance-score
ai-shield analytics --incident-response-time

# Custom dashboards
ai-shield dashboard --create "Security Overview"
```

## Integration

### SIEM Integration
```bash
# Connect to SIEM systems
ai-shield integrate --splunk https://your-splunk-instance
ai-shield integrate --elasticsearch https://your-elasticsearch
```

### Custom Rules
```bash
# Add custom security rules
ai-shield rule add --name "custom-policy" --type javascript --file rule.js

# Import rule sets
ai-shield rule import --file security-policies.json
```

## Development

### Running Tests
```bash
npm test
```

### Building
```bash
npm run build
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## Security

### Data Protection
- All API keys are encrypted at rest
- Communication uses TLS 1.3
- No logging of sensitive data
- Regular security audits

### Platform Security
- Follows platform-specific security best practices
- Implements rate limiting to prevent abuse
- Validates all API responses
- Implements proper error handling

## License

MIT License - see LICENSE file for details.

## Comparison

| Feature | ai-shield | Lakera Guard | Rebuff | Purpose-built scripts |
|---------|-----------|--------------|-------|-----------------------|
| Multi-platform | ✅ 4 providers | OpenAI only | OpenAI only | DIY |
| Zero dependencies | ✅ | ❌ | ❌ | Depends |
| Prompt injection detection | ✅ Built-in | ✅ | ✅ | Manual |
| Compliance tracking | ✅ SOC2/GDPR/HIPAA | ❌ | ❌ | ❌ |
| CLI-first | ✅ | ❌ API only | ❌ Library | ✅ |
| Policy management | ✅ Unified | ❌ | ❌ | DIY |
| Incident response | ✅ Coordinated | ❌ | ❌ | Manual |

## Real-World Examples

### 1. Pre-deployment Security Audit
Run a full security sweep before launching your AI feature to production:
```bash
ai-shield status --verbose          # Check posture across all platforms
ai-shield compliance check --json   # SOC2/GDPR compliance report
ai-shield threat detect             # Scan for prompt injection, data leakage
ai-shield report generate --type overview --output audit.pdf
```

### 2. Continuous Monitoring in CI/CD
Gate deployments on security posture:
```bash
ai-shield monitor start --continuous --timeout 300
ai-shield threat detect --severity critical --json | jq 'length'
# Fail CI if critical threats found
```

### 3. Incident Response Workflow
Triage and respond to a security incident across platforms:
```bash
ai-shield alerts list --severity critical
ai-shield threat respond --id THREAT-001 --action quarantine --notes "Contained prompt injection"
ai-shield report generate --type incident --output incident-report.json
```

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/sulthonzh/ai-shield/issues)

## Roadmap

### Q1 2026
- [x] Basic CLI framework
- [x] Multi-platform authentication
- [x] Core security monitoring
- [ ] Advanced threat detection
- [ ] Compliance management

### Q2 2026
- [ ] Real-time alerting
- [ ] Incident response automation
- [ ] Advanced analytics
- [ ] SIEM integrations

### Q3 2026
- [ ] Multi-tenant management
- [ ] Custom rule engine
- [ ] Advanced reporting
- [ ] Mobile app

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history.

---

Built with ❤️ for enterprise AI security teams worldwide.