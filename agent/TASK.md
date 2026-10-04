# Current task

## Completion wave - 2026-10-04

Source 0.1.8 passed 32 tests, including interrupted generation and retry. Generation and source upgrade safeguards exist. This wave adds macOS to CI and records the target runtime contract. Registry-generated consumer upgrades remain open.

- [x] Reconcile current status with the GitHub source release and latest owner audit.
- [x] Retrieve fresh authenticated cloud governance before this wave.
- [x] Apply the user-selected MIT license to first-party source, package metadata and lock metadata.
- [x] Record this wave's affected checks and accept only gates with direct evidence.

npm run release:check passed 32 tests, format, metadata and a 21-file MIT package.

- [x] Prepare isolated CI coverage for the target Windows/Linux/macOS runtime.
- [ ] Verify this wave's exact GitHub CI results.

Use projects/cxsun/agent/REMAINING-WORK.md for ordered cross-owner dependencies.
Production deployment and real SMTP acceptance remain deferred. No pending external gate is marked complete.

## Prior records

<!-- foundation-checklist:start -->

## Numbered phase checklist

Master: [all foundation tasks](D:/codexsun/projects/cxsun/agent/CHECKLIST.md).

Updated: 2026-10-04. Checked steps have recorded local evidence.
Parents retain incomplete acceptance gates. Mail tests and production deployment are deferred by user.

### Phase 01 - Baseline and ownership

- [x] **01.06 Audit CLI and package lifecycle** - accepted. Owner: tools.
  - [x] 01.06.1 Supported commands and reproducibility gaps recorded.

### Phase 02 - Public contracts and release scope

- [ ] **02.05 Define generation and supported runtime contracts** - in-review. Owner: tools, template.
  - [x] 02.05.1 Explicit artifact manifest, tokens and overwrite policy implemented.
  - [ ] 02.05.2 Accept Node/npm/OS matrix and upgrade behavior.
  - [ ] 02.05.3 Verify Linux/macOS runtime matrix in CI.

### Phase 05 - Tools, guidance and delivery

- [ ] **05.02 Refine setup, diagnostics and lifecycle commands** - in-review. Owner: tools.
  - [x] 05.02.1 32 Tools tests cover safe paths, ports, boundaries and generation.
  - [x] 05.02.2 Verify actual killed-process interruption and complete retry.
  - [ ] 05.02.3 Verify cross-platform matrix and released consumers.

### Phase 07 - Release and app generation

- [ ] **07.01 Generate apps from accepted released contracts** - in-review. Owner: tools, template.
  - [x] 07.01.1 Safe app:create and exporter with three regression tests implemented.
  - [ ] 07.01.2 Build approved registry artifact and verify generated application installation.
- [ ] **07.02 Verify generation safety and upgrades** - in-review. Owner: tools, template.
  - [x] 07.02.1 Existing destination and private artifact rejection tests pass.
  - [x] 07.02.2 Verify killed-process interruption, rejected in-place upgrades and preservation of app-owned modules.
  - [ ] 07.02.3 Verify released package upgrades with two independent generated apps.

<!-- foundation-checklist:end -->

## Earlier task records

## Independent review - 2026-10-04

Authenticated cloud connection passed before this review.
`npm run release:check` passed 28 tests, dependency order, versions, LF, formatting, and package dry run.
The source implements app:create and app:doctor. The published 0.1.7 package predates these additions.
Generation uses an explicit file manifest, new destinations, registry dependencies, and staged directory publication.
Tests verify dry runs, path rejection, fresh records, token escaping, and retry after validation failure.
Task 07.01 remains in-review. Task 07.02 requires actual released-package installation, two generated apps, interruption recovery, and upgrade evidence.
The Cxsun exporter owns artifact contents. The coordinator corrected missing live-check and email-check helpers and passed three focused exporter tests.
Tools cannot accept the template from generator fixture tests alone.
Task 02.05 still needs the supported Node/npm/OS matrix. Cross-platform acceptance remains pending.
No publication, deployment, commit, or push occurred.

Date: 2026-10-04
Scope: verify baseline and load owner tasks from the Cxsun master plan.

## Status

Verified 2026-10-04: release:check passed all 21 tests, dependency order, version 0.1.7, line endings, formatting, and package dry run. CLI supports build, pack, package checks, dependency boundaries, maintenance, app development/build, environment initialization, clone checks, and container preparation. App and module generation commands do not exist. The package dry run includes agent records, which require artifact-scope review.

