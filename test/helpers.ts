import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import worker, { type Env } from "../src/index";

export const TEST_TOKEN = "test-token-not-a-real-secret";
export const BASE_URL = "https://mcp.test";
export const env: Env = { AUTH_TOKEN: TEST_TOKEN };

/** Calls the Worker's fetch handler directly, no network involved. */
export function callWorker(input: RequestInfo | URL, init?: RequestInit, workerEnv: Env = env) {
  const request = input instanceof Request ? input : new Request(input, init);
  return worker.fetch(request, workerEnv);
}

/**
 * An official SDK client wired to the Worker through a custom fetch. If this
 * client can initialize, list tools and call them, any spec-compliant host can.
 */
export async function connectClient(token = TEST_TOKEN): Promise<Client> {
  const transport = new StreamableHTTPClientTransport(new URL("/mcp", BASE_URL), {
    fetch: (input, init) => callWorker(input, init),
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  const client = new Client({ name: "test-client", version: "0.0.0" });
  await client.connect(transport);
  return client;
}

export function textOf(result: unknown): string {
  const content = (result as { content: Array<{ type: string; text?: string }> }).content;
  const first = content[0];
  if (!first || first.type !== "text" || first.text === undefined) {
    throw new Error("Expected a text content block");
  }
  return first.text;
}
