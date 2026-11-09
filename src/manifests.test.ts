// Run with: node --test src/manifests.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf-8"));

const { version } = readJson("package.json");
const server = readJson("server.json");

test("server.json and the Cursor plugin carry the package version", () => {
  assert.equal(server.version, version);
  for (const pkg of server.packages) assert.equal(pkg.version, version);
  assert.equal(readJson(".cursor-plugin/plugin.json").version, version);
});

test("the registry entry requires the api key and the project UUID", () => {
  const env = Object.fromEntries(
    server.packages[0].environmentVariables.map(
      (v: { name: string; isRequired: boolean }) => [v.name, v.isRequired],
    ),
  );

  assert.equal(env.WOPEE_API_KEY, true);
  assert.equal(env.WOPEE_PROJECT_UUID, true);
  assert.equal(env.WOPEE_API_URL, false);
});