| ID    | State     | Evidence or next action                |
| ----- | --------- | -------------------------------------- |
| 01.06 | in-review | Acceptance and dependencies in PLAN.md |
| 02.05 | planned   | Acceptance and dependencies in PLAN.md |
| 05.02 | planned   | Acceptance and dependencies in PLAN.md |
| 07.01 | planned   | Acceptance and dependencies in PLAN.md |
| 07.02 | planned   | Acceptance and dependencies in PLAN.md |

Phase 01 awaits coordinator review. Later tasks require contract agreement and implementation verification.
No runtime implementation, publication, version bump, commit, or push was performed.

## Previous task history

# Current task

Publish standalone application maintenance support.

## Completed

@devxcrew/tools@0.1.7 is published on npm and consumed by all five project apps.
Release checks passed all 21 tests. Workspace and isolated app checks passed.
Corrected source notes describe installed maintenance and cloud-only guidance.
The published tarball contains the earlier README. Include corrected notes in the next authorized release.
No Git commit or push was performed.

## Tools implementation wave - 2026-10-04

02.05, 05.02, and 07.01 are in-review for the implemented generation and diagnostics contracts.
07.02 remains partial. Repeat rejection and safe retry after failed validation passed.
Process interruption recovery and live generated-app upgrades still require release acceptance.

Added app:create using an app-owned explicit artifact manifest, application tokens, dry run, and atomic staging.
The command rejects existing destinations, symlinks, operational data, secret environment values, and private dependencies.
Added app:doctor for configured paths, public source boundaries, installation presence, and exact pinned versions.
Passed release:check with 25 tests, formatting, dependency order, version alignment, line endings, and package dry run.
Tests preserve the source artifact and unrelated staging files. Fixture Git operations remain isolated in temporary repositories.
No generated operational app, package publication, version bump, commit, or deployment was performed.

## Browser-safe public Platform schema contract - 2026-10-04

05.02 boundary refinement is in-review.
The exact @devxcrew/platform/identity/schemas export may enter frontend source after its installed JavaScript import graph passes browser checks.
The checker resolves the package export map, follows package-local relative files, permits only Zod external imports, and rejects Node imports/globals.
Platform roots, private paths, and longer subpaths remain denied.
Passed release:check with 26 tests and formatting, version, line ending, and package dry-run checks.
Refresh the installed Tools development artifact before Cxsun consumer verification.

## Fresh application records - 2026-10-04

07.01 generation now permits only named fresh agent records when the artifact sets freshAgentRecords=true.
Unknown agent history remains rejected. Only .github/workflows/check.yml may enter the workflow directory.
Cxsun's exporter creates these records from fresh text instead of copying owner history.
Passed Tools release checks with 27 tests. Live generated-app acceptance remains pending the approved compatible registry release.

## Local gate completion - 2026-10-04

Authenticated MCP retrieval passed before changes.
Thirty tests pass, including orphan staging retry and preservation of app-owned files on rejected upgrade attempts.
app:create refuses existing destinations. It is not an in-place application upgrader.
The runtime contract is in agent/RUNTIME.md. Windows acceptance is local evidence. Linux and macOS await CI.
Released consumers and independent registry app generation remain pending.
Proposed additive release: 0.1.8, subject to integrated artifact review and publication approval.

## Actual process interruption acceptance - 2026-10-04

A disposable artifact with 1,200 payload files ran through the actual app:create CLI.
The test observed that child process's staging directory and terminated only that child with SIGKILL.
No partial destination was published. Retry created the complete application and preserved unrelated staging evidence.
Eight generation tests pass. No production fault injection or test hooks were added.
Runtime acceptance remains Windows-local. Cross-platform CI and released consumer acceptance remain pending.
License review preserves existing rights. Email UNLICENSED remains a neutral no-grant declaration until its owner selects distribution terms.

## Environment token regression - 2026-10-04

Restricted secret assignment whitespace to horizontal spaces and tabs.
Blank secrets before populated lines no longer match a value across a newline.
Blank MCP and SMTP fields between application tokens pass generation. Nonempty secret values still fail.
All 32 Tools tests and release checks pass. Source is frozen for coordinator package refresh.

## Workspace GitHub release - 2026-10-04

Release title: Deliver reusable application tooling.
Add safe application creation, artifact validation, interruption recovery, upgrade preservation and maintenance verification.
Update version records, review release checks, then commit and push the current owner branch.
Preserve existing task history and incomplete acceptance gates.
