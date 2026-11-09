// Copies the package.json version into server.json (MCP Registry) and the Cursor plugin.
// Runs as the npm `version` script, so semantic-release's `npm version` keeps them in sync.
import { readFileSync, writeFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf-8"));
const writeJson = (path, data) =>
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");

const { version } = readJson("package.json");

const server = readJson("server.json");
server.version = version;
for (const pkg of server.packages) pkg.version = version;
writeJson("server.json", server);

const plugin = readJson(".cursor-plugin/plugin.json");
plugin.version = version;
writeJson(".cursor-plugin/plugin.json", plugin);

console.log(`server.json and .cursor-plugin/plugin.json at ${version}`);
