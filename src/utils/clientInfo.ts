// The MCP client that connected, from the `initialize` handshake. No runtime imports, so it loads
// under `node --test` in strip-only mode.

let client: { name?: string; version?: string } | undefined;

export function setClientInfo(info: { name?: string; version?: string } | undefined) {
  client = info;
}

/** `<name>/<version>` (e.g. `claude-code/2.1.3`), `<name>` without a version, or `unknown`. */
export function clientLabel(): string {
  const name = client?.name?.trim();
  if (!name) return "unknown";
  const version = client?.version?.trim();
  return version ? `${name}/${version}` : name;
}
