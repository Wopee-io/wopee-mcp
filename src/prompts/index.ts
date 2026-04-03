import { fetchProjectSummary } from "./fetch_project_summary/index.js";
import { fetchTestResults } from "./fetch_test_results/index.js";

export const PROMPTS = [fetchProjectSummary, fetchTestResults];
