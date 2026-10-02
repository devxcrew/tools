import { readFileSync, writeFileSync } from "node:fs";
import { basename, extname, relative } from "node:path";
import { sourceFiles } from "./repository.mjs";

const extensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
  ".scss",
  ".html",
  ".yaml",
  ".yml",
  ".toml",
  ".txt",
  ".svg",
  ".sh",
  ".ps1",
  ".sql",
  ".conf"
]);
const names = new Set([
  "gitignore.template",
  ".env.example",
  ".env.sample",
  ".gitignore",
  ".gitattributes",
  ".editorconfig",
  ".prettierignore",
  ".npmrc",
  "Dockerfile"
]);

export function normalizeLines(root, fix) {
  const changed = [];
  for (const file of sourceFiles(root)) {
    if (!extensions.has(extname(file)) && !names.has(basename(file))) continue;
    const buffer = readFileSync(file);
    if (buffer.includes(0)) continue;
    const source = buffer.toString("utf8");
    if (!source.includes("\r")) continue;
    changed.push(relative(root, file));
    if (fix) writeFileSync(file, source.replace(/\r\n?/g, "\n"));
  }
  if (!fix && changed.length) throw new Error(`Non-LF text files:\n${changed.join("\n")}`);
  console.info(
    `${fix ? "Normalized" : "Checked"} line endings. ${changed.length} file(s)${fix ? " changed" : " require changes"}.`
  );
  return changed;
}
