#!/usr/bin/env node
// The remote Wopee.io MCP server: Streamable HTTP at MCP_RESOURCE_URL, one stateless MCP server per
// request, authenticated by the caller's bearer token (an OAuth access token from the api, or a
// project API key for headless clients). The token is checked with the api, which also names its
// project; every api request the tools make carries that same token, and nothing from this
// process's environment or files.
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { createServer } from "./server.js";
import { runWithRemoteContext } from "./utils/getConfig.js";
import {
  TokenCache,
  bearerToken,
  checkTokenWithApi,
  metadataPath,
  protectedResourceMetadata,
  readHttpConfig,
  wwwAuthenticate,
  type HttpConfig,
} from "./utils/httpAuth.js";
import { useProxyFromEnv } from "./utils/proxy.js";

const MAX_BODY_BYTES = 1024 * 1024;

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
      { "WWW-Authenticate": wwwAuthenticate(config, error) },
    );

  async function projectOf(token: string): Promise<{ projectUuid: string } | { status: number }> {
    const cached = tokens.get(token);
    if (cached) return { projectUuid: cached };
    const check = await checkTokenWithApi(config.apiUrl, token);
    if (check.status === "ok") {
      tokens.set(token, check.projectUuid);
      return { projectUuid: check.projectUuid };
    }
    if (check.status === "unavailable") console.error(`[WOPEE]: token check failed: ${check.reason}`);
    return { status: check.status === "invalid" ? 401 : 503 };
  }

  return async function handle(req: IncomingMessage, res: ServerResponse) {
    const path = new URL(req.url ?? "/", "http://localhost").pathname;

    if (req.method === "GET" && path === "/healthz") return sendJson(res, 200, { status: "ok" });
    if (req.method === "GET" && wellKnown.has(path)) return sendJson(res, 200, metadata);
    if (path !== mcpPath) return sendJson(res, 404, { error: "not_found" });
    // Stateless: no server-to-client stream to open (GET) and no session to end (DELETE).
    if (req.method !== "POST") {
      return sendJson(res, 405, { error: "method_not_allowed" }, { Allow: "POST" });
    }

    const token = bearerToken(req.headers.authorization);
    if (!token) return unauthorized(res);
    const caller = await projectOf(token);
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

    await runWithRemoteContext({ authToken: token, apiUrl: config.apiUrl, projectUuid: caller.projectUuid }, async () => {
      const server = createServer({ remote: true });
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
  const config = readHttpConfig(process.env);
  const handle = createRequestHandler(config);
  const httpServer = createHttpServer((req, res) => {
    handle(req, res).catch((error) => {
      console.error("[WOPEE]: request failed", error);
      if (!res.headersSent) sendJson(res, 500, { error: "server_error" });
      else res.end();
    });
  });
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
