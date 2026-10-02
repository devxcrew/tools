import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { builtinModules } from "node:module";
import { dirname, relative, resolve } from "node:path";
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
        /^@(codexsun|devxcrew)\/(framework|platform|platform-core)(\/|$)/.test(specifier)
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
