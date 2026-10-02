# Npm releases

Source: https://github.com/devxcrew/tools.
Package: @devxcrew/tools.

Publish tools first, then framework and UI, then platform, then CLI.
Apps consume pinned npm versions. Never use file or link dependencies.
Regenerate lockfiles with npm install after the required versions exist.
Run npm run check, npm run format:check, and npm run pack.
Previously published versions are immutable. Change the version before republishing changed source.
The CLI command changed to devxcrew-cli and needs a major release.
The tools command is devxcrew-tools. Profile files are .devxcrew-tools.json.
GitHub OIDC publishing must target the current devxcrew repository and its actual workflow file.
Configure trusted publishing during the release phase. Do not reuse the old CODEXSUN publishing trust.
