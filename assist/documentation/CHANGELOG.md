# Changelog

## Version State

Current version: 0.1.4

Release tag: v-0.1.4

Changelog label: v 0.1.4

## v-0.1.4

### [v 0.1.4] 2026-10-02 8:56 pm - Common MCP governance guidance

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Added optional authenticated MCP instruction retrieval, connection settings, app identity, and common offline repository and UI guides. Governance remains advisory and does not gate startup or builds. Verified all six live MCP connections, four MCP protocol tests, common offline fallback, and repository checks. Cxsun production routes and UIUX builds passed.

## v-0.1.3

### [v 0.1.3] 2026-10-02 8:29 pm - Audited tools and application compatibility

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Added single-server application support, TypeScript compiler compatibility, initial GitHub pushes, configured environment preflight, and generated-file exclusions. Reviewed shared maintenance commands for Cxsun, framework, UI, and UIUX. Passed 20 tests, release checks, formatting checks, and npm packaging.

## v-0.1.2

### [v 0.1.2] 2026-10-02 3:10 pm - App preflight and CXApp GitHub review

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Restart existing app process trees on configured reserved ports and preserve cross-app ownership. Match CXApp GitHub review prompts, support Windows IDE dialogs, and pull approved upstream changes before committing.
- Passed 15 tests, release checks, packaging, and live same-port restart verification. The user approved commit, push, and npm publication for this tools release.

## v-0.1.1

### [v 0.1.1] 2026-10-02 2:49 pm - Configurable application source paths

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Allow app builds and development servers to read validated compiler and entry paths from .devxcrew-tools.json while preserving existing layouts.

## v-0.1.0

### [v 0.1.0] 2026-10-02 12:00 pm - Shared repository tooling

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Moved repository maintenance, package builds, application runtime tools, and regression tests from CLI.
- Uses the devxcrew-tools command and .devxcrew-tools.json profile.
- Npm publishing is deferred.
