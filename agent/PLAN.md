# Tools foundation owner plan

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
Status: Source implementation is in-review. Released consumer acceptance remains incomplete.
Master: projects/cxsun/agent/PLAN.md.

## Verified baseline

Verified 2026-10-04: release:check passed all 21 tests, dependency order, version 0.1.7, line endings, formatting, and package dry run. CLI supports build, pack, package checks, dependency boundaries, maintenance, app development/build, environment initialization, clone checks, and container preparation. App and module generation commands do not exist. The package dry run includes agent records, which require artifact-scope review.

## Delivery tasks

### 8.6 Tools â€” shared/tools

Purpose: reproducible maintenance, application lifecycle and release/generation commands.
Legacy references: T01-T07, S01-S06.

| ID    | Work                                                                          | Acceptance                                                    |
| ----- | ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 01.06 | Audit scripts, compatibility checks and package lifecycle                     | Isolated usage gaps recorded                                  |
| 02.05 | Define supported Node/npm/OS matrix, package upgrades and generation behavior | Public CLI contracts and overwrite policy                     |
| 05.02 | Refine setup, environment diagnostics, checks, build, ports and stop/restart  | Preserve secrets, existing files and unrelated processes      |
| 07.01 | Generate apps/modules from accepted released contracts                        | Unique identity/configuration, no secrets or copied databases |
| 07.02 | Verify repeat generation, interruption recovery and upgrade migration         | No overwrite of app-owned business implementations            |

## Dependencies and sequence

02.01 Framework contracts; 02.02 Platform resources; 02.03 UI contracts; 02.04 Cxsun mapping; 02.09 release manifest.
Keep global phase and task IDs. Do not restart numbering.
Complete Phase 01 evidence before Phase 02 contracts.
Implement accepted contracts after dependent owners agree their boundaries.
Cxsun owns live application composition. Platform owns identity persistence.

## Acceptance and handoff

Use public provider contracts and keep business implementations inside their owners.
Keep events and consumers module-owned. Add transport only for accepted asynchronous needs.
Use the current cloud governance instructions instead of duplicating shared standards here.
Run existing checks and add meaningful verification for changed behavior during implementation.
Final consumer acceptance uses configured file-backed SQLite and restart persistence.
Do not substitute mock or memory adapters for release evidence.
Record outputs, limitations, compatibility, and integration evidence in TASK.md and AUDIT.md.
Submit each task for review before marking it accepted.
Publication, commits, pushes, and deployment require applicable user authorization.

## Previous roadmap - historical reference

The following earlier plan is retained for history. The numbered owner tasks above control current delivery.

# Repository plan

1. Keep shared guidance in mcp-governance.
2. Maintain local task, plan, skill notes, and release history.
3. Verify MCP instructions, maintenance commands, and repository behavior.
4. Release npm support for the new changelog path after explicit publication authorization. Keep
   legacy changelog compatibility.

## Task checkbox tracking

Use [owner phase checklist](TASK.md) for current checkboxes and numbered substeps.
Use [master checklist](D:/codexsun/projects/cxsun/agent/CHECKLIST.md) for all owners and shared release gates.
Keep task IDs unchanged. Check a parent only after all its acceptance criteria pass.


## Current execution - 2026-10-04

Local checks and the three-OS source CI passed. The MIT package 0.1.8 is published; Cxsun registry consumer verification is in progress. See TASK.md for current checkboxes and AUDIT.md for evidence. Earlier evidence remains historical.
