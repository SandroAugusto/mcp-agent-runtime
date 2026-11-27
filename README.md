# mcp-agent-runtime

A personal agent runtime exposed over [MCP](https://modelcontextprotocol.io), running on Cloudflare Workers.

The MCP surface is deliberately tiny: two tools. `search` discovers capabilities in a catalog, and `execute` runs model-written code against them inside a sandbox. Capabilities never show up in the tool list, so the surface stays at two tools no matter how many capabilities exist.

This is a study project. The design follows the public architecture docs of [Kody](https://github.com/kentcdodds/kody) by Kent C. Dodds; the code here is an independent implementation.

## Status

| Step | Scope | Status |
| --- | --- | --- |
| 1 | MCP server with `search` and `execute` (echo), bearer token auth | Done |
| 2 | Code Mode: `execute` runs code in an isolate with no access to `env` | Planned |
| 3 | Per-user memory with tested isolation | Planned |
| 4 | Secrets via `{{secret:name}}` placeholders and a deny-by-default egress gateway | Planned |
| 5 | Saved packages running on a schedule, with no LLM in the loop | Planned |
| 6 | OAuth for remote hosts (optional) | Planned |

## Running locally

```sh
npm install
cp .dev.vars.example .dev.vars   # then set AUTH_TOKEN to a long random string
npm run dev                      # http://localhost:8787/mcp
```

### Connecting a client

MCP Inspector:

```sh
npx @modelcontextprotocol/inspector
```

Choose the Streamable HTTP transport, use `http://localhost:8787/mcp` as the URL, and add an `Authorization: Bearer <AUTH_TOKEN>` header.

Claude Code:

```sh
claude mcp add --transport http agent-runtime http://localhost:8787/mcp \
  --header "Authorization: Bearer <AUTH_TOKEN>"
```

## Testing

```sh
npm run check   # type check + tests
```

The tests drive the Worker's `fetch` handler with the official MCP SDK client, so they exercise the real protocol handshake without a network. They run on Node, not on `workerd`; step 2 will need the Workers runtime in tests, since sandbox behavior differs between the two.

## Design notes

- **Stateless Worker.** Each request builds a fresh MCP server and transport (no session id, JSON responses instead of SSE). State will live in storage keyed by user, never in memory.
- **Fail closed.** A missing `AUTH_TOKEN` on the server rejects every request instead of allowing all of them.
- **Constant-time token check.** Both tokens are hashed before comparing, so timing reveals neither the token length nor a matching prefix.
- **No Node compatibility flag.** The Worker only uses Web Standard APIs (`Request`, `Response`, `crypto.subtle`).

## Deploying

```sh
npx wrangler secret put AUTH_TOKEN
npm run deploy
```
