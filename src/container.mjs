import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { readJson, ownedPath } from "./repository.mjs";
import { checkDependencyOrder } from "./dependency-order.mjs";

export function prepareContainer(root) {
  const manifest = readJson(root, "package.json");
  checkDependencyOrder(manifest);
  const destination = ownedPath(root, "dist/container");
  if (existsSync(destination)) throw new Error("Container destination already exists.");
  const files = [
    "package.json",
    "package-lock.json",
    "api",
    "web",
    "tsconfig.base.json",
    "vite.config.ts",
    "Dockerfile",
    "nginx.conf",
    "compose.yaml",
    ".dockerignore"
  ];
  for (const file of files) {
    if (!existsSync(resolve(root, file))) throw new Error(`Missing container input: ${file}`);
  }
  mkdirSync(destination, { recursive: true });
  for (const file of files)
    cpSync(resolve(root, file), resolve(destination, file), { recursive: true });
  console.info("Prepared dist/container from npm manifests and source. No Docker command was run.");
}
