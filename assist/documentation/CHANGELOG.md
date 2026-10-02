# Changelog

## Version State

Current version: 0.1.2

Release tag: v-0.1.2

Changelog label: v 0.1.2

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
