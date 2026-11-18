#!/usr/bin/env node
// The remote Wopee.io MCP server: Streamable HTTP at MCP_RESOURCE_URL, one stateless MCP server per
// request, authenticated by the caller's bearer token (an OAuth access token from the api, or a
// project API key for headless clients). The token is checked with the api, which also names its
// project; every api request the tools make carries that same token, and nothing from this
// process's environment or files.
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { createServer } from "./server.js";
import { callsWriteTool } from "./tools/shared/toolSafety.js";
import { runWithRemoteContext, setRemoteOnly } from "./utils/getConfig.js";
import {
  TokenCache,
  TokenChecker,
  bearerToken,
  checkTokenWithApi,
  isAllowedOrigin,
  isReadOnlyToken,
  metadataPath,
  protectedResourceMetadata,
  readHttpConfig,
  wwwAuthenticate,
  type HttpConfig,
} from "./utils/httpAuth.js";
import { useProxyFromEnv } from "./utils/proxy.js";

const MAX_BODY_BYTES = 1024 * 1024;
const ALL_SCOPES = "read write";

function sendJson(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("request body too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(Object.assign(new Error("request body is not JSON"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

export function createRequestHandler(config: HttpConfig, tokens = new TokenCache()) {
  const metadata = protectedResourceMetadata(config);
  const mcpPath = new URL(config.resourceUrl).pathname.replace(/\/+$/, "") || "/";
  const wellKnown = new Set([metadataPath(config.resourceUrl), "/.well-known/oauth-protected-resource"]);

  const unauthorized = (res: ServerResponse, error?: "invalid_token") =>
    sendJson(
      res,
      401,
      { error: error ?? "unauthorized", error_description: "Connect through OAuth, or send a project API key as a Bearer token." },
      { "WWW-Authenticate": wwwAuthenticate(config, error, ALL_SCOPES) },
    );
  const checker = new TokenChecker((token) => checkTokenWithApi(config.apiUrl, token), tokens);

  return async function handle(req: IncomingMessage, res: ServerResponse) {
    const path = new URL(req.url ?? "/", "http://localhost").pathname;

    if (req.method === "GET" && path === "/healthz") return sendJson(res, 200, { status: "ok" });
    if (req.method === "GET" && wellKnown.has(path)) return sendJson(res, 200, metadata);
    if (path !== mcpPath) return sendJson(res, 404, { error: "not_found" });
    // Stateless: no server-to-client stream to open (GET) and no session to end (DELETE).
    if (req.method !== "POST") {
      return sendJson(res, 405, { error: "method_not_allowed" }, { Allow: "POST" });
    }

    // Browsers send this; no other site's page may talk to the server.
    if (!isAllowedOrigin(req.headers.origin, config.resourceUrl)) {
      return sendJson(res, 403, { error: "forbidden", error_description: "This origin is not allowed." });
    }

    const token = bearerToken(req.headers.authorization);
    if (!token) return unauthorized(res);
    const caller = await checker.callerOf(token);
    if ("status" in caller) {
      return caller.status === 401
        ? unauthorized(res, "invalid_token")
        : sendJson(res, 503, { error: "temporarily_unavailable" }, { "Retry-After": "5" });
    }

    let body: unknown;
    try {
      body = await readBody(req);
    } catch (error) {
      const status = (error as { status?: number }).status ?? 400;
      return sendJson(res, status, { error: "invalid_request", error_description: (error as Error).message });
    }
    // One message per request keeps each tool call under the checks below.
    if (Array.isArray(body)) {
      return sendJson(res, 400, { error: "invalid_request", error_description: "Send one JSON-RPC message per request." });
    }

    const readOnly = isReadOnlyToken(token);
    if (readOnly && callsWriteTool(body)) {
      return sendJson(
        res,
        403,
        { error: "insufficient_scope", error_description: "This connection is read-only." },
        { "WWW-Authenticate": wwwAuthenticate(config, "insufficient_scope", ALL_SCOPES) },
      );
    }

    await runWithRemoteContext({ authToken: token, apiUrl: config.apiUrl, projectUuid: caller.projectUuid }, async () => {
      const server = createServer({ remote: true, readOnly });
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    });
  };
}

async function main() {
  useProxyFromEnv();
  setRemoteOnly(true);
  const config = readHttpConfig(process.env);
  const handle = createRequestHandler(config);
  const httpServer = createHttpServer((req, res) => {
    handle(req, res).catch((error) => {
      console.error("[WOPEE]: request failed", error);
      if (!res.headersSent) sendJson(res, 500, { error: "server_error" });
      else res.end();
    });
  });
  // Time to send the request. Answers can take minutes, and this does not limit them.
  httpServer.headersTimeout = 15_000;
  httpServer.requestTimeout = 30_000;
  httpServer.listen(config.port, () => {
    console.error(`Wopee MCP server on http://0.0.0.0:${config.port}${new URL(config.resourceUrl).pathname} (resource ${config.resourceUrl})`);
  });
  const stop = () => httpServer.close(() => process.exit(0));
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}

main().catch((error) => {
  console.error("Error starting the Wopee MCP HTTP server:", error);
  process.exit(1);
});
