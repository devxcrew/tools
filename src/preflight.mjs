import { execFileSync } from "node:child_process";
import { createServer } from "node:net";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "dotenv";
import { config, ownedPath } from "./repository.mjs";

export function devSettings(root) {
  const settings = config(root);
  const env = parse(readFileSync(ownedPath(root, settings.app?.envFile ?? ".env")));
  if (settings.app?.mode === "single-server") {
    const origin = new URL(env.APP_URL);
    const endpoint = {
      host: env.APP_HOST || origin.hostname.replace(/^\[|\]$/g, ""),
      port: portNumber(env.APP_PORT)
    };
    if (
      !["http:", "https:"].includes(origin.protocol) ||
      Number(origin.port || (origin.protocol === "https:" ? 443 : 80)) !== endpoint.port
    )
      throw new Error("APP_URL must match APP_PORT.");
    const policy = env.DEVXCREW_DEV_PORT_POLICY ?? "restart";
    if (!["restart", "abort"].includes(policy))
      throw new Error("Invalid DEVXCREW_DEV_PORT_POLICY.");
    return { endpoints: [endpoint], policy };
  }
  const origin = new URL(env.WEB_ORIGIN);
  if (!["http:", "https:"].includes(origin.protocol)) throw new Error("Invalid WEB_ORIGIN.");
  const api = { host: env.API_HOST, port: portNumber(env.API_PORT) };
  const web = {
    host: origin.hostname.replace(/^\[|\]$/g, ""),
    port: portNumber(origin.port || (origin.protocol === "https:" ? 443 : 80))
  };
  if (!api.host) throw new Error("Configure API_HOST in .env.");
  if (api.port === web.port) throw new Error("API and web require distinct reserved ports.");
  const policy = env.DEVXCREW_DEV_PORT_POLICY ?? "restart";
  if (!["restart", "abort"].includes(policy)) throw new Error("Invalid DEVXCREW_DEV_PORT_POLICY.");
  return { api, web, policy };
}

export async function preflightPorts(root, endpoints, policy = "restart") {
  if (!["restart", "abort"].includes(policy)) throw new Error("Invalid port policy.");
  const occupied = [];
  for (const endpoint of endpoints) {
    console.info(`  - Checking ${endpoint.host}:${endpoint.port}`);
    if (await portAvailable(endpoint)) continue;
    const pids = listenerPids(endpoint.port);
    if (!pids.length) throw new Error(`Cannot identify the listener on port ${endpoint.port}.`);
    if (policy === "abort")
      throw new Error(`Port ${endpoint.port} is occupied. Port policy is abort.`);
    occupied.push({ endpoint, pids });
  }
  // Validate every listener before stopping any process.
  const processes = occupied.length ? processTable() : [];
  const targets = new Set();
  for (const { endpoint, pids } of occupied) {
    for (const pid of pids) {
      const owner = processes.find((item) => item.pid === pid);
      if (!owner || !belongsToApp(owner.command, root) || pid === process.pid)
        throw new Error(
          `Port ${endpoint.port} belongs to another process (PID ${pid}). Stop it explicitly.`
        );
      targets.add(supervisorPid(owner, processes, root));
    }
  }
  for (const pid of targets) {
    stopProcessTree(pid, processes);
    console.info(`  ok Stopped existing app PID ${pid}`);
  }
  for (const endpoint of endpoints) {
    for (let attempt = 0; !(await portAvailable(endpoint)); attempt++) {
      if (attempt >= 40) throw new Error(`Port ${endpoint.port} was not released.`);
      await new Promise((done) => setTimeout(done, 250));
    }
    console.info(`  ok ${endpoint.host}:${endpoint.port} is ready`);
  }
}

export function stopProcessTree(pid, processes = processTable()) {
  if (!Number.isInteger(pid) || pid <= 0 || pid === process.pid)
    throw new Error("Invalid stop PID.");
  if (process.platform === "win32") {
    try {
      execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
        stdio: "pipe",
        windowsHide: true
      });
    } catch (error) {
      if (processTable().some((item) => item.pid === pid)) throw error;
    }
    return;
  }
  const descendants = (parent) =>
    processes
      .filter((item) => item.parent === parent)
      .flatMap((item) => [...descendants(item.pid), item.pid]);
  for (const target of [...descendants(pid), pid]) {
    try {
      process.kill(target, "SIGTERM");
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  }
}

function portNumber(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("Invalid reserved port.");
  return port;
}

function portAvailable({ host, port }) {
  return new Promise((done) => {
    const server = createServer();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") done(false);
      else done(Promise.reject(error));
    });
    server.once("listening", () =>
      server.close((error) => (error ? done(Promise.reject(error)) : done(true)))
    );
    server.listen(port, host);
  });
}

function listenerPids(port) {
  const options = { encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] };
  if (process.platform === "win32") {
    const output = execFileSync("netstat", ["-ano", "-p", "tcp"], options);
    return [
      ...new Set(
        output
          .split(/\r?\n/)
          .map((line) => line.trim().split(/\s+/))
          .filter((parts) => parts[3] === "LISTENING" && parts[1]?.endsWith(`:${port}`))
          .map((parts) => Number(parts[4]))
          .filter((pid) => pid > 0)
      )
    ];
  }
  try {
    return [
      ...new Set(
        execFileSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], options)
          .trim()
          .split(/\s+/)
          .map(Number)
          .filter((pid) => pid > 0)
      )
    ];
  } catch (error) {
    if (error.status === 1) return [];
    throw error;
  }
}

function processTable() {
  if (process.platform === "win32") {
    const output = execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress"
      ],
      { encoding: "utf8", windowsHide: true, maxBuffer: 8 * 1024 * 1024 }
    );
    return JSON.parse(output).map((item) => ({
      pid: item.ProcessId,
      parent: item.ParentProcessId,
      command: item.CommandLine ?? ""
    }));
  }
  return execFileSync("ps", ["-eo", "pid=,ppid=,args="], { encoding: "utf8" })
    .split("\n")
    .flatMap((line) => {
      const match = line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);
      return match ? [{ pid: Number(match[1]), parent: Number(match[2]), command: match[3] }] : [];
    });
}

function belongsToApp(command, root) {
  const normalized = command.replaceAll("\\", "/").toLowerCase();
  const directory = resolve(root).replaceAll("\\", "/").toLowerCase();
  return (
    (["/", '"', " "].some((suffix) => normalized.includes(directory + suffix)) ||
      normalized.endsWith(directory)) &&
    /(?:node|tsx|vite)(?:\.exe|[\s/"'])/.test(normalized)
  );
}

function supervisorPid(owner, processes, root) {
  let current = owner;
  while (current.parent && current.parent !== process.pid) {
    const parent = processes.find((item) => item.pid === current.parent);
    if (!parent) break;
    if (belongsToApp(parent.command, root) && /tools\.mjs.*app:dev/.test(parent.command))
      return parent.pid;
    current = parent;
  }
  return owner.pid;
}
