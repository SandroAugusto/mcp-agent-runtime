import { afterEach, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { connectClient, textOf } from "./helpers";

describe("MCP surface", () => {
  let client: Client | undefined;

  afterEach(async () => {
    await client?.close();
    client = undefined;
  });

  it("exposes exactly two tools: search and execute", async () => {
    client = await connectClient();
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual(["execute", "search"]);
  });

  it("search for 'memory' returns the memory capabilities with signatures", async () => {
    client = await connectClient();
    const result = await client.callTool({ name: "search", arguments: { query: "memory" } });
    const { results } = JSON.parse(textOf(result)) as {
      results: Array<{ name: string; signature: string }>;
    };

    const names = results.map((r) => r.name);
    expect(names.slice(0, 2).sort()).toEqual(["memory.save", "memory.search"]);
    for (const r of results.filter((r) => r.name.startsWith("memory."))) {
      expect(r.signature).toMatch(/^memory\.\w+\(input: \{.*\}\): Promise<.+>$/);
    }
  });

  it("search with no matching keyword returns an empty list", async () => {
    client = await connectClient();
    const result = await client.callTool({ name: "search", arguments: { query: "zzzz" } });
    expect(JSON.parse(textOf(result)).results).toEqual([]);
  });

  it("search rejects an empty query", async () => {
    client = await connectClient();
    const result = await client.callTool({ name: "search", arguments: { query: "" } });
    expect(result.isError).toBe(true);
  });

  it("execute echoes the code back until step 2", async () => {
    client = await connectClient();
    const code = "return 1 + 1";
    const result = await client.callTool({ name: "execute", arguments: { code } });
    expect(JSON.parse(textOf(result))).toMatchObject({ status: "not_implemented", code });
  });
});
