import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { appPaths } from "./app.mjs";
import { checkBoundaries } from "./boundaries.mjs";

export function doctorApp(root) {
  const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  const paths = appPaths(root);
  checkBoundaries(root);
  const failures = [];
  for (const [name, expected] of Object.entries({
    ...manifest.dependencies,
    ...manifest.devDependencies
  })) {
    const installed = resolve(root, "node_modules", name, "package.json");
    if (!existsSync(installed)) {
      failures.push(`${name}: missing installation`);
      continue;
    }
    const version = JSON.parse(readFileSync(installed, "utf8")).version;
    if (/^\d+\.\d+\.\d+$/.test(expected) && version !== expected)
      failures.push(`${name}: expected ${expected}, installed ${version}`);
  }
  if (failures.length) throw new Error(failures.join("\n"));
  return {
    name: manifest.name,
    version: manifest.version,
    paths,
    status: "passed",
    node: process.versions.node
  };
}
