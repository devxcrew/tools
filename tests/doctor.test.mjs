import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { doctorApp } from "../src/doctor.mjs";

test("doctor validates app paths and reports exact installed version mismatches", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "tools-doctor-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (file, content) => {
    mkdirSync(dirname(resolve(root, file)), { recursive: true });
    writeFileSync(resolve(root, file), content);
  };
  write(
    "package.json",
    JSON.stringify({
      name: "doctor-app",
      version: "1.0.0",
      dependencies: { "example-package": "1.0.0" }
    })
  );
  write(
    ".devxcrew-tools.json",
    JSON.stringify({
      boundaries: { compilerPackage: createRequire(import.meta.url).resolve("typescript") }
    })
  );
  for (const file of ["api/tsconfig.json", "web/tsconfig.json", "api/src/server.ts"])
    write(file, "");
  assert.throws(() => doctorApp(root), /missing installation/);
  write("node_modules/example-package/package.json", '{"version":"2.0.0"}');
  assert.throws(() => doctorApp(root), /expected 1.0.0, installed 2.0.0/);
  write("node_modules/example-package/package.json", '{"version":"1.0.0"}');
  assert.equal(doctorApp(root).status, "passed");
});
