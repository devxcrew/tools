import assert from "node:assert/strict";
import { fork } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import test from "node:test";
import { devSettings, preflightPorts } from "../src/preflight.mjs";

test(
  "preflight replaces an app listener on the same port and protects other apps",
  { timeout: 30000 },
  async (t) => {
    const root = mkdtempSync(join(tmpdir(), "devxcrew-preflight-"));
    const worker = join(root, "server.mjs");
    writeFileSync(
      worker,
      'import {createServer} from "node:net"; const server=createServer();server.listen(0,"127.0.0.1",()=>process.send(server.address().port));'
    );
    const child = fork(worker, [], { stdio: ["ignore", "ignore", "ignore", "ipc"] });
    t.after(() => {
      child.kill();
      rmSync(root, { recursive: true, force: true });
    });
    const [port] = await once(child, "message");
    const endpoint = { host: "127.0.0.1", port };
    await assert.rejects(preflightPorts(join(root, "other-app"), [endpoint]), /another process/);
    await assert.rejects(preflightPorts(root, [endpoint], "abort"), /policy is abort/);
    assert.equal(child.exitCode, null);
    await preflightPorts(root, [endpoint]);
    const replacement = createServer();
    t.after(() => replacement.close());
    replacement.listen(port, endpoint.host);
    await once(replacement, "listening");
    assert.equal(replacement.address().port, port);
  }
);

test("reserved port settings come from root env and reject conflicting ports", (t) => {
  const root = mkdtempSync(join(tmpdir(), "devxcrew-settings-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const env = "API_HOST=127.0.0.1\nAPI_PORT=4310\nWEB_ORIGIN=http://127.0.0.1:4311\n";
  writeFileSync(join(root, ".env"), env);
  assert.deepEqual(devSettings(root), {
    api: { host: "127.0.0.1", port: 4310 },
    web: { host: "127.0.0.1", port: 4311 },
    policy: "restart"
  });
  writeFileSync(join(root, ".env"), env.replace("4311", "4310"));
  assert.throws(() => devSettings(root), /distinct reserved ports/);
});
