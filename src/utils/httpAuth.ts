// The remote (HTTP) server's side of OAuth: it is a resource server. It tells clients where to
// authorize (RFC 9728 metadata, the WWW-Authenticate challenge) and checks each bearer token with
// the api, which also says which project the token is for. Only node: imports, so it loads under
// `node --test` in strip-only mode.
import { createHash } from "node:crypto";

export interface HttpConfig {
  /** The public URL of the MCP endpoint, e.g. https://mcp.wopee.io/mcp: the token audience. */
  resourceUrl: string;
  /** The api's public URL, the OAuth issuer, e.g. https://api.wopee.io. */
  issuer: string;
  /** Where this server sends its api requests (inside the platform network when there is one). */
  apiUrl: string;
  port: number;
}

const trimSlash = (url: string) => url.replace(/\/+$/, "");

export function readHttpConfig(env: NodeJS.ProcessEnv): HttpConfig {
  const resourceUrl = env.MCP_RESOURCE_URL?.trim();
  const issuer = env.WOPEE_AUTHORIZATION_SERVER?.trim();
  if (!resourceUrl || !issuer) {
    throw new Error(
      "MCP_RESOURCE_URL (this server's public /mcp URL) and WOPEE_AUTHORIZATION_SERVER (the api's public URL) are required",
    );
  }
  const port = Number(env.PORT);
  return {
    resourceUrl: trimSlash(new URL(resourceUrl).href),
    issuer: trimSlash(new URL(issuer).href),
    apiUrl: trimSlash(env.WOPEE_API_URL?.trim() || issuer),
    port: Number.isInteger(port) && port > 0 ? port : 8080,
  };
}

/** RFC 9728: the metadata lives under /.well-known/oauth-protected-resource + the resource path. */
export function metadataPath(resourceUrl: string): string {
  const path = new URL(resourceUrl).pathname.replace(/\/+$/, "");
  return `/.well-known/oauth-protected-resource${path}`;
}

export function metadataUrl(resourceUrl: string): string {
  return new URL(metadataPath(resourceUrl), resourceUrl).href;
}

export function protectedResourceMetadata(config: HttpConfig) {
  return {
    resource: config.resourceUrl,
    authorization_servers: [config.issuer],
    scopes_supported: ["read", "write"],
    bearer_methods_supported: ["header"],
    resource_name: "Wopee.io",
    resource_documentation: "https://docs.wopee.io/",
  };
}

/** The `WWW-Authenticate` of a 401: where the client finds how to get a token (MCP spec). */
export function wwwAuthenticate(config: HttpConfig, error?: "invalid_token"): string {
  const parts = [`resource_metadata="${metadataUrl(config.resourceUrl)}"`];
  if (error) parts.push(`error="${error}"`);
  return `Bearer ${parts.join(", ")}`;
}

/** The token of an `Authorization: Bearer <token>` header, else null. */
export function bearerToken(authorization: string | string[] | undefined): string | null {
  const header = Array.isArray(authorization) ? authorization[0] : authorization;
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header ?? "");
  return match ? match[1] : null;
}

export type TokenCheck =
  | { status: "ok"; projectUuid: string }
  | { status: "invalid" }
  | { status: "unavailable"; reason: string };

const SETUP_CHECK = "query SetupCheck { setupCheck { projectUuid } }";

/**
 * Asks the api who a token is: an MCP access token or a project API key. The api answers
 * `setupCheck` with the token's project, and refuses a token it does not accept (401 for an MCP
 * token that does not verify or whose connection is gone, "Not Authorised!" for an unknown key).
 */
export async function checkTokenWithApi(
  apiUrl: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TokenCheck> {
  let response: Response;
  try {
    response = await fetchImpl(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ query: SETUP_CHECK }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    return { status: "unavailable", reason: error instanceof Error ? error.message : String(error) };
  }
  if (response.status === 401 || response.status === 403) return { status: "invalid" };
  if (!response.ok) return { status: "unavailable", reason: `api answered ${response.status}` };

  const body = (await response.json().catch(() => null)) as {
    data?: { setupCheck?: { projectUuid?: string } | null };
    errors?: { message?: string; extensions?: { code?: string } }[];
  } | null;
  const projectUuid = body?.data?.setupCheck?.projectUuid;
  if (projectUuid) return { status: "ok", projectUuid };
  const error = body?.errors?.[0];
  const refused =
    error?.extensions?.code === "UNAUTHENTICATED" ||
    error?.extensions?.code === "FORBIDDEN" ||
    /not authori[sz]ed/i.test(error?.message ?? "");
  return refused
    ? { status: "invalid" }
    : { status: "unavailable", reason: error?.message ?? "no project in the api's answer" };
}

/**
 * Good answers, kept a short while so a client's burst of messages (initialize, tools/list, the
 * call) costs one check. Keyed by the token's SHA-256, never the token. A refusal is never kept:
 * the next request asks again. The api still checks the connection on every tool call, so a
 * revoked token loses its tools at once; it only stops getting 401 here up to `ttlMs` later.
 */
export class TokenCache {
  private readonly entries = new Map<string, { projectUuid: string; until: number }>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  // No parameter properties: `node --test` strips types and cannot run them.
  constructor(ttlMs = 30_000, maxEntries = 1000) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  private key(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  get(token: string, now = Date.now()): string | null {
    const key = this.key(token);
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.until <= now) {
      this.entries.delete(key);
      return null;
    }
    return entry.projectUuid;
  }

  set(token: string, projectUuid: string, now = Date.now()): void {
    if (this.entries.size >= this.maxEntries) {
      // The oldest entry goes first (a Map keeps insertion order).
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(this.key(token), { projectUuid, until: now + this.ttlMs });
  }

  get size() {
    return this.entries.size;
  }
}
