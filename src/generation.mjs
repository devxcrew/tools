import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";

export function createApp(options) {
  const source = realpathSync(required(options.source, "source"));
  const destination = resolve(required(options.destination, "destination"));
  const id = required(options.id, "id");
  const name = required(options.name, "name");
  const port = Number(options.port);
  if (!/^[a-z][a-z0-9-]{1,63}$/.test(id)) throw new Error("Invalid app id.");
  if (name.length > 100 || /[\r\n]/.test(name)) throw new Error("Invalid app name.");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid app port.");
  const url = new URL(required(options.url, "url"));
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    Number(url.port || (url.protocol === "https:" ? 443 : 80)) !== port
  ) {
    throw new Error("App URL must be an origin matching the port.");
  }
  if (destination === source || destination.startsWith(source + sep))
    throw new Error("Destination must be outside source.");
  if (existsSync(destination))
    throw new Error("Destination already exists. No files were changed.");
  const parent = dirname(destination);
  if (!existsSync(parent) || realpathSync(parent) !== parent)
    throw new Error("Destination parent must exist without symlinks.");
  const metadata = JSON.parse(readFileSync(resolve(source, ".foundation-template.json"), "utf8"));
  if (
    metadata.version !== 1 ||
    !Array.isArray(metadata.files) ||
    !metadata.files.includes("package.json") ||
    !metadata.files.includes(".env.example")
  )
    throw new Error("Invalid template file manifest.");
  if (new Set(metadata.files).size !== metadata.files.length)
    throw new Error("Duplicate template file.");
  const variables = { APP_ID: id, APP_NAME: name, APP_PORT: String(port), APP_URL: url.origin };
  const files = metadata.files.map((file) => {
    const path = validateFile(source, file, metadata.freshAgentRecords === true);
    let content = readFileSync(path, "utf8");
    if (
      file === ".env.example" &&
      !["APP_ID", "APP_NAME", "APP_PORT", "APP_URL"].every((key) => content.includes(`{{${key}}}`))
    ) {
      throw new Error("Template environment must declare all application tokens.");
    }
    if (content.includes("\u0000")) throw new Error("Binary template file rejected.");
    for (const [key, value] of Object.entries(variables)) {
      let replacement =
        file.endsWith(".json") || /\.[cm]?[jt]sx?$/.test(file)
          ? JSON.stringify(value).slice(1, -1)
          : value;
      if (/\.[cm]?[jt]sx?$/.test(file))
        replacement = replacement
          .replaceAll("'", "\\'")
          .replaceAll("`", "\\`")
          .replaceAll("${", "\\${");
      content = content.replaceAll(`{{${key}}}`, replacement);
    }
    if (/\{\{APP_[A-Z_]+\}\}/.test(content)) throw new Error("Unknown application template token.");
    if (file === "package.json" || file === "package-lock.json")
      validateDependencies(JSON.parse(content));
    if (
      file === ".env.example" &&
      /^[ \t]*(?:[A-Z_]*(?:SECRET|TOKEN|PASSWORD|API_KEY))[ \t]*=[ \t]*[^\s#]+/m.test(content)
    )
      throw new Error("Template environment contains a secret value.");
    return { file, content };
  });
  if (options["dry-run"])
    return { destination, id, files: files.map(({ file }) => file), dryRun: true };
  const staging = resolve(parent, `.app-create-${randomUUID()}`);
  mkdirSync(staging);
  try {
    for (const { file, content } of files) {
      const target = resolve(staging, file);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content, { flag: "wx" });
    }
    if (existsSync(destination)) throw new Error("Destination appeared during generation.");
    renameSync(staging, destination);
  } finally {
    if (existsSync(staging)) rmSync(staging, { recursive: true });
  }
  return { destination, id, files: files.map(({ file }) => file), dryRun: false };
}

function required(value, name) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing --${name}.`);
  return value.trim();
}

function validateFile(source, file, freshAgentRecords) {
  if (typeof file !== "string" || isAbsolute(file) || file.includes("\\"))
    throw new Error("Invalid template path.");
  const segments = file.split("/");
  const freshFiles = new Set([
    "agent/connect.mjs",
    "agent/PLAN.md",
    "agent/TASK.md",
    "agent/AUDIT.md",
    "agent/SKILLS.md",
    "agent/CHANGELOG.md"
  ]);
  if (segments[0] === "agent" && (!freshAgentRecords || !freshFiles.has(file)))
    throw new Error(`Excluded agent history: ${file}`);
  if (segments[0] === ".github" && file !== ".github/workflows/check.yml")
    throw new Error(`Excluded template workflow: ${file}`);
  const forbidden = new Set([
    "..",
    ".",
    "",
    ".git",
    "node_modules",
    "storage",
    "vendor",
    "dist",
    "coverage",
    ".env"
  ]);
  if (
    segments.some((part) => forbidden.has(part)) ||
    /\.(?:sqlite|sqlite3|db|pem|key|p12|tgz)$/i.test(file) ||
    (segments.at(-1).startsWith(".env") && file !== ".env.example")
  )
    throw new Error(`Excluded template path: ${file}`);
  const path = resolve(source, file);
  let current = source;
  for (const segment of segments) {
    current = resolve(current, segment);
    if (lstatSync(current).isSymbolicLink()) throw new Error("Template symlink rejected.");
  }
  if (!lstatSync(path).isFile() || relative(source, realpathSync(path)).startsWith(".."))
    throw new Error("Template path leaves source.");
  return path;
}

function validateDependencies(manifest) {
  const records = [manifest, ...Object.values(manifest.packages ?? {})];
  for (const record of records) {
    for (const dependencies of [
      record.dependencies,
      record.devDependencies,
      record.optionalDependencies
    ]) {
      for (const value of Object.values(dependencies ?? {})) {
        if (
          typeof value !== "string" ||
          /^(?:file:|link:|workspace:|git|https?:|\.\.?[\\/])/.test(value)
        )
          throw new Error("Template requires non-registry dependency.");
      }
    }
    if (record.resolved && !/^https:\/\/registry\.npmjs\.org\//.test(record.resolved))
      throw new Error("Template lock requires non-registry artifact.");
  }
}
