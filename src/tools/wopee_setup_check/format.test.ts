// Run with: node --test src/tools/wopee_setup_check/format.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  formatBasicCheck,
  formatSetupCheck,
  isUnknownSetupCheck,
  MISMATCH_FROM_AUTH_ERROR,
} from "./format.ts";

const data = {
  projectUuid: "11111111-aaaa",
  projectName: "Shop",
  appUrl: "https://shop.example",
  plan: "Pro",
  stepsLeft: 40,
  stepsLimit: 50,
  resetAt: "2026-11-10T10:00:00.000Z",
  commanderUrl: "https://cmd.wopee.io/projects/11111111-aaaa",
};

test("a valid key for the configured project is connected, with every field", () => {
  const text = formatSetupCheck(data, "11111111-AAAA");
  assert.match(text, /^CONNECTED/);
  for (const part of [
    "Shop (11111111-aaaa)",
    "https://shop.example",
    "Plan: Pro",
    "40 of 50 left, resets 2026-11-10T10:00:00.000Z",
    "https://cmd.wopee.io/projects/11111111-aaaa",
  ])
    assert.ok(text.includes(part), part);
});

test("a key from another project names both projects", () => {
  const text = formatSetupCheck(data, "22222222-bbbb");
  assert.match(text, /^SETUP MISMATCH/);
  assert.ok(text.includes("22222222-bbbb"));
  assert.ok(text.includes("Shop (11111111-aaaa)"));
});

test("a missing UUID says which one to set", () => {
  const text = formatSetupCheck(data, null);
  assert.match(text, /^SETUP INCOMPLETE/);
  assert.ok(text.includes("WOPEE_PROJECT_UUID=11111111-aaaa"));
});

test("missing app URL and unmetered steps read plainly", () => {
  const text = formatSetupCheck(
    { ...data, appUrl: null, stepsLeft: null, stepsLimit: null },
    data.projectUuid,
  );
  assert.ok(text.includes("App URL: not set"));
  assert.ok(text.includes("unlimited or not metered"));
});

test("a rejected key is named as a mismatch for the configured project", () => {
  assert.ok(MISMATCH_FROM_AUTH_ERROR("abc").includes("project abc"));
});

test("the basic check says the full one needs a newer server", () => {
  assert.match(formatBasicCheck("abc", 2), /newer Wopee\.io server/);
});

test("an api without setupCheck is recognised from the GraphQL validation error", () => {
  assert.ok(isUnknownSetupCheck('Cannot query field "setupCheck" on type "Query".'));
  assert.ok(!isUnknownSetupCheck("Not Authorised!"));
});
