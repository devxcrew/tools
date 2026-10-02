# @devxcrew/tools

Shared maintenance for packages and apps. App creation belongs to @devxcrew/cli.

```sh
npm install --save-dev --save-exact @devxcrew/tools@0.1.0
npm exec -- devxcrew-tools help
```

Commands: build, pack, package:check, dependencies:check, dependencies:order, lines:check, lines:fix, version:show, version:bump, check:versions, changelog:append, changelog:show, github:now, app:build, app:dev, env:init, app:clone-check, container:prepare.
Use .devxcrew-tools.json for build and import boundary settings.
Tools use the consuming repository's TypeScript, Vite, and tsx installations.
Each repository keeps its own version, lockfile, changelog, and output.
GitHub dry runs do not stage, commit, fetch, or push.
Version bumps preserve dependency ranges and historical entries.
LF checks skip generated files, dependency trees, secrets, and symlinks.
Environment initialization preserves existing files and creates unique cookie secrets.
Container preparation copies build context only. It never starts Docker.

Dependency order: tools -> framework/UI -> platform -> CLI -> apps.
An owner can consume only earlier layers. Apps use tools directly after creation.
Tools has no dependency on framework, UI, platform, CLI, or an app.

Source: D:\codexsun\shared\tools.
GitHub: https://github.com/devxcrew/tools.
