// Pure formatting of the wopee_setup_check answer. No runtime imports (loads under `node --test`).

export type SetupCheckData = {
  projectUuid: string;
  projectName: string;
  appUrl?: string | null;
  plan: string;
  stepsLeft?: number | null;
  stepsLimit?: number | null;
  resetAt?: string | null;
  commanderUrl: string;
};

const steps = (d: SetupCheckData): string => {
  if (d.stepsLeft == null) return "unlimited or not metered";
  const of = d.stepsLimit == null ? "" : ` of ${d.stepsLimit}`;
  const reset = d.resetAt ? `, resets ${d.resetAt}` : "";
  return `${d.stepsLeft}${of} left${reset}`;
};

/** The "you're connected" answer, or the mismatch when the key's project is not the configured one. */
export function formatSetupCheck(
  d: SetupCheckData,
  configuredUuid: string | null,
): string {
  const lines = [
    `Project: ${d.projectName} (${d.projectUuid})`,
    `App URL: ${d.appUrl || "not set"}`,
    `Plan: ${d.plan}`,
    `Steps: ${steps(d)}`,
    `Commander: ${d.commanderUrl}`,
  ];

  if (!configuredUuid) {
    return [
      "SETUP INCOMPLETE: WOPEE_PROJECT_UUID is not set, so the other tools have no project to work in.",
      `The API key is valid and belongs to project ${d.projectName}. Set WOPEE_PROJECT_UUID=${d.projectUuid} in the MCP server's environment, restart the client and run this check again.`,
      ...lines,
    ].join("\n");
  }
  if (configuredUuid.toLowerCase() !== d.projectUuid.toLowerCase()) {
    return [
      "SETUP MISMATCH: the API key belongs to another project than WOPEE_PROJECT_UUID.",
      `WOPEE_PROJECT_UUID is ${configuredUuid}; the key is for ${d.projectName} (${d.projectUuid}). Use the API key of project ${configuredUuid} (Commander > Project settings > API keys), or set WOPEE_PROJECT_UUID=${d.projectUuid} to work in ${d.projectName}.`,
      ...lines,
    ].join("\n");
  }
  return ["CONNECTED: the API key works for the configured project.", ...lines].join(
    "\n",
  );
}

export const MISMATCH_FROM_AUTH_ERROR = (uuid: string) =>
  `SETUP MISMATCH: the API key was rejected for project ${uuid}. It is a key of another project, revoked or mistyped. Create or copy an API key of project ${uuid} in Commander (Project settings > API keys), set it as WOPEE_API_KEY, restart the client and run this check again: https://docs.wopee.io/guides/api-keys/`;

export const MISSING_UUID_NO_KEY_CHECK =
  "SETUP INCOMPLETE: WOPEE_PROJECT_UUID is not set, and this server does not support the full check yet. Set WOPEE_PROJECT_UUID to the project's UUID (Commander > Project settings) and run this check again.";

export const NEEDS_NEWER_SERVER =
  "The full check (plan, steps left, app URL, Commander link) needs a newer Wopee.io server than the one WOPEE_API_URL points to.";

/** Fallback answer when the api does not know the setupCheck query yet. */
export function formatBasicCheck(
  projectUuid: string,
  analysisCount: number,
): string {
  return [
    `CONNECTED (basic check): the API key can read project ${projectUuid} (${analysisCount} analyses).`,
    NEEDS_NEWER_SERVER,
  ].join("\n");
}

/** True when the api rejected the query because it has no `setupCheck` field. */
export function isUnknownSetupCheck(message: string): boolean {
  return /cannot query field\s+["']?setupCheck/i.test(message);
}
