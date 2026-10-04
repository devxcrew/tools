import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
  realpathSync
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "../src/generation.mjs";

function fixture(t) {
  // macOS exposes its temporary directory through a system symlink.
  const root = realpathSync(mkdtempSync(resolve(tmpdir(), "tools-generation-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = resolve(root, "template");
  mkdirSync(source);
  writeFileSync(
    resolve(source, "package.json"),
    JSON.stringify({
      name: "{{APP_ID}}",
      version: "1.0.0",
      dependencies: { "@devxcrew/core-framework": "0.1.7" }
    })
  );
  writeFileSync(
    resolve(source, ".env.example"),
    "APP_ID={{APP_ID}}\nAPP_NAME={{APP_NAME}}\nAPP_PORT={{APP_PORT}}\nAPP_URL={{APP_URL}}\nCOOKIE_SECRET=\n"
  );
  writeFileSync(resolve(source, ".env"), "COOKIE_SECRET=operational-secret");
  writeFileSync(
    resolve(source, ".foundation-template.json"),
    JSON.stringify({ version: 1, files: ["package.json", ".env.example"] })
  );
  return {
    root,
    source,
    destination: resolve(root, "app"),
    id: "new-app",
    name: "New app",
    port: "5190",
    url: "http://localhost:5190"
  };
}

test("generation dry run preserves source and excludes unlisted operational files", (t) => {
  const options = fixture(t);
  const before = readFileSync(resolve(options.source, "package.json"), "utf8");
  assert.equal(createApp({ ...options, "dry-run": true }).dryRun, true);
  assert.equal(existsSync(options.destination), false);
  createApp(options);
  assert.equal(
    JSON.parse(readFileSync(resolve(options.destination, "package.json"), "utf8")).name,
    "new-app"
  );
  assert.match(readFileSync(resolve(options.destination, ".env.example"), "utf8"), /APP_PORT=5190/);
  assert.equal(existsSync(resolve(options.destination, ".env")), false);
  assert.equal(readFileSync(resolve(options.source, "package.json"), "utf8"), before);
  assert.throws(() => createApp(options), /already exists/);
});

test("fresh explicitly declared agent records are allowed and other history is rejected", (t) => {
  const options = fixture(t);
  mkdirSync(resolve(options.source, "agent"));
  writeFileSync(
    resolve(options.source, "agent/TASK.md"),
    "# Current task\n\nVerify the generated app.\n"
  );
  const manifest = {
    version: 1,
    freshAgentRecords: true,
    files: ["package.json", ".env.example", "agent/TASK.md"]
  };
  writeFileSync(resolve(options.source, ".foundation-template.json"), JSON.stringify(manifest));
  createApp(options);
  assert.match(
    readFileSync(resolve(options.destination, "agent/TASK.md"), "utf8"),
    /generated app/
  );
  manifest.files.push("agent/old-history.md");
  writeFileSync(resolve(options.source, "agent/old-history.md"), "historical source");
  writeFileSync(resolve(options.source, ".foundation-template.json"), JSON.stringify(manifest));
  assert.throws(
    () => createApp({ ...options, destination: resolve(options.root, "other") }),
    /Excluded agent history/
  );
});

test("generation escapes application name inside JavaScript string tokens", (t) => {
  const options = fixture(t);
  writeFileSync(resolve(options.source, "config.mjs"), 'export const name = "{{APP_NAME}}";');
  writeFileSync(
    resolve(options.source, ".foundation-template.json"),
    JSON.stringify({ version: 1, files: ["package.json", ".env.example", "config.mjs"] })
  );
  createApp({ ...options, name: 'New "quoted" app' });
  assert.match(
    readFileSync(resolve(options.destination, "config.mjs"), "utf8"),
    /New \\"quoted\\" app/
  );
});

test("invalid artifact fails before mutation and can safely retry after correction", (t) => {
  const options = fixture(t);
  writeFileSync(
    resolve(options.source, ".foundation-template.json"),
    JSON.stringify({ version: 1, files: ["package.json", ".env", ".env.example"] })
  );
  assert.throws(() => createApp(options), /Excluded/);
  assert.equal(existsSync(options.destination), false);
  writeFileSync(
    resolve(options.source, ".foundation-template.json"),
    JSON.stringify({ version: 1, files: ["package.json", ".env.example"] })
  );
  writeFileSync(resolve(options.root, ".app-create-interrupted"), "unrelated prior artifact");
  createApp(options);
  assert.equal(
    readFileSync(resolve(options.root, ".app-create-interrupted"), "utf8"),
    "unrelated prior artifact"
  );
});

test("generator rejects private dependencies, traversal and supplied secret values", (t) => {
  const options = fixture(t);
  writeFileSync(
    resolve(options.source, "package.json"),
    JSON.stringify({ name: "app", dependencies: { private: "file:../private" } })
  );
  assert.throws(() => createApp(options), /non-registry/);
  writeFileSync(resolve(options.source, "package.json"), '{"name":"app"}');
  writeFileSync(
    resolve(options.source, ".env.example"),
    "APP_ID={{APP_ID}}\nAPP_NAME={{APP_NAME}}\nAPP_PORT={{APP_PORT}}\nAPP_URL={{APP_URL}}\nCOOKIE_SECRET=copy-me\n"
  );
  assert.throws(() => createApp(options), /secret value/);
  writeFileSync(
    resolve(options.source, ".foundation-template.json"),
    JSON.stringify({ version: 1, files: ["package.json", "../secret", ".env.example"] })
  );
  assert.throws(() => createApp(options), /Excluded/);
  assert.equal(existsSync(options.destination), false);
});

test("orphaned interrupted staging remains isolated and retry creates a complete app", (t) => {
  const options = fixture(t);
  const orphan = resolve(options.root, ".app-create-interrupted");
  mkdirSync(orphan);
  writeFileSync(resolve(orphan, "partial.txt"), "interrupted process evidence");
  createApp(options);
  assert.equal(
    readFileSync(resolve(orphan, "partial.txt"), "utf8"),
    "interrupted process evidence"
  );
  assert.equal(existsSync(resolve(options.destination, "package.json")), true);
  assert.equal(existsSync(resolve(options.destination, "partial.txt")), false);
});

test("upgrade attempts preserve app-owned modules, environment and database bytes", (t) => {
  const options = fixture(t);
  createApp(options);
  mkdirSync(resolve(options.destination, "src/modules/orders"), { recursive: true });
  const records = {
    "src/modules/orders/orders.provider.ts": "export const owned = true;\n",
    ".env": "private fixture value\n",
    "application.sqlite": "persisted fixture bytes"
  };
  for (const [file, content] of Object.entries(records))
    writeFileSync(resolve(options.destination, file), content);
  assert.throws(() => createApp(options), /already exists/);
  assert.throws(() => createApp({ ...options, "dry-run": true }), /already exists/);
  for (const [file, content] of Object.entries(records))
    assert.equal(readFileSync(resolve(options.destination, file), "utf8"), content);
});

test(
  "killed generator leaves no published app and retry preserves unrelated staging",
  { timeout: 30000 },
  async (t) => {
    const options = fixture(t);
    const { spawn } = await import("node:child_process");
    const { readdirSync } = await import("node:fs");
    const { setTimeout: delay } = await import("node:timers/promises");
    const unrelated = resolve(options.root, ".app-create-other-owner");
    mkdirSync(unrelated);
    writeFileSync(resolve(unrelated, "owned.txt"), "other process evidence");
    mkdirSync(resolve(options.source, "payload"));
    const files = ["package.json", ".env.example"];
    const content = "foundation fixture payload\n".repeat(2500);
    for (let index = 0; index < 1200; index++) {
      const file = `payload/part-${index}.txt`;
      files.push(file);
      writeFileSync(resolve(options.source, file), content);
    }
    writeFileSync(
      resolve(options.source, ".foundation-template.json"),
      JSON.stringify({ version: 1, files })
    );
    const args = Object.entries(options)
      .filter(([key]) => key !== "root")
      .flatMap(([key, value]) => [`--${key}`, String(value)]);
    const child = spawn(
      process.execPath,
      [fileURLToPath(new URL("../bin/tools.mjs", import.meta.url)), "app:create", ...args],
      { stdio: "ignore" }
    );
    let closed = false;
    const completion = new Promise((accept, reject) => {
      child.once("error", reject);
      child.once("close", () => {
        closed = true;
        accept();
      });
    });
    try {
      const deadline = Date.now() + 15000;
      let staging;
      while (!staging && !closed && Date.now() < deadline) {
        staging = readdirSync(options.root).find(
          (name) => name.startsWith(".app-create-") && name !== ".app-create-other-owner"
        );
        if (!staging) await delay(1);
      }
      assert.ok(staging, "generator must reach its own staging directory before termination");
      assert.equal(child.kill("SIGKILL"), true);
      await completion;
      assert.equal(existsSync(options.destination), false, "partial app must never be published");
      createApp(options);
      assert.equal(readFileSync(resolve(options.destination, files.at(-1)), "utf8"), content);
      assert.equal(readFileSync(resolve(unrelated, "owned.txt"), "utf8"), "other process evidence");
    } finally {
      if (!closed) {
        child.kill("SIGKILL");
        await completion;
      }
    }
  }
);

test("blank secrets between populated environment lines are accepted", (t) => {
  const options = fixture(t);
  writeFileSync(
    resolve(options.source, ".env.example"),
    "MCP_SERVER_SECRET=\nAPP_ID={{APP_ID}}\nSMTP_PASSWORD= \t\nAPP_NAME={{APP_NAME}}\nAPP_PORT={{APP_PORT}}\nAPP_URL={{APP_URL}}\n"
  );
  createApp(options);
  assert.match(
    readFileSync(resolve(options.destination, ".env.example"), "utf8"),
    /MCP_SERVER_SECRET=\nAPP_ID=new-app/
  );
  writeFileSync(
    resolve(options.source, ".env.example"),
    "MCP_SERVER_SECRET=secret-value\nAPP_ID={{APP_ID}}\nAPP_NAME={{APP_NAME}}\nAPP_PORT={{APP_PORT}}\nAPP_URL={{APP_URL}}\n"
  );
  assert.throws(
    () => createApp({ ...options, destination: resolve(options.root, "rejected") }),
    /secret value/
  );
});
