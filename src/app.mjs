import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { config, ownedPath, run, runNpm } from "./repository.mjs";
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
  if (paths.mode && !["single-server", "split-server"].includes(paths.mode))
    throw new Error("Invalid app mode.");
  if (paths.envFile) ownedPath(root, paths.envFile);
  return paths;
}

export function buildApp(root) {
  const paths = appPaths(root);
  prepareApp(root, paths);
  const require = createRequire(resolve(root, "package.json"));
  const compiler = resolve(require.resolve("typescript/package.json"), "../bin/tsc");
  const vite = resolve(require.resolve("vite/package.json"), "../bin/vite.js");
  run(root, process.execPath, [compiler, "-p", paths.apiConfig]);
  run(root, process.execPath, [compiler, "-p", paths.webConfig, "--noEmit"]);
  run(root, process.execPath, [vite, "build"]);
}

export async function devApp(root) {
  const paths = appPaths(root);
  const settings = devSettings(root);
  prepareApp(root, paths);
  console.info("\n  > Application preflight");
  await preflightPorts(root, settings.endpoints ?? [settings.api, settings.web], settings.policy);
  const require = createRequire(resolve(root, "package.json"));
  const children = [
    spawn(
      process.execPath,
      [
        require.resolve("tsx/cli"),
        "watch",
        ...(paths.envFile ? [`--env-file=${ownedPath(root, paths.envFile)}`] : []),
        resolve(root, paths.apiEntry)
      ],
      {
        cwd: root,
        stdio: "inherit"
      }
    ),
    ...(paths.mode === "single-server"
      ? []
      : [
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
        ])
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
  console.info(
    sample.includes("COOKIE_SECRET=")
      ? "Created .env with a unique local cookie secret."
      : "Created .env from .env.example."
  );
}

function prepareApp(root, paths) {
  if (paths.beforeBuild) {
    if (typeof paths.beforeBuild !== "string" || !/^[a-zA-Z0-9:_-]+$/.test(paths.beforeBuild))
      throw new Error("Invalid preparation script.");
    runNpm(root, ["run", paths.beforeBuild]);
  }
}
