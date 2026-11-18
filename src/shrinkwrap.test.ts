// Run with: node --test src/shrinkwrap.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { shrinkwrapFrom } from "../scripts/shrinkwrap.mjs";

const lock = {
  name: "wopee-mcp",
  lockfileVersion: 3,
  packages: {
    "": { name: "wopee-mcp", dependencies: { a: "^1.0.0" }, devDependencies: { b: "^2.0.0" } },
    "node_modules/a": { version: "1.2.3", integrity: "sha512-a" },
    "node_modules/b": { version: "2.0.0", dev: true },
    "node_modules/c": { version: "3.0.0", optional: true },
  },
};

test("the published lock keeps exact runtime versions and drops development ones", () => {
  const wrap = shrinkwrapFrom(lock);
  assert.deepEqual(Object.keys(wrap.packages), ["", "node_modules/a", "node_modules/c"]);
  assert.deepEqual(wrap.packages[""], { name: "wopee-mcp", dependencies: { a: "^1.0.0" } });
  assert.equal(wrap.packages["node_modules/a"].integrity, "sha512-a");
  assert.equal(wrap.lockfileVersion, 3);
});
