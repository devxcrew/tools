import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readJson } from "./repository.mjs";
import { changelogPath, readLatestEntry, updateChangelog } from "./changelog.mjs";

export function nextVersion(current, release = "patch") {
  if (!/^\d+\.\d+\.\d+$/.test(current) || !["patch", "minor", "major"].includes(release))
    throw new Error("Use a numeric semantic version and patch, minor, or major release.");
  const parts = current.split(".").map(Number);
  if (!parts.every(Number.isSafeInteger)) throw new Error("Invalid semantic version.");
  const index = { major: 0, minor: 1, patch: 2 }[release];
  parts[index]++;
  for (let offset = index + 1; offset < 3; offset++) parts[offset] = 0;
  if (!parts.every(Number.isSafeInteger)) throw new Error("Version overflow.");
  return parts.join(".");
}

export function bumpVersion(root, options = {}) {
  checkVersions(root);
  const manifest = readJson(root, "package.json");
  const next = nextVersion(manifest.version, options.release);
  const lock = readJson(root, "package-lock.json");
  const source = readFileSync(resolve(root, changelogPath), "utf8").replace(/\r\n?/g, "\n");
  const changelog = updateChangelog(source, next, options);
  const result = {
    currentVersion: manifest.version,
    nextVersion: next,
    dryRun: options.dryRun === true
  };
  if (options.dryRun) return result;
  manifest.version = next;
  lock.version = next;
  lock.packages[""].version = next;
  const updates = new Map([
    ["package.json", JSON.stringify(manifest, null, 2) + "\n"],
    ["package-lock.json", JSON.stringify(lock, null, 2) + "\n"],
    [changelogPath, changelog]
  ]);
  const previous = new Map(
    [...updates.keys()].map((file) => [file, readFileSync(resolve(root, file))])
  );
  try {
    for (const [file, content] of updates) writeFileSync(resolve(root, file), content);
  } catch (error) {
    for (const [file, content] of previous) writeFileSync(resolve(root, file), content);
    throw error;
  }
  return result;
}

export function checkVersions(root) {
  const manifest = readJson(root, "package.json");
  const lock = readJson(root, "package-lock.json");
  const latest = readLatestEntry(root);
  const source = readFileSync(resolve(root, changelogPath), "utf8");
  const version = manifest.version;
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error("Expected a numeric semantic version.");
  if (
    lock.version !== version ||
    lock.packages?.[""]?.version !== version ||
    latest.version !== version
  )
    throw new Error("Package, lockfile, and latest changelog versions differ.");
  for (const line of [
    `Current version: ${version}`,
    `Release tag: v-${version}`,
    `Changelog label: v ${version}`
  ]) {
    if (!source.split(/\r?\n/).includes(line))
      throw new Error(`Incorrect changelog state: ${line}`);
  }
  console.info(`${manifest.name}: version ${version} aligned.`);
}
