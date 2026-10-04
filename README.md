# @devxcrew/tools

Shared repository maintenance and application runtime tooling.
Consume the public npm package. A sibling Tools or MCP Governance checkout is not required.

## Use in an app

Install @devxcrew/tools@0.1.7 as a development dependency.
Use devxcrew-tools from npm scripts for version:bump, check:versions, lines:fix, lines:check, and github:now.
Set maintenance.changelogPath to agent/CHANGELOG.md in .devxcrew-tools.json.
Legacy changelog locations remain supported.

App runtime helpers provide app:build, app:dev, and env:init.
Configure the app-owned entry points, compiler paths, and environment file in .devxcrew-tools.json.
Port preflight preserves unrelated listeners. env:init preserves existing configuration.

Version changes align package.json, package-lock.json, and the configured changelog.
Commit subjects use #<patch> - <release title>.
Review changes before an authorized github:now. Use --dry-run to inspect release actions.

## Develop this package

Use the Node and npm versions declared in package.json. Run npm ci and npm run release:check.
Read AGENTS.md and the records in agent before work.
Retrieve current guidance with npm run mcp:connect from https://mcp.codexsun.com/mcp.
A valid MCP_SERVER_SECRET, APP_ID, and APP_USER are required in the ignored .env file.
Stop and report live connection failures. Do not use local or cached guidance as fallback.

Keep app, Framework, UI, and business implementations outside this package.
Publication, commits, and pushes require user authorization.

## Published release

Version 0.1.7 provides agent changelog support and current Framework/UI npm package boundary checks.
Registry publication and isolated packed-package maintenance checks passed on 2026-10-03.
The npm 0.1.7 tarball contains the earlier README. These corrected notes apply to the current source.

## Application artifact generation and diagnostics

Run `devxcrew-tools app:create --source <artifact> --destination <new-directory> --id <app-id> --name <app-name> --port <port> --url <origin>`.
Add `--dry-run` to validate inputs and list output paths without writing files.
The destination parent must exist. The destination must not exist.

The application owner supplies `.foundation-template.json` with `{ "version": 1, "files": ["package.json", ".env.example"] }`.
List each approved text source file explicitly. Include the application code and public configuration required for installation.
Use `{{APP_ID}}`, `{{APP_NAME}}`, `{{APP_PORT}}`, and `{{APP_URL}}` in the environment example.
JSON tokens also work in package metadata. The artifact owner must tokenize app-specific source values before approval.
The generator rejects symlinks, private package dependencies, databases, operational environments, vendor files, and agent history.
It validates all files before writing. It stages output and renames it into place after generation.
Interrupted staging does not authorize overwriting an existing destination or deleting another staging directory.
Source review must exclude secrets embedded inside ordinary source files. An explicit manifest does not replace artifact review.

Run `devxcrew-tools app:doctor --root <app>` to check configured paths, source boundaries, installations, and pinned package versions.
This command does not reveal environment values. Version ranges still require installation and release compatibility checks.
The generator does not install packages or claim generated-app runtime acceptance.
Live SQLite acceptance requires the completed compatible Cxsun release artifact.
