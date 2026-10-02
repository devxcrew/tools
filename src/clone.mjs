import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";

export async function verifyClone(root) {
  const destination = resolve(root, "dist", "clone-smoke-" + Date.now());
  mkdirSync(destination, { recursive: true });
  const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  manifest.name = "codexsun-clone-verification";
  for (const file of [
    "api",
    "web",
    "tsconfig.base.json",
    "vite.config.ts",
    "playwright.config.ts",
    ".devxcrew-tools.json",
    "assist"
  ])
    cpSync(resolve(root, file), resolve(destination, file), { recursive: true });
  writeFileSync(resolve(destination, "package.json"), JSON.stringify(manifest, null, 2));
  const lock = JSON.parse(readFileSync(resolve(root, "package-lock.json"), "utf8"));
  lock.name = manifest.name;
  lock.packages[""].name = manifest.name;
  lock.packages[""].dependencies = manifest.dependencies;
  lock.packages[""].devDependencies = manifest.devDependencies;
  writeFileSync(resolve(destination, "package-lock.json"), JSON.stringify(lock, null, 2));
  for (const args of [
    ["ci", "--no-audit", "--no-fund"],
    ["run", "build"]
  ]) {
    const result = spawnSync(process.execPath, [process.env.npm_execpath, ...args], {
      cwd: destination,
      stdio: "inherit"
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }

  const socket = createServer();
  await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  const server = spawn(process.execPath, ["dist/api/server.js"], {
    cwd: destination,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      APP_ID: "clone-check",
      APP_NAME: "Clone check",
      NODE_ENV: "test",
      CLIENT_MODE: "single",
      SINGLE_CLIENT_ID: "clone-client",
      SINGLE_DATABASE_NAME: "clone_db",
      COOKIE_SECRET: randomBytes(32).toString("hex"),
      API_HOST: "127.0.0.1",
      API_PORT: String(port),
      WEB_ORIGIN: "http://127.0.0.1:4311"
    }
  });
  let output = "";
  server.stdout.on("data", (chunk) => {
    output += chunk;
  });
  server.stderr.on("data", (chunk) => {
    output += chunk;
  });
  try {
    const deadline = Date.now() + 20000;
    let response;
    while (Date.now() < deadline) {
      if (server.exitCode !== null) throw new Error(output);
      try {
        response = await fetch(`http://127.0.0.1:${port}/api/runtime`);
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
    assert(response?.ok, `Clone API did not start: ${output}`);
    assert.equal((await response.json()).data.applicationId, "clone-check");
    assert.equal((await fetch(`http://127.0.0.1:${port}/api/context`)).status, 401);
    console.info("Independent clone installed, built, and booted using compiled shared packages.");
  } finally {
    server.kill();
    await new Promise((resolve) => server.once("exit", resolve));
  }
}
