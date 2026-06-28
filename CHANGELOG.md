# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Fixed filter bug in `SecurityMonitor.getActiveAlerts()` — filter results were computed but discarded instead of reassigned
- Fixed `ConfigureCommand` — TODO placeholder replaced with actual `ConfigManager.addPlatform()` call for API key storage
- Fixed `PlatformConfig.configured` property access — property doesn't exist; now checks `apiKey` presence
- Replaced all `any` types with proper TypeScript interfaces across analyzer, commands, and alerts

### Added
- ESLint flat config (`eslint.config.mjs`) with typescript-eslint v8
- Comprehensive test suite (config-manager, analyzer, monitor, compliance-checker, types)
- Proper TypeScript interfaces: `ThreatPattern`, `ThreatTrendAnalysis`, `ThreatAnalysisResult`, `SecurityPostureAssessment`, `IncidentResponseTime`, `HistoricalData`
- CHANGELOG.md

### Changed
- `ConfigureCommand` constructor now properly typed as `ConfigManager` instead of `any`
- `AlertsCommand` constructor now properly typed as `ConfigManager` instead of `any`
- `StatusCommand` constructor now properly typed as `ConfigManager` instead of `any`
- `AlertsCommand.execute()` parameters typed as `Record<string, unknown>` and `{ args?: string[] }` instead of `any`

## [1.0.0] - 2026-06-20

### Added
- Initial release
- Multi-platform AI security orchestration CLI
- Support for OpenAI, Anthropic, Google, Azure
- Threat detection and response
- Compliance checking
- Security policy management
- Real-time monitoring
- Alert management
- Security reporting (JSON, CSV, PDF)
