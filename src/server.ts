import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { catalog } from "./catalog";
import { searchCatalog } from "./search";

export const SERVER_INFO = { name: "mcp-agent-runtime", version: "0.1.0" } as const;

/**
 * Builds the MCP server. The public surface is exactly two tools:
 *
 * - `search` discovers capabilities in the catalog.
 * - `execute` will run model-written code against those capabilities (step 2).
 *
 * A new server is built per request: the Worker is stateless, and every piece
 * of state will live in storage keyed by user, never in this object.
 */
export function createServer(): McpServer {
  const server = new McpServer(SERVER_INFO);

  server.registerTool(
    "search",
    {
      title: "Search capabilities",
      description:
        "Search the capability catalog by keyword. Returns each match with its TypeScript signature, which is what code passed to `execute` will call as `host.<name>(...)`.",
      inputSchema: {
        query: z.string().min(1).describe("Keywords, e.g. 'memory' or 'schedule a job'"),
        limit: z.number().int().min(1).max(20).optional().describe("Maximum results (default 5)"),
      },
    },
    async ({ query, limit }) => {
      const results = searchCatalog(catalog, query, limit ?? 5);
      return {
        content: [{ type: "text", text: JSON.stringify({ query, results }, null, 2) }],
      };
    },
  );

  server.registerTool(
    "execute",
    {
      title: "Execute code",
      description:
        "Run JavaScript against the capabilities found with `search`. Not implemented yet: for now it echoes the code back.",
      inputSchema: {
        code: z.string().min(1).describe("JavaScript source to run"),
      },
    },
    async ({ code }) => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "not_implemented",
                note: "Sandboxed execution lands in step 2. Echoing the code back.",
                code,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  return server;
}
