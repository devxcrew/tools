const layers = new Map([
  ["@devxcrew/tools", 0],
  ["@devxcrew/framework", 1],
  ["@devxcrew/ui", 1],
  ["@devxcrew/platform", 2],
  ["@devxcrew/cli", 3]
]);

export function checkDependencyOrder(manifest) {
  const ownerLayer = layers.get(manifest.name) ?? 4;
  for (const section of ["dependencies", "peerDependencies", "devDependencies"]) {
    for (const [name, version] of Object.entries(manifest[section] ?? {})) {
      if (name.startsWith("@codexsun/") || name === "@devxcrew/platform-core")
        throw new Error(`Obsolete shared package: ${name}`);
      if (name.startsWith("@devxcrew/") && /^(file:|link:|workspace:|git|https?:)/.test(version))
        throw new Error(`Shared packages must use npm versions: ${name}`);
      if (layers.has(name) && layers.get(name) >= ownerLayer)
        throw new Error(`Reverse or same-layer dependency: ${manifest.name} -> ${name}`);
    }
  }
}
