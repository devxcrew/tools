import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { checkBoundaries } from "../src/boundaries.mjs";
import { readOptions } from "../src/repository.mjs";

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
