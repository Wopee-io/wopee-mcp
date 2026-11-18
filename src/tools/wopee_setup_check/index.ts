import { getConfig } from "../../utils/getConfig.js";
import { RequestError, requestClient } from "../../utils/requestClient.js";
import { _parseError } from "../shared/helpers.js";
import { AnalysisSuite, ToolName } from "../shared/types.js";
import { FetchAnalysisSuites, SetupCheck } from "../shared/gql-queries.js";
import {
  formatBasicCheck,
  formatSetupCheck,
  isUnknownSetupCheck,
  COMMANDER_SESSION,
  MISMATCH_FROM_AUTH_ERROR,
  MISSING_UUID_NO_KEY_CHECK,
  REMOTE_CONNECTION_REFUSED,
  SetupCheckData,
} from "./format.js";

const textResult = (text: string) => ({
  content: [{ type: "text" as const, text }],
});

export const wopeeSetupCheck = {
  name: ToolName.WOPEE_SETUP_CHECK,
  config: {
    title: "Check the setup",
    description:
      "Verify that Wopee.io is connected: returns the project name and UUID, app URL, plan, steps left, reset time and the Commander link for the project of WOPEE_API_KEY, and names the problem when the key belongs to another project than WOPEE_PROJECT_UUID, the UUID is missing or the key is rejected. Read-only, takes no input. Call it as the last step of a setup and whenever a tool answers Not Authorised!.",
    inputSchema: {},
  },
  handler: async () => {
    const { WOPEE_PROJECT_UUID, WOPEE_INSIDE_COMMANDER, WOPEE_REMOTE } = getConfig();
    // Inside Commander the server signs in as the user (a session token, no API key): the api's
    // setupCheck is for API keys and MCP connections, and would answer "Not Authorised!", read as
    // a rejected key. The remote server's token is an MCP connection or a key: it gets the check.
    if (WOPEE_INSIDE_COMMANDER) return textResult(COMMANDER_SESSION);
    try {
      const result = await requestClient<{ setupCheck: SetupCheckData | null }>(
        SetupCheck,
        {},
      );
      if (!result?.setupCheck)
        return textResult(
          WOPEE_REMOTE
            ? REMOTE_CONNECTION_REFUSED
            : "SETUP CHECK FAILED: the api returned no project for this API key. Check WOPEE_API_KEY.",
        );
      return textResult(
        formatSetupCheck(result.setupCheck, WOPEE_PROJECT_UUID, { remote: WOPEE_REMOTE }),
      );
    } catch (error) {
      if (error instanceof RequestError) {
        if (WOPEE_REMOTE && error.code === "AUTH_ERROR")
          return textResult(REMOTE_CONNECTION_REFUSED);
        // An api without setupCheck answers HTTP 400 (a validation error), which arrives as
        // HTTP_ERROR "HTTP 400: Cannot query field …", so match the message, not the code.
        if (isUnknownSetupCheck(error.message))
          return basicCheck(WOPEE_PROJECT_UUID);
        if (error.code === "AUTH_ERROR")
          return textResult(
            WOPEE_PROJECT_UUID
              ? MISMATCH_FROM_AUTH_ERROR(WOPEE_PROJECT_UUID)
              : `SETUP INCOMPLETE: the API key was rejected and WOPEE_PROJECT_UUID is not set. Set WOPEE_API_KEY to a valid project key and WOPEE_PROJECT_UUID to the project's UUID: https://docs.wopee.io/guides/api-keys/`,
          );
      }
      return _parseError(error);
    }
  },
};

/** The api does not know `setupCheck` yet: confirm the key and project, say the rest needs a newer server. */
async function basicCheck(projectUuid: string | null) {
  if (!projectUuid) return textResult(MISSING_UUID_NO_KEY_CHECK);
  try {
    const result = await requestClient<{ fetchAnalysisSuites: AnalysisSuite[] }>(
      FetchAnalysisSuites,
      { projectUuid },
    );
    return textResult(
      formatBasicCheck(projectUuid, result?.fetchAnalysisSuites?.length ?? 0),
    );
  } catch (error) {
    if (error instanceof RequestError && error.code === "AUTH_ERROR")
      return textResult(MISMATCH_FROM_AUTH_ERROR(projectUuid));
    return _parseError(error);
  }
}
