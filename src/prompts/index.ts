import { fetchProjectSummary } from "./fetch_project_summary/index.js";
import { fetchTestResults } from "./fetch_test_results/index.js";
import { runTest } from "./run_test/index.js";

export const PROMPTS = [fetchProjectSummary, fetchTestResults, runTest];
