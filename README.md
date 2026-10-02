# @devxcrew/tools

App build and development paths can be configured in the root .devxcrew-tools.json:

```json
{
  "app": {
    "apiConfig": "src/api/tsconfig.json",
    "webConfig": "src/web/tsconfig.json",
    "apiEntry": "src/api/server.ts"
  }
}
```

Paths must exist inside the application root. Existing apps keep their original default paths.

Shared maintenance for packages and apps. App creation belongs to the owning application setup.

```sh
npm install --save-dev --save-exact @devxcrew/tools
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
Application development preflight reads API_HOST, API_PORT and WEB_ORIGIN from the app root .env.
It stops existing processes belonging to that app and restarts on the same reserved ports.
It does not select another port or stop processes belonging to another app.
Set DEVXCREW_DEV_PORT_POLICY=abort to reject occupied ports without stopping a process.
GitHub review uses the CXApp review box and version, message and approval prompts.
Windows IDE runs use native review dialogs when terminal input is unavailable.
An approved run fetches, pulls with rebase and autostash when needed, commits changes, and pushes.
Cancellation leaves versions and Git state unchanged. Dry runs perform no Git network operations.
Container preparation copies build context only. It never starts Docker.

Dependency order: tools -> framework/UI -> platform -> apps.
An owner can consume only earlier layers. Apps use tools directly after creation.
Tools has no dependency on framework, UI, platform, or an app.

Source: D:\codexsun\shared\tools.
GitHub: https://github.com/devxcrew/tools.

## Single server applications

Configure app.mode as single-server for a backend that serves Vite middleware. Set apiConfig, webConfig, apiEntry, envFile, and optional beforeBuild (an npm script name). Development checks one APP_HOST/APP_PORT endpoint and requires APP_URL to match. The default occupied-port policy is abort; no other app is stopped. Split-server applications retain the API_HOST/API_PORT/WEB_ORIGIN contract.

Install the published tools package with an exact npm version. The allowLocalPackages option permits local testing when required. Framework and UI may use their current @codexsun names. Configure boundaries.compilerPackage when the consuming TypeScript compiler has no JavaScript parser API, and list only intentional tooling imports in boundaries.developmentPackages.
