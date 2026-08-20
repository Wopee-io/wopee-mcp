# [1.30.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.29.1...v1.30.0) (2026-08-20)


### Features

  **dispatch:**report the run handles a caller needs to track its dispatch([7fe216f](https://github.com/Wopee-io/wopee-mcp/commit/7fe216f42b2a59340d628db9c86b1ede0293df9e))
backlog#4382. The dispatch result told a caller its suite and analysis uuids
but not which row or which GitHub Actions run belonged to it, so orchestrators
guessed from a gh run list poll and raced each other under parallel dispatch.

Print each row's executedTestCaseUuid and its runName, which the api now
stores verbatim and makes unique per dispatch. formatDispatchSuccess moves to
its own type-only module so node --test can load it without the enums in
shared/types.ts.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

## [1.29.1](https://github.com/Wopee-io/wopee-mcp/compare/v1.29.0...v1.29.1) (2026-08-19)


### Bug Fixes

  **artifact:**compact tests.json before it reaches the model([005a298](https://github.com/Wopee-io/wopee-mcp/commit/005a298012f98d2acfbfae089c5a364eb4281d80)), closes[autonomous-testing/backlog#4252](https://github.com/autonomous-testing/backlog/issues/4252)[api#904](https://github.com/api/issues/904)[autonomous-testing/backlog#4252](https://github.com/autonomous-testing/backlog/issues/4252)
The api now commits the USER_STORIES artifact pretty-printed so a
test-case edit is reviewable as a GitHub PR diff

# [1.29.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.28.0...v1.29.0) (2026-07-21)


### Features

add wopee_fetch_test_inventory tool for chat test counts and statuses([20514a1](https://github.com/Wopee-io/wopee-mcp/commit/20514a102da9ebc9ca99eaada4403793570234c7)), closes[autonomous-testing/backlog#4290](https://github.com/autonomous-testing/backlog/issues/4290)[autonomous-testing/backlog#4125](https://github.com/autonomous-testing/backlog/issues/4125)
Composes fetchAnalysisSuites + fetchArtifact(USER_STORIES) +
fetchExecutedTestCases and left-joins each authored test case to its latest
execution (never-run => NOT_RUN), with regular vs reusable (R001) counts.
Pure join logic lives in logic.ts and is unit-tested via node:test. Gives the
chat a deterministic answer for "how many tests", "list scenarios", and
"executed + not-run in one list".

# [1.28.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.27.0...v1.28.0) (2026-07-13)


### Features

add wopee_fetch_variables tool([341a98e](https://github.com/Wopee-io/wopee-mcp/commit/341a98e05f49217b1f2bef0a9b8a2735eda24a0b))
New MCP tool to read run-time variables (additionalVariables) at either
level via the new api-key read paths:

- level: PROJECT reads project-level variables using WOPEE_PROJECT_UUID.
- level: ANALYSIS reads a suite's variables (requires suiteUuid).

Adds the VariableLevel enum, the FetchProjectVariables / FetchSuiteVariables
GraphQL queries, and registers the tool. Returns the raw JSON string array
(or [] when unset).

Part of epic #4148. Closes #4151.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
add wopee_update_variables tool([6ffce68](https://github.com/Wopee-io/wopee-mcp/commit/6ffce6844fecbcdff42401a9bb337c5c1dd86b40))
New MCP tool to upsert run-time variables (additionalVariables) at either
level via the new api-key write paths:

- level: PROJECT writes project-level variables using WOPEE_PROJECT_UUID.
- level: ANALYSIS writes a suite's variables (requires suiteUuid).

Merge semantics are enforced server-side: keys in variables[] are added or
overwritten, existing keys are preserved. Lifts AdditionalVariableSchema into
shared/schemas.ts (reused by wopee_dispatch_analysis), adds the
UpdateProjectVariables / UpdateSuiteVariables mutations, and registers the tool.

Part of epic #4148. Closes #4152.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>

# [1.27.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.26.2...v1.27.0) (2026-06-11)


### Features

add tool to fetch recent test executions([5910e8a](https://github.com/Wopee-io/wopee-mcp/commit/5910e8a4c82bbd9eee8a40d01b66d2d0f10b8d69))

## [1.26.2](https://github.com/Wopee-io/wopee-mcp/compare/v1.26.1...v1.26.2) (2026-05-06)


### Bug Fixes

  **gql:**GenerateUserStoriesWithTestCases selects correct field name([1b828d7](https://github.com/Wopee-io/wopee-mcp/commit/1b828d724539fe26f8424ca84025b91a82b18292)), closes[autonomous-testing/backlog#3987](https://github.com/autonomous-testing/backlog/issues/3987)
The mutation operation name is GenerateUserStoriesWithTestCases but the
field selected was generateUserStories — which doesn't exist on the API
(api/src/typeDefs/userStories.js:7 only exposes generateUserStoriesWithTestCases).
Any call to wopee_generate_artifact with type: USER_STORIES_WITH_TEST_CASES
fails with GRAPHQL_VALIDATION_FAILED.

Sibling Generate* mutations in the same file (App, GeneralUserStories,
TestCases, TestCaseSteps, ReusableTestCases, ReusableTestCaseSteps) were
verified — operation name and field name match in every other case.
Isolated copy-paste error.

## [1.26.1](https://github.com/Wopee-io/wopee-mcp/compare/v1.26.0...v1.26.1) (2026-05-06)


### Bug Fixes

  **wopee_update_artifact:**drop false "artifact must exist" prerequisite([a47f4e9](https://github.com/Wopee-io/wopee-mcp/commit/a47f4e9ae5b3960043fa6a4f58eb0130782b2af6)), closes[autonomous-testing/backlog#3986](https://github.com/autonomous-testing/backlog/issues/3986)
The tool description claimed the target artifact had to be pre-generated via
wopee_generate_artifact, which forced callers to insert a wasteful
generateArtifact call before any "bring-your-own-content" upload.

The server-side updateArtifact resolver in wopee-repos/api has no existence
check — it routes by ArtifactType to S3 or GitHub storage and writes content
directly. Artifacts are blob storage, not Neo4j nodes, so there is no
existence relationship to enforce. The resolver is already a
create-or-overwrite. The MCP description was simply wrong.

Reword the description to:
- frame the tool as create-or-overwrite for caller-supplied content;
- explicitly state it works on freshly-created blank suites;
- clarify the split with wopee_generate_artifact (AI-authored vs caller-supplied);
- replace "missing artifact" failure mode with "storage misconfiguration".

# [1.26.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.25.0...v1.26.0) (2026-04-23)


### Features

implement run test workflow with prompts and handler([33528d5](https://github.com/Wopee-io/wopee-mcp/commit/33528d5b33275ab367fd2ff3aa1ec50e8761fe94))

# [1.25.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.24.1...v1.25.0) (2026-04-17)


### Features

add customizable timeout option for request client([f600906](https://github.com/Wopee-io/wopee-mcp/commit/f600906ed2dea841d9de7b50dc3373d5cacb22af))

## [1.24.1](https://github.com/Wopee-io/wopee-mcp/compare/v1.24.0...v1.24.1) (2026-04-15)


### Bug Fixes

handle failure case for sending chat messages([fd2bd9f](https://github.com/Wopee-io/wopee-mcp/commit/fd2bd9fa3f285145265261af47971d9f2ab55bcc))

# [1.24.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.23.2...v1.24.0) (2026-04-15)


### Features

implement chat tools and GitHub issue creation functionality([a4ad90c](https://github.com/Wopee-io/wopee-mcp/commit/a4ad90c78b661f6a48d36676acad4aa79d3913e7))

## [1.23.2](https://github.com/Wopee-io/wopee-mcp/compare/v1.23.1...v1.23.2) (2026-04-06)


### Bug Fixes

improve tool and parameter descriptions for Glama TDQS score([b3f477c](https://github.com/Wopee-io/wopee-mcp/commit/b3f477cda6a845c248eecd5a9447b3729678f14d))
Address all 6 TDQS dimensions across all 8 tools:
- Behavior: side effects, idempotency, destructive vs read-only
- Purpose: specific use cases, not generic CRUD
- Usage Guidelines: when to use, when NOT to use, prerequisites
- Completeness: error scenarios, edge cases, empty results
- Parameters: artifact types listed, cross-references to related tools
- Conciseness: structured as what → when → side effects → returns

## [1.23.1](https://github.com/Wopee-io/wopee-mcp/compare/v1.23.0...v1.23.1) (2026-04-04)


### Bug Fixes

improve tool descriptions for better Glama TDQS score([e9f7115](https://github.com/Wopee-io/wopee-mcp/commit/e9f71154e203a1f790c25e1cf0559460a73e7d1a))
Each tool now includes: purpose clarity, usage guidelines,
behavioral transparency, parameter semantics, and workflow context.
Fixes typo 'Woopee' in wopee_fetch_analysis_suites.

# [1.23.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.22.0...v1.23.0) (2026-04-03)


### Features

update README with test results fetching, examples([59b6ed0](https://github.com/Wopee-io/wopee-mcp/commit/59b6ed02580310b4f11719933f317e51e5625331))

# [1.22.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.21.0...v1.22.0) (2026-04-03)


### Features

implement tool to fetch executed test cases and integrate with prompts([e20a544](https://github.com/Wopee-io/wopee-mcp/commit/e20a544220417770f1e76f115c634ca72dc35aa8))

# [1.21.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.20.0...v1.21.0) (2026-04-03)


### Features

enhance error messages for better clarity and agent efficiency([e9827e0](https://github.com/Wopee-io/wopee-mcp/commit/e9827e0eb99cc3165e2c5ac722a1c2eab29b0f33))

# [1.20.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.19.0...v1.20.0) (2026-04-01)


### Features

enable re-triggering of existing analysis in dispatch analysis input([b276c89](https://github.com/Wopee-io/wopee-mcp/commit/b276c8993b4dc9609378882d5fc71e6ed86781aa))

# [1.19.0](https://github.com/Wopee-io/wopee-mcp/compare/v1.18.2...v1.19.0) (2026-03-30)


### Features

add Cursor Directory plugin config([532c168](https://github.com/Wopee-io/wopee-mcp/commit/532c168b1b6c4a2a59483d9020cbe6f9b06d3d52))
Adds mcp.json and .cursor-plugin/plugin.json for Open Plugins
compatibility, enabling submission to Cursor Directory marketplace.

## [1.18.2](https://github.com/Wopee-io/wopee-mcp/compare/v1.18.1...v1.18.2) (2026-03-30)


### Bug Fixes

use ubuntu-latest runner for npm publish workflow([f82218d](https://github.com/Wopee-io/wopee-mcp/commit/f82218dad97dfba20dec3b6b8bf279685aabda25))
The `builder` self-hosted runner is unavailable, causing the publish
workflow to hang indefinitely. Switch to `ubuntu-latest` to match
ci_cd.yml. Also bump Node from 20 to 22 for consistency.

## [1.18.1](https://github.com/Wopee-io/wopee-mcp/compare/v1.18.0...v1.18.1) (2026-03-30)


### Bug Fixes

update MCP registry namespace to match new GitHub org([e7d565a](https://github.com/Wopee-io/wopee-mcp/commit/e7d565a493878c3670e4a723603392888cb69572))
The repo moved from autonomous-testing/wopee-mcp to Wopee-io/wopee-mcp
but server.json and package.json still referenced the old org. This broke
the Official MCP Registry listing and blocks all downstream auto-sync
(PulseMCP, VS Code, Cursor, Claude.ai).

# [1.18.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.17.0...v1.18.0) (2026-03-27)


### Features

prepare for open source([18fba30](https://github.com/autonomous-testing/wopee-mcp/commit/18fba302da43a13fce63c78782a2daf42ad06c1a))

# [1.17.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.16.0...v1.17.0) (2026-03-19)


### Features

auto-publish to MCP Registry after NPM publish([616cb79](https://github.com/autonomous-testing/wopee-mcp/commit/616cb7934375a8ea767f94155a27cc2e05351af3))
Add workflow that automatically syncs server.json version from
package.json and publishes to MCP Registry via GitHub OIDC after
the Publish to NPM workflow completes successfully.

Also fix server.json: bump version 1.14.0 → 1.16.0, shorten
description to fit 100-char registry limit.

# [1.16.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.15.0...v1.16.0) (2026-03-18)


### Features

add mcpName and server.json for Official MCP Registry listing([57b6ec9](https://github.com/autonomous-testing/wopee-mcp/commit/57b6ec996717b76ba7c909a1b7839fde15ef202d))
Add mcpName field to package.json and corrected server.json metadata
to enable publishing to the Official MCP Registry.

# [1.15.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.14.0...v1.15.0) (2026-03-18)


### Features

enable additional variables in dispatch analysis([e9eed2f](https://github.com/autonomous-testing/wopee-mcp/commit/e9eed2ff4f44df21042463d82f51556c9d06829d))

# [1.14.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.13.0...v1.14.0) (2026-02-24)


### Features

update wopee_dispatch_analysis tool with additional instructions prop([c002f89](https://github.com/autonomous-testing/wopee-mcp/commit/c002f89baef55504f377925d95a02a868d11565c))

# [1.13.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.12.0...v1.13.0) (2026-02-09)


### Features

update README with TLS and certificate troubleshooting guidance([194d058](https://github.com/autonomous-testing/wopee-mcp/commit/194d0581a4c9db8aca5fe4cd2623e89587e777aa))

# [1.12.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.11.1...v1.12.0) (2026-02-03)


### Features

add a tool to create a blank analysis suite([9573c76](https://github.com/autonomous-testing/wopee-mcp/commit/9573c76adb54cac9366197c64c5e3c7fc1cd1bc8))
- Update README to include instructions for creating a blank analysis suite

## [1.11.1](https://github.com/autonomous-testing/wopee-mcp/compare/v1.11.0...v1.11.1) (2026-01-19)


### Bug Fixes

update tool name inside fetch_project_summary prompt([dccf769](https://github.com/autonomous-testing/wopee-mcp/commit/dccf7692ef876236849017a972ff26ec69730c44))
- wopee_fetch_file -> wopee_fetch_artifact

# [1.11.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.10.0...v1.11.0) (2026-01-08)


### Features

update DispatchAgent mutation response([2e1ce0a](https://github.com/autonomous-testing/wopee-mcp/commit/2e1ce0a0010eb0b612fbd16db671f22fe5d5d5a7))
- sync with changes on API:
  - return ExecutedTestCase array for DispatchAgent mutation

# [1.10.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.9.0...v1.10.0) (2026-01-07)


### Features

add corporate proxy support([277e1f5](https://github.com/autonomous-testing/wopee-mcp/commit/277e1f50deb5e08113975565683a0c8b57ee1709))
- Add `HTTPS_PROXY` environment variable to manage proxy settings
- Update README with proxy configuration instructions.

# [1.9.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.8.1...v1.9.0) (2025-12-26)


### Features

update tools with updated endpoint signature([3d5c3ab](https://github.com/autonomous-testing/wopee-mcp/commit/3d5c3ab7b1c61268bb596851d6a37de0fd66b0c8))
- fetch file -> fetch artifact
- update file -> update artifact
- endpoints using unified interface for S3/REPOSITORY storage types
- update schemas, handlers, factories
- update README

## [1.8.1](https://github.com/autonomous-testing/wopee-mcp/compare/v1.8.0...v1.8.1) (2025-12-19)


### Bug Fixes

remove leftover logs([e166353](https://github.com/autonomous-testing/wopee-mcp/commit/e1663537f6703e5125d40d7e85d2077c55098f8d))

# [1.8.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.7.1...v1.8.0) (2025-12-19)


### Features

enable fetch/update for playwright code([e059e06](https://github.com/autonomous-testing/wopee-mcp/commit/e059e06f464338b4662dc07a68a0322601029b44))
- temporary workaround inside 'fetch file' with identifier
- add optional params to update file endpoint to support pw code

## [1.7.1](https://github.com/autonomous-testing/wopee-mcp/compare/v1.7.0...v1.7.1) (2025-12-18)


### Bug Fixes

correct return value for 'testCaseSteps'([303c6b2](https://github.com/autonomous-testing/wopee-mcp/commit/303c6b2a7f426a9cb6333b7c1805573e18921aca))

# [1.7.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.6.1...v1.7.0) (2025-12-11)


### Features

sync with changes on API([6d2cfad](https://github.com/autonomous-testing/wopee-mcp/commit/6d2cfad53227781a655f0ae108895fed4b766a11))
- add new endpoints
- update existing endpoints

## [1.6.1](https://github.com/autonomous-testing/wopee-mcp/compare/v1.6.0...v1.6.1) (2025-11-20)


### Bug Fixes

add shebang to the entry file([f71780b](https://github.com/autonomous-testing/wopee-mcp/commit/f71780b689250c0615859559236d262b0c23bbe2))

# [1.6.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.5.1...v1.6.0) (2025-11-14)


### Features

implement 'fetch-project-summary' prompt([248e7cb](https://github.com/autonomous-testing/wopee-mcp/commit/248e7cb04f7f4d836dc4ec17b1ad27026a97048d))

## [1.5.1](https://github.com/autonomous-testing/wopee-mcp/compare/v1.5.0...v1.5.1) (2025-11-12)


### Bug Fixes

update README to sync with updated tools and usage([eb2729c](https://github.com/autonomous-testing/wopee-mcp/commit/eb2729c3b0073f0588585a59e3b60ddd7bdac536))

# [1.5.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.4.0...v1.5.0) (2025-11-12)


### Bug Fixes

add 'test-build' job to ci/cd to catch ts compilation errors([696a317](https://github.com/autonomous-testing/wopee-mcp/commit/696a317bbb9260cd1a32eb5b46dcd78bff557dbb))
run 'release' only on push to 'main'([f5641a9](https://github.com/autonomous-testing/wopee-mcp/commit/f5641a94530e5784860e085160f3f4ce7007938d))
- run 'test-build' on both pull and push
temporarily switch back to ubuntu-latest for ci/cd([925f3b6](https://github.com/autonomous-testing/wopee-mcp/commit/925f3b6adca478180223dc0dfad820e941c570be))


### Features

combine fetch and generate files tools into unified tools([3f587a6](https://github.com/autonomous-testing/wopee-mcp/commit/3f587a6fb8cd9ba999dee34a1dbfd457f019d88f))

# [1.4.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.3.0...v1.4.0) (2025-11-12)


### Features

implement wopee_update_file tool([7387d8e](https://github.com/autonomous-testing/wopee-mcp/commit/7387d8e2876978dbfe555dd3d8f1e1328a22351c))
- add descriptions for handler parameters
- update README to include usage of the 'wopee_update_file' tool

# [1.3.0](https://github.com/autonomous-testing/wopee-mcp/compare/v1.2.2...v1.3.0) (2025-11-11)


### Features

add an updated README file([2a9f0af](https://github.com/autonomous-testing/wopee-mcp/commit/2a9f0afc7e3c26417cce3ae107034a1320b0f388))

## [1.2.2](https://github.com/autonomous-testing/wopee-mcp/compare/v1.2.1...v1.2.2) (2025-11-11)


### Bug Fixes

mitigate typo in release config file name([8402b90](https://github.com/autonomous-testing/wopee-mcp/commit/8402b9043ec1cf51e8f36ac1eb13dc63198de635))
