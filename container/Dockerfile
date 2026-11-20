# The remote Wopee.io MCP server (wopee-mcp-http): Streamable HTTP, an OAuth resource
# server whose tokens the Wopee.io api issues. Published as
# ghcr.io/autonomous-testing/wopee-mcp:X.Y.Z by .github/workflows/publish.yml, once,
# right after wopee-mcp@X.Y.Z is on npm.
#
# MCP_PACKAGE is what `npm install -g` gets:
#   - release:      wopee-mcp@X.Y.Z, the exact package npm users get. Never a range.
#   - pull request: /ctx/wopee-mcp-X.Y.Z.tgz, the `npm pack` of the branch, so a PR
#                   tests its own code. The build context is bind-mounted at /ctx.
# Both carry npm-shrinkwrap.json (scripts/shrinkwrap.mjs), so the dependency tree is
# the one the release was tested with. --ignore-scripts: nothing needs a postinstall.
#
# Node comes from Docker Hub through DOCKERHUB_PREFIX, so a tenant pulling through its
# own proxy builds the same image. The base is an exact release tag; to update it, pick
# the newest node:22.<minor>.<patch>-alpine3.<n> on Docker Hub. Add a digest only if
# that tag is seen re-pushed.
ARG DOCKERHUB_PREFIX=docker.io
FROM ${DOCKERHUB_PREFIX}/library/node:22.23.5-alpine3.24

ARG MCP_PACKAGE
RUN --mount=type=bind,source=.,target=/ctx \
    test -n "${MCP_PACKAGE}" \
 && npm install -g --ignore-scripts "${MCP_PACKAGE}" \
 && npm cache clean --force

USER node
ENV NODE_ENV=production \
    PORT=8080
EXPOSE 8080
CMD ["wopee-mcp-http"]
