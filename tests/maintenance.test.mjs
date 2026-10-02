import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { bumpVersion, checkVersions, nextVersion } from "../src/version.mjs";
import { appendEntry, timestamp } from "../src/changelog.mjs";
import { normalizeLines } from "../src/lines.mjs";
import { ownedPath } from "../src/repository.mjs";
import { checkPackage } from "../src/package.mjs";

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), "devxcrew-tools-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(resolve(root, "assist/documentation"), { recursive: true });
  const manifest = {
    name: "@test/package",
    version: "1.0.80",
    dependencies: { "@devxcrew/framework": "^1.0.80" },
    exports: { ".": { types: "./dist/src/index.d.ts", import: "./dist/src/index.js" } }
  };
  writeFileSync(resolve(root, "package.json"), JSON.stringify(manifest));
  writeFileSync(
    resolve(root, "package-lock.json"),
    JSON.stringify({
      name: manifest.name,
      version: manifest.version,
      packages: { "": { ...manifest } }
    })
  );
  writeFileSync(
    resolve(root, "assist/documentation/CHANGELOG.md"),
    "# Changelog\n\n## Version State\n\nCurrent version: 1.0.80\n\nRelease tag: v-1.0.80\n\nChangelog label: v 1.0.80\n\n## v-1.0.80\n\n### [v 1.0.80] 2026-10-02 9:00 am - Initial package\n\n#### Database Changes\n\n- Database update: No (manual).\n\n#### App Codebase Changes\n\n- Original historical note.\n"
  );
  return root;
}

test("version bump changes only this repository and preserves history and dependency ranges", (t) => {
  const root = fixture(t);
  const original = readFileSync(resolve(root, "assist/documentation/CHANGELOG.md"), "utf8").split(
    "## v-1.0.80"
  )[1];
  bumpVersion(root, { title: "Shared tooling", note: "Added repository commands." });
  checkVersions(root);
  const manifest = JSON.parse(readFileSync(resolve(root, "package.json")));
  assert.equal(manifest.version, "1.0.81");
  assert.equal(manifest.dependencies["@devxcrew/framework"], "^1.0.80");
  assert(
    readFileSync(resolve(root, "assist/documentation/CHANGELOG.md"), "utf8").endsWith(original)
  );
});

test("dry run and invalid input leave manifests and changelog unchanged", (t) => {
  const root = fixture(t);
  const before = readFileSync(resolve(root, "package.json"), "utf8");
  assert.equal(bumpVersion(root, { title: "Preview", dryRun: true }).nextVersion, "1.0.81");
  assert.throws(() => bumpVersion(root, { title: "bad\nheading" }), /single line/);
  assert.throws(() => bumpVersion(root, { databaseUpdate: "Maybe" }), /Yes or No/);
  assert.equal(readFileSync(resolve(root, "package.json"), "utf8"), before);
  checkVersions(root);
});

test("minor and major releases obey semantic versioning", () => {
  assert.equal(nextVersion("1.2.80", "minor"), "1.3.0");
  assert.equal(nextVersion("1.2.80", "major"), "2.0.0");
  assert.throws(() => nextVersion("invalid"));
});

test("append uses current version and timezone without rewriting historical entries", (t) => {
  const root = fixture(t);
  appendEntry(root, { title: "Progress", note: "Verified packaging." });
  checkVersions(root);
  const text = readFileSync(resolve(root, "assist/documentation/CHANGELOG.md"), "utf8");
  assert(text.includes("Original historical note."));
  assert.equal((text.match(/^## v-1.0.80$/gm) ?? []).length, 1);
  assert.equal(timestamp(new Date("2026-10-02T00:00:00Z")), "2026-10-02 5:30 am");
});

test("line fixer changes text, ignores generated files and secrets, and rejects escaping paths", (t) => {
  const root = fixture(t);
  mkdirSync(resolve(root, "node_modules"));
  writeFileSync(resolve(root, "README.md"), "one\r\ntwo\rthree\n");
  writeFileSync(resolve(root, "node_modules/generated.md"), "untouched\r\n");
  for (const directory of [".idea", ".vscode", ".vite"]) {
    mkdirSync(resolve(root, directory));
    writeFileSync(resolve(root, directory, "generated.json"), "untouched\r\n");
  }
  writeFileSync(resolve(root, ".env"), "secret=untouched\r\n");
  writeFileSync(resolve(root, "image.png"), Buffer.from([0, 13, 10, 255]));
  assert.throws(() => normalizeLines(root, false), /Non-LF/);
  assert.deepEqual(normalizeLines(root, true), ["README.md"]);
  assert.equal(readFileSync(resolve(root, "README.md"), "utf8"), "one\ntwo\nthree\n");
  assert.equal(readFileSync(resolve(root, ".env"), "utf8"), "secret=untouched\r\n");
  assert.throws(() => ownedPath(root, "../outside"), /leaves repository/);
  normalizeLines(root, false);
});

test("compiled export check rejects missing files and accidental shipped tests", (t) => {
  const root = fixture(t);
  assert.throws(() => checkPackage(root), /Missing export/);
  mkdirSync(resolve(root, "dist/src"), { recursive: true });
  writeFileSync(resolve(root, "dist/src/index.js"), "export {};\n");
  writeFileSync(resolve(root, "dist/src/index.d.ts"), "export {};\n");
  checkPackage(root);
  writeFileSync(resolve(root, "dist/src/private.test.js"), "export {};\n");
  assert.throws(() => checkPackage(root), /Tests must not/);
});

test("github dry run performs no commit, push, stage, or version change", (t) => {
  const root = fixture(t);
  execFileSync("git", ["init", "--quiet"], { cwd: root });
  const before = execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" });
  const output = execFileSync(
    process.execPath,
    [resolve(import.meta.dirname, "../bin/tools.mjs"), "github:now", "--root", root, "--dry-run"],
    { encoding: "utf8" }
  );
  assert(output.includes("#80 - Initial package"));
  assert(output.includes("Dry run"));
  assert.equal(
    execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }),
    before
  );
  checkVersions(root);
});
