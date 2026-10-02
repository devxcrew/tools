import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { initializeEnvironment } from "../src/app.mjs";

test("environment initialization creates unique secrets and preserves existing files", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "devxcrew-tools-env-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(resolve(root, ".env.example"), "COOKIE_SECRET=\n");
  initializeEnvironment(root);
  const environment = readFileSync(resolve(root, ".env"), "utf8");
  assert.match(environment, /COOKIE_SECRET=[a-f0-9]{64}/);
  initializeEnvironment(root);
  assert.equal(readFileSync(resolve(root, ".env"), "utf8"), environment);
});
