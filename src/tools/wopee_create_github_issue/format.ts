// The text an MCP caller reads back after filing an issue.
//
// No runtime imports, which keeps it unit-testable under `node --test`.

export type CreatedGitHubIssue = {
  url: string;
  number: number;
  title: string;
  screenshotAttached?: boolean | null;
  labelsApplied?: string[] | null;
  warnings?: string[] | null;
};

export function formatIssueCreated(
  issue: CreatedGitHubIssue,
  { withRunEvidence }: { withRunEvidence: boolean },
): string {
  const lines = [
    "GitHub issue created successfully:",
    `- Title: ${issue.title}`,
    `- Number: #${issue.number}`,
    `- URL: ${issue.url}`,
  ];
  if (issue.labelsApplied?.length) {
    lines.push(`- Labels: ${issue.labelsApplied.join(", ")}`);
  }
  if (withRunEvidence) {
    lines.push(
      `- Run evidence: failing step, expected vs actual and the Commander report link added; screenshot ${issue.screenshotAttached ? "attached" : "not attached"}`,
    );
  }
  for (const warning of issue.warnings ?? []) {
    lines.push(`- Note: ${warning}`);
  }
  return lines.join("\n");
}
