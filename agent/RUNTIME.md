# Runtime and upgrade contract

Tools requires Node >=26.5.0. Foundation apps require Node >=26.10.0.
Use npm >=12.0.1 and the app lockfile with npm ci.
Windows 11 with PowerShell is verified in this workspace. Linux and macOS are pending CI acceptance.
Do not describe an untested operating system as verified.

app:create creates a new directory from an explicit accepted artifact.
It rejects every existing destination, including empty directories and dry runs.
It cannot upgrade an existing application. Upgrade shared packages through reviewed exact versions and npm ci.
Keep business modules, migrations, configuration and persisted databases owned by the app.
Verify the upgrade against a backed-up database and review changed contracts before release.

Generation publishes a completed staging directory with a same-parent rename.
An abrupt process kill can leave .app-create-UUID directories. A retry uses a fresh isolated directory.
Orphan staging cannot become an application or overwrite an existing app.
Inspect orphan directories and remove only explicitly identified staging paths after confirming no generator is active.
The generator does not automatically delete another process's staging directory.
