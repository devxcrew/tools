import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { devSettings } from "../src/preflight.mjs";

test("single server preflight uses APP settings and checks one port", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "tools-single-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(
    resolve(root, ".devxcrew-tools.json"),
    JSON.stringify({ app: { mode: "single-server" } })
  );
  writeFileSync(
    resolve(root, ".env"),
    "APP_URL=http://127.0.0.1:5173\nAPP_PORT=5173\nAPP_HOST=127.0.0.1\n"
  );
  assert.deepEqual(devSettings(root), {
    endpoints: [{ host: "127.0.0.1", port: 5173 }],
    policy: "restart"
  });
  writeFileSync(resolve(root, ".env"), "APP_URL=http://127.0.0.1:5174\nAPP_PORT=5173\n");
  assert.throws(() => devSettings(root), /APP_URL/);
});

test("preflight reads the configured env file and validates IPv6 and port policy", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "tools-env-path-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(
    resolve(root, ".devxcrew-tools.json"),
    JSON.stringify({
      app: { mode: "single-server", envFile: ".app.env" }
    })
  );
  writeFileSync(resolve(root, ".app.env"), "APP_URL=http://[::1]:5173\nAPP_PORT=5173\n");
  assert.deepEqual(devSettings(root), {
    endpoints: [{ host: "::1", port: 5173 }],
    policy: "restart"
  });
  writeFileSync(
    resolve(root, ".app.env"),
    "APP_URL=http://[::1]:5173\nAPP_PORT=5173\nDEVXCREW_DEV_PORT_POLICY=invalid\n"
  );
  assert.throws(() => devSettings(root), /DEVXCREW_DEV_PORT_POLICY/);
  writeFileSync(
    resolve(root, ".devxcrew-tools.json"),
    JSON.stringify({
      app: { mode: "single-server", envFile: "../outside.env" }
    })
  );
  assert.throws(() => devSettings(root), /leaves repository/);
});
