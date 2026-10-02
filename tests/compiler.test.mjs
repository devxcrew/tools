import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { buildApp } from "../src/app.mjs";
test("app build resolves compilers with restricted package exports", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "tools-compiler-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const log = resolve(root, "calls.jsonl");
  function put(file, text) {
    const target = resolve(root, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
  put("package.json", "{}");
  put("api.json", "{}");
  put("web.json", "{}");
  put("src/api/index.ts", "");
  put(
    ".devxcrew-tools.json",
    JSON.stringify({
      app: {
        mode: "single-server",
        apiConfig: "api.json",
        webConfig: "web.json",
        apiEntry: "src/api/index.ts"
      }
    })
  );
  const record = `require('node:fs').appendFileSync(${JSON.stringify(log)},JSON.stringify(process.argv.slice(2))+'\\n');`;
  put(
    "node_modules/typescript/package.json",
    JSON.stringify({ name: "typescript", exports: { "./package.json": "./package.json" } })
  );
  put("node_modules/typescript/bin/tsc", record);
  put(
    "node_modules/vite/package.json",
    JSON.stringify({ name: "vite", exports: { "./package.json": "./package.json" } })
  );
  put("node_modules/vite/bin/vite.js", record);
  buildApp(root);
  assert.deepEqual(readFileSync(log, "utf8").trim().split("\n").map(JSON.parse), [
    ["-p", "api.json"],
    ["-p", "web.json", "--noEmit"],
    ["build"]
  ]);
});
