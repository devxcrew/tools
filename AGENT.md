# tools agent notes

Own shared maintenance and development tooling. Do not import app, framework, or UI implementations.

## Repository-specific rules

Own shared maintenance, builds, application runtime helpers, and package verification.
App creation and templates stay with their owning applications.
Never import framework, UI, platform, or app implementations here.
Use .devxcrew-tools.json and public npm dependencies.
Use argument-based child processes. Do not build shell commands from user text.
Dry runs must not mutate files or perform Git network operations.
Keep versions independent and preserve historical changelog entries and dependency ranges.
Run npm run check, npm run format:check, and npm run pack.
Docker remains deferred. Do not publish, commit, or push without authorization.
Npm publication requires fresh explicit user approval while the full starter app is prepared.
Dev preflight stops only listeners belonging to the consuming app and preserves its configured ports.

## Working instructions

Read agent/SKILLS.md, agent/TASK.md, agent/PLAN.md, and agent/CHANGELOG.md before work. Common standards live only in shared/mcp-governance/assist/guides. Use npm run mcp:connect for current instructions. If MCP is offline, read this AGENT.md and the central files when available. Continue development without a connection gate.

Use npm run version-bump with a title and note for a release. Maintain agent/CHANGELOG.md and preserve history. Use npm run fix:line-endings and npm run lines:check. Run npm run check:versions and the repository checks before npm run github:now. Review its changed files and commit subject. The subject uses #<patch> - <release title>. Commit, push, and publish only within user authorization.

Keep MCP_SERVER_SECRET in ignored .env and outside frontend code. App ID and app user are developer context only.
