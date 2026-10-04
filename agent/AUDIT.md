# Verification evidence

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

## Passed

- Live MCP retrieval verified the foundation guide, audit/todo records, and application metadata
  where applicable.
- Release metadata checks passed.

## Untested

- New application generation was not run.

## Not applicable

- Shared package records do not imply an application login desk.

## Cloud-only governance — 2026-10-03

- Passed: authenticated live instructions and required connection policy for this repository.
- Passed: local MCP endpoint rejected with exit code 1. No local guide fallback.
- Governance: seven protocol/client tests and cloud Worker checks passed.
- Cxsun: two development connection tests passed, including no process start on connection failure.
- Business features were not changed or tested. Source changes remain uncommitted.

## Live connection audit — 2026-10-03

- Passed: this repository retrieves all five cloud guidance documents with its configured app identity.
- Passed: environment secret files are ignored by Git.
- Fixed: imported clients now reject every endpoint except https://mcp.codexsun.com/mcp.
- Fixed: clients validate returned app identity and reject missing instruction content.
- Fixed: request timeout is 15 seconds. Cxsun no longer uses a two-second cloud timeout.
- Passed: official SDK initialization, five live resource reads, and all three live tools.
- Passed: missing/wrong secret, denied origin, and invalid identity HTTP checks.
- Passed: eight governance tests, two Cxsun failure tests, cloud checks, and successful live Cxsun startup.
- No current connection blocker was found. Cloud/network availability and valid secrets remain required.
- Cloud metadata is a deployment snapshot. Source changes require redeployment.
- App IDs identify caller context. The shared developer secret is not per-app authentication.
- Long-term uptime and external editor configuration were not tested. Source changes remain uncommitted.

## Live connection audit — 2026-10-03

- Passed: all six repositories retrieve five cloud guides with their configured app identities.
- Passed: environment secret files are ignored by Git.
- Fixed: imported clients reject every endpoint except https://mcp.codexsun.com/mcp.
- Fixed: clients validate returned app identity and reject missing instruction content.
- Fixed: request timeout is 15 seconds, including Cxsun development startup.
- Passed: official SDK initialization, five live resource reads, and all three live tools.
- Passed: missing/wrong secret, denied origin, and invalid identity HTTP checks.
- Passed: eight governance tests, two Cxsun failure tests, cloud checks, and successful live Cxsun startup.
- No current connection blocker was found. Network availability and valid secrets remain required.
- Cloud metadata is a deployment snapshot. Source changes require redeployment.
- App IDs identify caller context. The shared developer secret is not per-app authentication.
- Long-term uptime and external editor configuration were not tested. Source changes remain uncommitted.

## Release 0.1.6 — 2026-10-03

- Passed npm run release:check: 21 tests, dependency order, versions, LF, formatting, and npm package dry run.
- Passed authenticated live MCP connection, release metadata, LF, and configured-secret scans.
- Prepared commit subject: #6 - Require audited cloud MCP guidance.

## Live MCP access audit — 2026-10-03

- GREEN: authenticated live connection, matching repository metadata, five guidance resources, and all three MCP tools.
- Central evidence: shared/mcp-governance/docs/mcp-access-audit.md.

## npm standalone release — 2026-10-03

- Published @devxcrew/tools@0.1.7 with user authorization and device authentication. Registry version and integrity were verified.
- Release checks passed: 21 tests, formatting, versions, LF, and npm package dry run.
- Packed and registry consumption passed five app workspace and isolated verification runs.
- Agent changelog support and current package boundaries work without sibling maintenance wrappers.
- Source README was corrected after publication. The 0.1.7 tarball still contains its earlier README.
- No Git commit or push was performed.

## Foundation owner baseline - 2026-10-04

Verified 2026-10-04: release:check passed all 21 tests, dependency order, version 0.1.7, line endings, formatting, and package dry run. CLI supports build, pack, package checks, dependency boundaries, maintenance, app development/build, environment initialization, clone checks, and container preparation. App and module generation commands do not exist. The package dry run includes agent records, which require artifact-scope review.

Tests cover configuration paths, public package boundaries, compiler resolution, environment preservation, release metadata, Git review fixtures, and port ownership. Git commits and pushes in tests use temporary fixture repositories only. New app generation, interruption recovery, cross-OS operation, and live SQLite generated-app acceptance remain unverified.

Owner PLAN.md and TASK.md now use the global master task IDs.
Existing task and plan history was preserved. Changes are documentation only.
Authenticated cloud MCP connection passed in the coordinating agent before owner inspection.

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

# Workspace GitHub release - 2026-10-04

npm run release:check passed: 32 tests, formatting, aligned metadata, LF and package dry run. Maintenance excludes nested .worktrees.
Configured-secret scan found no matches in Git release candidates.

User authorization: update versions and changelogs, then commit and push all workspace repositories.
Add safe application creation, artifact validation, interruption recovery, upgrade preservation and maintenance verification.
Authenticated MCP connection passed for this owner before release work.
This delivery covers GitHub source. Npm publication, production deployment and real email acceptance remain separate gates.

## Completion wave evidence - 2026-10-04

npm run release:check passed 32 tests, format, metadata and a 21-file MIT package.
Authenticated MCP passed before work. New or expanded three-OS CI requires actual remote run evidence. Npm publication and deployed acceptance remain open.

## macOS CI fixture correction - 2026-10-04

The macOS generation tests used the system temporary-directory alias. Canonicalized the fixture root with realpathSync. The generator still rejects symlinked destination parents. Local release:check passes 32 tests. The replacement three-OS CI run is required before support acceptance.


Three-OS source CI passed: GitHub Actions run 37202224447 on Node 26.10.0 and npm 12.2.0.
