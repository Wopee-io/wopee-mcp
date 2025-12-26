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
