// Run with: npm test (it imports build/, which `pretest` builds). The factory and its zod schemas
// have runtime imports that `node --test` cannot resolve from the .ts sources.
import { test } from "node:test";
import assert from "node:assert/strict";

const { createDispatchAgentInput } =
  await import("../../../build/tools/wopee_dispatch_agent/factory.js");
const { DispatchAgentInputSchema, WopeeDispatchAgentInputSchema } =
  await import("../../../build/tools/wopee_dispatch_agent/schema.js");

process.env.WOPEE_PROJECT_UUID = "p-1";

// What the handler sends as the mutation's input for one test case of a tool call.
const mutationTestCase = (testCase: Record<string, unknown>) => {
  const input = WopeeDispatchAgentInputSchema.parse({
    suiteUuid: "analysis-1",
    analysisIdentifier: "A001",
    testCases: [{ userStoryId: "US001", testCaseId: "TC001", ...testCase }],
  });
  return DispatchAgentInputSchema.parse(createDispatchAgentInput(input))
    .testCases[0];
};

test("an explicit false reaches the mutation, so the run keeps the case intent-only", () => {
  assert.deepEqual(mutationTestCase({ stepsGenerationRequested: false }), {
    userStoryId: "US001",
    testCaseId: "TC001",
    stepsGenerationRequested: false,
  });
});

test("omitting it sends no value, so the api's default for step-less cases holds", () => {
  assert.deepEqual(mutationTestCase({}), {
    userStoryId: "US001",
    testCaseId: "TC001",
  });
});

test("true is not forwarded, so a case that has steps never gets them re-recorded", () => {
  assert.deepEqual(mutationTestCase({ stepsGenerationRequested: true }), {
    userStoryId: "US001",
    testCaseId: "TC001",
  });
});
