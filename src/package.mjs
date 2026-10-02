import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { ownedPath, config, readJson, run, runNpm } from "./repository.mjs";

export function build(root) {
  const settings = config(root);
  if (!settings.build) throw new Error("Configure build in .devxcrew-tools.json.");
  const output = ownedPath(root, settings.build.output);
  if (relative(root, output).replaceAll("\\", "/") !== "dist/src")
    throw new Error("Package build output must be dist/src.");
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  const require = createRequire(resolve(root, "package.json"));
  const compiler = require.resolve("typescript/bin/tsc");
  run(root, process.execPath, [compiler, "-p", settings.build.tsconfig ?? "tsconfig.json"]);
  for (const file of settings.build.assets ?? []) {
    const source = ownedPath(root, `src/${file}`);
    const destination = ownedPath(output, file);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(source, destination);
  }
  checkPackage(root);
}

export function pack(root) {
  mkdirSync(ownedPath(root, "dist/releases"), { recursive: true });
  runNpm(root, ["pack", "--pack-destination", "dist/releases"]);
}

export function checkPackage(root) {
  const manifest = readJson(root, "package.json");
  if (!manifest.exports) throw new Error("Package has no public exports.");
  for (const [key, entry] of Object.entries(manifest.exports)) {
    for (const target of typeof entry === "string" ? [entry] : Object.values(entry)) {
      if (typeof target !== "string" || !target.startsWith("./dist/src/"))
        throw new Error(`Export ${key} must target compiled dist/src files.`);
      if (target.includes("*")) {
        const [prefix, suffix] = target.split("*");
        const directory = ownedPath(root, dirname(prefix));
        if (
          !existsSync(directory) ||
          !allFiles(directory).some(
            (file) => file.startsWith(resolve(root, prefix)) && file.endsWith(suffix)
          )
        )
          throw new Error(`Missing wildcard export ${key}: ${target}`);
      } else if (!existsSync(ownedPath(root, target)))
        throw new Error(`Missing export ${key}: ${target}`);
    }
  }
  if (allFiles(ownedPath(root, "dist/src")).some((file) => /\.(test|spec)\./.test(file)))
    throw new Error("Tests must not enter runtime output.");
  console.info(`${manifest.name}: compiled exports passed.`);
}

function allFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = resolve(directory, entry.name);
    return entry.isDirectory() ? allFiles(file) : [file];
  });
}
