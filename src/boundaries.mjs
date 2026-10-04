import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { builtinModules } from "node:module";
import { dirname, relative, resolve, sep } from "node:path";
import { config, readJson, sourceFiles } from "./repository.mjs";
import { checkDependencyOrder } from "./dependency-order.mjs";

export function checkBoundaries(root) {
  const manifest = readJson(root, "package.json");
  const settings = config(root);
  checkDependencyOrder(manifest, settings);
  const allowed = new Set(Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies }));
  for (const name of settings.boundaries?.developmentPackages ?? []) {
    if (!manifest.devDependencies?.[name])
      throw new Error(`Undeclared development package ${name}`);
    allowed.add(name);
  }
  const require = createRequire(resolve(root, "package.json"));
  const ts = require(settings.boundaries?.compilerPackage ?? "typescript");
  const roots = settings.boundaries?.sources ?? ["src"];
  const forbidden = settings.boundaries?.forbiddenPackages ?? ["@cxapp/"];
  const checkedBrowserContracts = new Set();
  for (const file of sourceFiles(root)) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const relativeFile = relative(root, file).replaceAll("\\", "/");
    if (!roots.some((source) => relativeFile.startsWith(source + "/"))) continue;
    const imports = [];
    const ast = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    function inspect(node) {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      )
        imports.push(node.moduleSpecifier.text);
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          node.expression.getText(ast) === "require") &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      )
        imports.push(node.arguments[0].text);
      ts.forEachChild(node, inspect);
    }
    inspect(ast);
    for (const specifier of imports) {
      if (
        (settings.boundaries?.frontendSources ?? []).some((source) =>
          relativeFile.startsWith(source + "/")
        ) &&
        /^@(codexsun|devxcrew)\/(framework|core-framework|platform|platform-core)(\/|$)/.test(
          specifier
        ) &&
        !browserContract(specifier, require, ts, checkedBrowserContracts)
      )
        throw new Error(`Backend package in frontend: ${relativeFile}`);
      if (
        forbidden.some(
          (name) =>
            specifier === name || specifier.startsWith(name.endsWith("/") ? name : name + "/")
        )
      )
        throw new Error(`Forbidden package ${specifier}: ${relativeFile}`);
      if (specifier.startsWith(".")) {
        const target = relative(root, resolve(dirname(file), specifier)).replaceAll("\\", "/");
        if (!roots.some((source) => target.startsWith(source + "/")))
          throw new Error(`Private source import ${specifier}: ${relativeFile}`);
      } else {
        const dependency = specifier.startsWith("@")
          ? specifier.split("/").slice(0, 2).join("/")
          : specifier.split("/")[0];
        if (
          specifier.startsWith("node:") ||
          builtinModules.includes(specifier) ||
          dependency === manifest.name
        )
          continue;
        const test = /\.(test|spec)\.tsx?$/.test(file);
        if (!allowed.has(dependency) && !(test && manifest.devDependencies?.[dependency]))
          throw new Error(`Undeclared runtime dependency ${dependency}: ${relativeFile}`);
      }
    }
  }
  console.info(`${manifest.name}: source dependencies passed.`);
}

function browserContract(specifier, require, ts, checked) {
  if (specifier !== "@devxcrew/platform/identity/schemas") return false;
  if (checked.has(specifier)) return true;
  const entry = realpathSync(require.resolve(specifier));
  const visited = new Set();
  // Resolve through the export map first. Inspect the shipped JavaScript, not package claims.
  function inspectFile(file) {
    const actual = realpathSync(file);
    if (visited.has(actual)) return;
    visited.add(actual);
    const ast = ts.createSourceFile(
      actual,
      readFileSync(actual, "utf8"),
      ts.ScriptTarget.Latest,
      true
    );
    function inspect(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
        inspectImport(node.moduleSpecifier.text, actual);
      }
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          node.expression.getText(ast) === "require")
      ) {
        if (!node.arguments[0] || !ts.isStringLiteral(node.arguments[0]))
          throw new Error("Dynamic browser contract dependency.");
        inspectImport(node.arguments[0].text, actual);
      }
      if (
        ts.isIdentifier(node) &&
        ["process", "Buffer", "__dirname", "__filename"].includes(node.text)
      )
        throw new Error("Node global in browser contract.");
      ts.forEachChild(node, inspect);
    }
    inspect(ast);
  }
  function inspectImport(name, parent) {
    if (name === "zod" || name.startsWith("zod/")) return;
    if (!name.startsWith(".")) throw new Error(`Server dependency in browser contract: ${name}`);
    const target = resolve(dirname(parent), name);
    const packageRoot = entry.slice(0, entry.lastIndexOf(`${sep}dist${sep}`));
    if (!packageRoot || !realpathSync(target).startsWith(packageRoot + sep))
      throw new Error("Browser contract import leaves package.");
    inspectFile(target);
  }
  inspectFile(entry);
  checked.add(specifier);
  return true;
}
