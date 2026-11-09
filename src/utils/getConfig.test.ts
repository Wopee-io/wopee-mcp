// Run with: node --test src/utils/getConfig.test.ts
import { afterEach, test } from "node:test";
import assert from "node:assert/strict";

import { getConfig } from "./getConfig.ts";

const NAMES = [
  "WOPEE_API_URL",
  "WOPEE_API_KEY",
  "WOPEE_PROJECT_UUID",
  "WOPEE_AUTH_TOKEN",
] as const;
const saved = Object.fromEntries(NAMES.map((n) => [n, process.env[n]]));

afterEach(() => {
  for (const n of NAMES) {
    if (saved[n] === undefined) delete process.env[n];
    else process.env[n] = saved[n];
  }
});

test("an unset WOPEE_API_URL falls back to the public api", () => {
  delete process.env.WOPEE_API_URL;
  assert.equal(getConfig().WOPEE_API_URL, "https://api.wopee.io");
});

test("an empty WOPEE_API_URL, as an unset ${WOPEE_API_URL} expands to, counts as unset", () => {
  process.env.WOPEE_API_URL = "";
  assert.equal(getConfig().WOPEE_API_URL, "https://api.wopee.io");

  process.env.WOPEE_API_URL = "   ";
  assert.equal(getConfig().WOPEE_API_URL, "https://api.wopee.io");
});

test("a set WOPEE_API_URL is used as given", () => {
  process.env.WOPEE_API_URL = "https://api.example.wopee.io";
  assert.equal(getConfig().WOPEE_API_URL, "https://api.example.wopee.io");
});

test("empty key, project and token values count as unset", () => {
  process.env.WOPEE_API_KEY = "";
  process.env.WOPEE_PROJECT_UUID = "";
  process.env.WOPEE_AUTH_TOKEN = "";

  const config = getConfig();
  assert.equal(config.WOPEE_API_KEY, null);
  assert.equal(config.WOPEE_PROJECT_UUID, null);
  assert.equal(config.WOPEE_AUTH_TOKEN, null);
});
