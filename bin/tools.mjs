#!/usr/bin/env node
import { resolve } from "node:path";
import { build, pack, checkPackage } from "../src/package.mjs";
import { checkBoundaries } from "../src/boundaries.mjs";
import { normalizeLines } from "../src/lines.mjs";
import { appendEntry, readLatestEntry } from "../src/changelog.mjs";
import { bumpVersion, checkVersions } from "../src/version.mjs";
import { githubNow } from "../src/github.mjs";
import { readJson, readOptions } from "../src/repository.mjs";
import { buildApp, devApp, initializeEnvironment } from "../src/app.mjs";
import { checkDependencyOrder } from "../src/dependency-order.mjs";
import { prepareContainer } from "../src/container.mjs";
import { verifyClone } from "../src/clone.mjs";

try {
  const [command = "help", ...args] = process.argv.slice(2);
  const options = readOptions(args);
  const root = resolve(options.root ?? process.cwd());
  const details = {
    title: options.title,
    note: options.note,
    databaseUpdate: options["database-update"]
  };
  switch (command) {
    case "container:prepare":
      prepareContainer(root);
      break;
    case "app:clone-check":
      await verifyClone(root);
      break;
    case "dependencies:order":
      checkDependencyOrder(readJson(root, "package.json"));
      console.info("Dependency order passed.");
      break;
    case "app:build":
      buildApp(root);
      break;
    case "app:dev":
      await devApp(root);
      break;
    case "env:init":
      initializeEnvironment(root);
      break;
    case "build":
      build(root);
      break;
    case "pack":
      pack(root);
      break;
    case "package:check":
      checkPackage(root);
      break;
    case "dependencies:check":
      checkBoundaries(root);
      break;
    case "lines:check":
      normalizeLines(root, false);
      break;
    case "lines:fix":
      normalizeLines(root, true);
      break;
    case "version:show":
      console.info(
        `${readJson(root, "package.json").name} ${readJson(root, "package.json").version}`
      );
      break;
    case "version:bump":
      console.info(
        bumpVersion(root, {
          ...details,
          release: options.release ?? "patch",
          dryRun: options["dry-run"] === true
        })
      );
      break;
    case "check:versions":
      checkVersions(root);
      break;
    case "changelog:append":
      appendEntry(root, details);
      break;
    case "github:now":
      await githubNow(root, { dryRun: options["dry-run"] === true });
      break;
    case "changelog:show":
      console.info(readLatestEntry(root));
      break;
    case "help":
      console.info(
        "devxcrew-tools <build|pack|package:check|dependencies:check|dependencies:order|lines:check|lines:fix|version:show|version:bump|check:versions|changelog:append|github:now|app:build|app:dev|env:init|app:clone-check|container:prepare> [--root path] [--dry-run] [--title text] [--note text] [--database-update No|Yes] [--release patch|minor|major]"
      );
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
