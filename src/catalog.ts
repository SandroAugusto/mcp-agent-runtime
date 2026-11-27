/**
 * Capability catalog.
 *
 * The model never sees this list up front. It discovers capabilities through
 * the `search` tool and, from step 2 on, calls them from code run by `execute`.
 * Keeping the catalog out of the tool list is what lets the MCP surface stay at
 * two tools no matter how many capabilities exist.
 */

export type CapabilityStatus = "planned" | "available";

export interface Capability {
  /** Dotted name, as it will be called from sandbox code: `host.memory.save(...)`. */
  name: string;
  description: string;
  /** TypeScript signature the model can code against. */
  signature: string;
  tags: string[];
  /** Implementation step in the project plan where the capability lands. */
  step: number;
  status: CapabilityStatus;
}

export const catalog: readonly Capability[] = [
  {
    name: "memory.save",
    description: "Store a piece of text in the caller's long-term memory.",
    signature:
      "memory.save(input: { text: string; tags?: string[] }): Promise<{ id: string }>",
    tags: ["memory", "remember", "store", "note"],
    step: 3,
    status: "planned",
  },
  {
    name: "memory.search",
    description: "Find entries in the caller's memory that match a query.",
    signature:
      "memory.search(input: { query: string; limit?: number }): Promise<Array<{ id: string; text: string; tags: string[] }>>",
    tags: ["memory", "recall", "find", "lookup"],
    step: 3,
    status: "planned",
  },
  {
    name: "http.fetch",
    description:
      "Make an outbound HTTP request. Secrets are referenced as {{secret:name}} placeholders and filled in by the gateway only for approved hosts.",
    signature:
      "http.fetch(input: { url: string; method?: string; headers?: Record<string, string>; body?: string }): Promise<{ status: number; headers: Record<string, string>; body: string }>",
    tags: ["http", "fetch", "request", "api", "network", "secret"],
    step: 4,
    status: "planned",
  },
  {
    name: "package.save",
    description: "Save a script that worked so it can run later without a model in the loop.",
    signature: "package.save(input: { name: string; code: string }): Promise<{ name: string }>",
    tags: ["package", "save", "script", "automation"],
    step: 5,
    status: "planned",
  },
  {
    name: "job.schedule",
    description: "Run a saved package on a cron schedule.",
    signature:
      "job.schedule(input: { packageName: string; cron: string }): Promise<{ jobId: string }>",
    tags: ["job", "schedule", "cron", "automation", "recurring"],
    step: 5,
    status: "planned",
  },
];
