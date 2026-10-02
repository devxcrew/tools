import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { config, ownedPath, run } from "./repository.mjs";
import { devSettings, preflightPorts, stopProcessTree } from "./preflight.mjs";

export function appPaths(root) {
  const paths = {
    apiConfig: "api/tsconfig.json",
    webConfig: "web/tsconfig.json",
    apiEntry: "api/src/server.ts",
    ...config(root).app
  };
  for (const key of ["apiConfig", "webConfig", "apiEntry"]) {
    if (typeof paths[key] !== "string" || !existsSync(ownedPath(root, paths[key])))
      throw new Error(`Missing application path: ${key}`);
  }
  return paths;
}

export function buildApp(root) {
  const paths = appPaths(root);
  const require = createRequire(resolve(root, "package.json"));
  const output = resolve(root, "dist/api");
  if (output !== resolve(root, "dist", "api")) throw new Error("Invalid app output.");
  rmSync(output, { recursive: true, force: true });
  const compiler = require.resolve("typescript/bin/tsc");
  const vite = resolve(require.resolve("vite/package.json"), "../bin/vite.js");
  run(root, process.execPath, [compiler, "-p", paths.apiConfig]);
  run(root, process.execPath, [compiler, "-p", paths.webConfig, "--noEmit"]);
  run(root, process.execPath, [vite, "build"]);
}

export async function devApp(root) {
  const paths = appPaths(root);
  const settings = devSettings(root);
  console.info("\n  > Application preflight");
  await preflightPorts(root, [settings.api, settings.web], settings.policy);
  const require = createRequire(resolve(root, "package.json"));
  const children = [
    spawn(process.execPath, [require.resolve("tsx/cli"), "watch", resolve(root, paths.apiEntry)], {
      cwd: root,
      stdio: "inherit"
    }),
    spawn(
      process.execPath,
      [
        resolve(require.resolve("vite/package.json"), "../bin/vite.js"),
        "--host",
        settings.web.host,
        "--port",
        String(settings.web.port),
        "--strictPort"
      ],
      {
        cwd: root,
        stdio: "inherit"
      }
    )
  ];
  let stopping = false;
  function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    for (const child of children) {
      if (child.exitCode !== null || !child.pid) continue;
      try {
        stopProcessTree(child.pid);
      } catch (error) {
        console.error(error.message);
      }
    }
    process.exitCode = code;
  }
  for (const child of children) {
    child.on("error", (error) => {
      console.error(error);
      stop(1);
    });
    child.on("exit", (code) => stop(code ?? 1));
  }
  process.on("SIGINT", () => stop());
  process.on("SIGTERM", () => stop());
}

export function initializeEnvironment(root) {
  const target = resolve(root, ".env");
  if (existsSync(target)) {
    console.info("Existing .env preserved.");
    return;
  }
  const sample = readFileSync(resolve(root, ".env.example"), "utf8");
  writeFileSync(
    target,
    sample.replace("COOKIE_SECRET=", `COOKIE_SECRET=${randomBytes(32).toString("hex")}`),
    { mode: 0o600, flag: "wx" }
  );
  console.info("Created .env with a unique local cookie secret.");
}
