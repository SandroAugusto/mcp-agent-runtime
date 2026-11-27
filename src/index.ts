import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { isAuthorized, unauthorized } from "./auth";
import { createServer } from "./server";

export interface Env {
  /** Shared bearer token. Set with `wrangler secret put AUTH_TOKEN`, or in `.dev.vars` locally. */
  AUTH_TOKEN?: string;
}

const MCP_PATH = "/mcp";

async function handleMcp(request: Request): Promise<Response> {
  // Stateless mode: no session id, JSON responses instead of SSE streams.
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = createServer();
  await server.connect(transport);

  try {
    return await transport.handleRequest(request);
  } finally {
    await server.close();
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("ok");
    }

    if (url.pathname !== MCP_PATH) {
      return new Response("not found", { status: 404 });
    }

    if (!(await isAuthorized(request, env.AUTH_TOKEN))) {
      return unauthorized();
    }

    return handleMcp(request);
  },
} satisfies ExportedHandler<Env>;
