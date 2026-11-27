import { describe, expect, it } from "vitest";
import { BASE_URL, TEST_TOKEN, callWorker, connectClient } from "./helpers";

const listToolsBody = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} });
const mcpHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json, text/event-stream",
};

describe("HTTP layer", () => {
  it("rejects requests without a token", async () => {
    const response = await callWorker(`${BASE_URL}/mcp`, {
      method: "POST",
      headers: mcpHeaders,
      body: listToolsBody,
    });
    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toMatch(/^Bearer/);
  });

  it("rejects a wrong token", async () => {
    const response = await callWorker(`${BASE_URL}/mcp`, {
      method: "POST",
      headers: { ...mcpHeaders, Authorization: "Bearer wrong-token" },
      body: listToolsBody,
    });
    expect(response.status).toBe(401);
  });

  it("fails closed when the server has no token configured", async () => {
    const response = await callWorker(
      `${BASE_URL}/mcp`,
      { method: "POST", headers: { ...mcpHeaders, Authorization: `Bearer ${TEST_TOKEN}` }, body: listToolsBody },
      {},
    );
    expect(response.status).toBe(401);
  });

  it("the SDK client cannot connect with a wrong token", async () => {
    await expect(connectClient("wrong-token")).rejects.toThrow();
  });

  it("returns 404 outside /mcp and 200 on /health", async () => {
    expect((await callWorker(`${BASE_URL}/other`)).status).toBe(404);
    expect((await callWorker(`${BASE_URL}/health`)).status).toBe(200);
  });
});
