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
