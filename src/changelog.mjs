import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readJson } from "./repository.mjs";

export const changelogPath = "assist/documentation/CHANGELOG.md";

export function readLatestEntry(root) {
  const source = readFileSync(resolve(root, changelogPath), "utf8");
  const match = source.match(
    /^### \[v (\d+\.\d+\.\d+)\] \d{4}-\d{2}-\d{2} \d{1,2}:\d{2} (?:am|pm) - (.+)$/m
  );
  if (!match) throw new Error("Missing CXApp-style versioned changelog entry.");
  return { version: match[1], reference: Number(match[1].split(".")[2]), title: match[2] };
}

export function timestamp(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} ${parts.dayPeriod.toLowerCase()}`;
}

export function entryDetails(options = {}) {
  const title = options.title ?? "Package maintenance";
  const note = options.note ?? "Updated package maintenance.";
  const databaseUpdate = options.databaseUpdate ?? "No";
  if (!title.trim() || /[\r\n]/.test(title))
    throw new Error("Title must be a nonempty single line.");
  if (!note.trim() || /[\r\n]/.test(note)) throw new Error("Note must be a nonempty single line.");
  if (!["Yes", "No"].includes(databaseUpdate))
    throw new Error("Database update must be Yes or No.");
  return { title, note, databaseUpdate };
}

export function renderEntry(version, options) {
  const details = entryDetails(options);
  return `### [v ${version}] ${timestamp()} - ${details.title}\n\n#### Database Changes\n\n- Database update: ${details.databaseUpdate} (manual).\n\n#### App Codebase Changes\n\n- ${details.note}\n\n`;
}

export function updateChangelog(source, version, options) {
  for (const field of ["Current version", "Release tag", "Changelog label"]) {
    if (!new RegExp(`^${field}: .+$`, "m").test(source))
      throw new Error(`Missing changelog state: ${field}`);
  }
  source = source
    .replace(/^Current version: .+$/m, `Current version: ${version}`)
    .replace(/^Release tag: .+$/m, `Release tag: v-${version}`)
    .replace(/^Changelog label: .+$/m, `Changelog label: v ${version}`);
  const section = `## v-${version}`;
  const pattern = new RegExp(`^${section.replaceAll(".", "\\.")}$`, "m");
  const entry = renderEntry(version, options);
  if (pattern.test(source)) return source.replace(pattern, `${section}\n\n${entry.trimEnd()}`);
  const firstSection = source.search(/^## v-/m);
  const at = firstSection === -1 ? source.length : firstSection;
  return `${source.slice(0, at)}${section}\n\n${entry}${source.slice(at)}`;
}

export function appendEntry(root, options) {
  const version = readJson(root, "package.json").version;
  const file = resolve(root, changelogPath);
  const source = readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
  const updated = updateChangelog(source, version, options);
  writeFileSync(file, updated);
  console.info(`Appended changelog entry for ${version}.`);
}
