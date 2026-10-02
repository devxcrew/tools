import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";

export function readJson(root, file) {
  return JSON.parse(readFileSync(resolve(root, file), "utf8"));
}

export function writeJson(root, file, value) {
  writeFileSync(resolve(root, file), JSON.stringify(value, null, 2) + "\n");
}

export function ownedPath(root, file) {
  const result = resolve(root, file);
  const within = relative(root, result);
  if (!within || within.startsWith("..") || isAbsolute(within))
    throw new Error(`Path leaves repository: ${file}`);
  return result;
}

export function config(root) {
  return existsSync(resolve(root, ".devxcrew-tools.json"))
    ? readJson(root, ".devxcrew-tools.json")
    : {};
}

export function sourceFiles(root) {
  const ignored = new Set([
    ".git",
    ".idea",
    ".vscode",
    ".vite",
    "node_modules",
    "dist",
    "vendor",
    "coverage",
    "test-results",
    "playwright-report",
    "target",
    ".cache"
  ]);
  function walk(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      if (
        ignored.has(entry.name) ||
        entry.isSymbolicLink() ||
        entry.name === ".env" ||
        (entry.name.startsWith(".env.") && ![".env.example", ".env.sample"].includes(entry.name))
      )
        return [];
      const file = resolve(directory, entry.name);
      return entry.isDirectory() ? walk(file) : [file];
    });
  }
  return walk(root);
}

export function run(root, executable, args, capture = false) {
  return execFileSync(executable, args, {
    cwd: root,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
    windowsHide: true
  })?.trim();
}

export function runNpm(root, args, capture = false) {
  if (!process.env.npm_execpath) throw new Error("Run this command through an npm script.");
  return run(root, process.execPath, [process.env.npm_execpath, ...args], capture);
}

export function readOptions(args) {
  const allowed = new Set([
    "root",
    "dry-run",
    "title",
    "note",
    "database-update",
    "release",
    "name",
    "directory",
    "archive-dir"
  ]);
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (!argument.startsWith("--")) throw new Error(`Unexpected argument: ${argument}`);
    const key = argument.slice(2);
    if (!allowed.has(key)) throw new Error(`Unknown option: --${key}`);
    if (key === "dry-run") options[key] = true;
    else {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
      options[key] = value;
    }
  }
  return options;
}
