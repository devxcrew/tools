import assert from "node:assert/strict";
import test from "node:test";
import { checkDependencyOrder } from "../src/dependency-order.mjs";

test("shared packages reject reverse edges, cycles and obsolete npm names", () => {
  assert.throws(
    () =>
      checkDependencyOrder({
        name: "@devxcrew/tools",
        dependencies: { "@devxcrew/platform": "1.0.0" }
      }),
    /Reverse/
  );
  assert.throws(
    () =>
      checkDependencyOrder({
        name: "@devxcrew/framework",
        devDependencies: { "@devxcrew/platform": "1.0.80" }
      }),
    /Reverse/
  );
  assert.throws(
    () =>
      checkDependencyOrder({
        name: "@devxcrew/framework",
        dependencies: { "@devxcrew/ui": "1.0.80" }
      }),
    /same-layer/
  );
  assert.throws(
    () =>
      checkDependencyOrder({ name: "crm", dependencies: { "@devxcrew/platform-core": "1.0.80" } }),
    /Obsolete/
  );
  assert.throws(
    () =>
      checkDependencyOrder({ name: "crm", dependencies: { "@devxcrew/tools": "file:../tools" } }),
    /npm versions/
  );
  checkDependencyOrder({
    name: "@devxcrew/platform",
    peerDependencies: { "@devxcrew/framework": "^1.0.80" },
    devDependencies: { "@devxcrew/tools": "0.1.0" }
  });
  checkDependencyOrder({
    name: "@devxcrew/platform",
    dependencies: { "@devxcrew/tools": "0.1.0" }
  });
});

test("Codexsun apps can opt into local shared packages", () => {
  checkDependencyOrder(
    {
      name: "@codexsun/cxsun",
      devDependencies: { "@devxcrew/tools": "file:../tools" },
      dependencies: { "@devxcrew/ui": "file:../ui" }
    },
    { allowLocalPackages: true }
  );
});
