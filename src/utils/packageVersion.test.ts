// Run with: node --test src/utils/packageVersion.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { packageVersion } from "./packageVersion.ts";

test("the server reports the version from package.json", () => {
  const { version } = JSON.parse(readFileSync("package.json", "utf-8"));

  assert.equal(packageVersion(), version);
  assert.notEqual(packageVersion(), "1.0.0");
});
