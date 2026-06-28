# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Extended test suite: 309 tests (up from 173), 11 test suites
  - `commands-integration.test.ts` — full command action handler coverage via class execute() methods
  - `monitor-extended.test.ts` — startRealTimeMonitoring, stopRealTimeMonitoring, createAlert event emission
  - `analyzer-extended.test.ts` — detectEmergingThreats, calculateIncidentResponseTime, assessSecurityPosture
- Coverage: 87.5% statements (up from 67.32%), 93.3% functions, 68.6% branches
- README: sharpened hook line, added comparison table (vs Lakera Guard, Rebuff, custom scripts), added 3 real-world examples

### Fixed
- Fixed filter bug in `SecurityMonitor.getActiveAlerts()` — filter results were computed but discarded instead of reassigned
- Fixed `ConfigureCommand` — TODO placeholder replaced with actual `ConfigManager.addPlatform()` call for API key storage
- Fixed `PlatformConfig.configured` property access — property doesn't exist; now checks `apiKey` presence
- Replaced all `any` types with proper TypeScript interfaces across analyzer, commands, and alerts

### Changed
- `ConfigureCommand` constructor now properly typed as `ConfigManager` instead of `any`
- `AlertsCommand` constructor now properly typed as `ConfigManager` instead of `any`
- `StatusCommand` constructor now properly typed as `ConfigManager` instead of `any`
- `AlertsCommand.execute()` parameters typed as `Record<string, unknown>` and `{ args?: string[] }` instead of `any`

### Infrastructure
- ESLint flat config (`eslint.config.mjs`) with typescript-eslint v8
- Proper TypeScript interfaces: `ThreatPattern`, `ThreatTrendAnalysis`, `ThreatAnalysisResult`, `SecurityPostureAssessment`, `IncidentResponseTime`, `HistoricalData`
- CHANGELOG.md

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
