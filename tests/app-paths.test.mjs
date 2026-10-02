import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import test from "node:test";
import { appPaths } from "../src/app.mjs";

test("app paths support existing and configured layouts and reject escaping paths", () => {
  const root = mkdtempSync(join(tmpdir(), "devxcrew-paths-"));
  try {
    for (const file of [
      "api/tsconfig.json",
      "web/tsconfig.json",
      "api/src/server.ts",
      "src/api/tsconfig.json",
      "src/web/tsconfig.json",
      "src/api/server.ts"
    ]) {
      mkdirSync(dirname(join(root, file)), { recursive: true });
      writeFileSync(join(root, file), "");
    }
    assert.equal(appPaths(root).apiEntry, "api/src/server.ts");
    const app = {
      apiConfig: "src/api/tsconfig.json",
      webConfig: "src/web/tsconfig.json",
      apiEntry: "src/api/server.ts"
    };
    writeFileSync(join(root, ".devxcrew-tools.json"), JSON.stringify({ app }));
    assert.deepEqual(appPaths(root), app);
    writeFileSync(
      join(root, ".devxcrew-tools.json"),
      JSON.stringify({ app: { apiEntry: "../server.ts" } })
    );
    assert.throws(() => appPaths(root), /Path leaves repository/);
    writeFileSync(
      join(root, ".devxcrew-tools.json"),
      JSON.stringify({ app: { apiEntry: "missing.ts" } })
    );
    assert.throws(() => appPaths(root), /Missing application path/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
