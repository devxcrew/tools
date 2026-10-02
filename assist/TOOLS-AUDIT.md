# Tools audit: 0.1.3

## Scope

Reviewed maintenance commands, application builds, preflight, dependency boundaries, GitHub synchronization, and npm packaging.

## Corrections

- Preflight now reads the configured app.envFile, validates the single-server port policy, and handles IPv6 URL hosts.
- Maintenance scans exclude IDE settings and Vite caches.
- Existing compatibility changes support TypeScript 7 compiler paths, single-server apps, preparation scripts, parser aliases, current framework/UI names, and initial GitHub pushes.

## Verification

Passed 20 tests, dependency order, version alignment, LF checks, formatting checks, and npm packaging. The archive contains only the declared source, command, and documentation files. Tests cover version alignment, changelog history, dry runs, dependency boundaries, configured environment files, port ownership, compiler resolution, and first pushes to empty remotes.

## Supported contracts

- Cxsun uses app:dev and app:build with its single-server configuration.
- All four consuming repositories use version, changelog, LF, dependency order, and GitHub commands.
- Install the pinned npm package @devxcrew/tools@0.1.3 as a devDependency after publication.
- Framework and UI keep their existing build contracts. The generic package build command requires dist/src exports.
- app:clone-check and container:prepare retain the previous split-server starter layout. They are not wired to Cxsun. Docker execution remains deferred.

## Release

Version 0.1.3 includes the compatibility work and audit corrections. Each consuming repository records its own release and changelog. No database changes are required.
