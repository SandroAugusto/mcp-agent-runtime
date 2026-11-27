/**
 * Bearer token check for step 1. OAuth replaces this in step 6.
 *
 * Both values are hashed before comparing so the comparison always runs over
 * 32 bytes: its timing reveals neither the token's length nor how many leading
 * characters matched.
 */

async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return new Uint8Array(digest);
}

async function constantTimeEqual(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < hashA.length; i++) diff |= hashA[i]! ^ hashB[i]!;
  return diff === 0;
}

export async function isAuthorized(request: Request, expectedToken: string | undefined): Promise<boolean> {
  // A missing server-side token must fail closed, never open.
  if (!expectedToken) return false;

  const header = request.headers.get("Authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return false;

  return constantTimeEqual(match[1]!.trim(), expectedToken);
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate": 'Bearer realm="mcp-agent-runtime"',
    },
  });
}
