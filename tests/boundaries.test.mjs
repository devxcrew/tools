import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { checkBoundaries } from "../src/boundaries.mjs";
import { readOptions } from "../src/repository.mjs";
import { createRequire } from "node:module";

test("boundary parser rejects private sources, undeclared dependencies, dynamic imports and backend frontend imports", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "devxcrew-tools-boundaries-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(resolve(root, "src"));
  symlinkSync(
    resolve(import.meta.dirname, "../node_modules"),
    resolve(root, "node_modules"),
    "junction"
  );
  writeFileSync(
    resolve(root, "package.json"),
    JSON.stringify({ name: "@test/owner", dependencies: { zod: "4.4.3" } })
  );
  writeFileSync(
    resolve(root, ".devxcrew-tools.json"),
    JSON.stringify({
      boundaries: {
        sources: ["src"],
        forbiddenPackages: ["@devxcrew/framework"],
        frontendSources: ["src"]
      }
    })
  );
  const source = resolve(root, "src/index.ts");
  for (const [content, message] of [
    ['export * from "../../private-package/src/index.js";', /Private source/],
    ['import "undeclared-package";', /Undeclared runtime/],
    ['const dependency = import("@devxcrew/framework/api");', /Backend package/]
  ]) {
    writeFileSync(source, content);
    assert.throws(() => checkBoundaries(root), message);
  }
  writeFileSync(source, 'import { z } from "zod"; export { z };');
  checkBoundaries(root);
  assert.throws(() => readOptions(["--dryrun", "true"]), /Unknown option/);
});

test("frontend allows only the public Platform schema export with a browser-safe shipped graph", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "tools-browser-contract-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(resolve(root, "src"));
  const packageRoot = resolve(root, "node_modules/@devxcrew/platform");
  mkdirSync(resolve(packageRoot, "dist"), { recursive: true });
  writeFileSync(
    resolve(root, "package.json"),
    JSON.stringify({ name: "browser-app", dependencies: { "@devxcrew/platform": "0.1.0" } })
  );
  writeFileSync(
    resolve(root, ".devxcrew-tools.json"),
    JSON.stringify({
      boundaries: {
        frontendSources: ["src"],
        compilerPackage: createRequire(import.meta.url).resolve("typescript")
      }
    })
  );
  writeFileSync(
    resolve(packageRoot, "package.json"),
    JSON.stringify({
      name: "@devxcrew/platform",
      type: "module",
      exports: { "./identity/schemas": "./dist/schemas.js" }
    })
  );
  writeFileSync(resolve(packageRoot, "dist/schemas.js"), 'export * from "./owner-schema.js";');
  writeFileSync(
    resolve(packageRoot, "dist/owner-schema.js"),
    'import { z } from "zod"; export const schema = z.string();'
  );
  const source = resolve(root, "src/index.ts");
  writeFileSync(source, 'import { schema } from "@devxcrew/platform/identity/schemas";');
  checkBoundaries(root);
  writeFileSync(
    resolve(packageRoot, "dist/owner-schema.js"),
    'import { readFile } from "node:fs";'
  );
  assert.throws(() => checkBoundaries(root), /Server dependency/);
  writeFileSync(
    resolve(packageRoot, "dist/owner-schema.js"),
    "export const value = process.env.SECRET;"
  );
  assert.throws(() => checkBoundaries(root), /Node global/);
  for (const specifier of [
    "@devxcrew/platform",
    "@devxcrew/platform/identity",
    "@devxcrew/platform/src/private",
    "@devxcrew/platform/identity/schemas/private"
  ]) {
    writeFileSync(source, `import "${specifier}";`);
    assert.throws(() => checkBoundaries(root), /Backend package/);
  }
});
