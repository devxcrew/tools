# Tools agent rules

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
