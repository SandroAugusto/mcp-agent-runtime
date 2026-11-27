import type { Capability } from "./catalog";

export interface SearchResult {
  name: string;
  description: string;
  signature: string;
  status: Capability["status"];
  step: number;
  score: number;
}

const WEIGHTS = { name: 3, tag: 2, description: 1 } as const;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

/**
 * Plain keyword scoring: a query token found in the capability name counts
 * most, then tags, then description. Good enough until the catalog grows past
 * a few dozen entries; embeddings can replace it later without changing the
 * tool contract.
 */
export function searchCatalog(
  catalog: readonly Capability[],
  query: string,
  limit = 5,
): SearchResult[] {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return [];

  const results: SearchResult[] = [];
  for (const capability of catalog) {
    const nameTokens = new Set(tokenize(capability.name));
    const tagTokens = new Set(capability.tags.flatMap(tokenize));
    const descriptionTokens = new Set(tokenize(capability.description));

    let score = 0;
    for (const token of queryTokens) {
      if (nameTokens.has(token)) score += WEIGHTS.name;
      if (tagTokens.has(token)) score += WEIGHTS.tag;
      if (descriptionTokens.has(token)) score += WEIGHTS.description;
    }

    if (score > 0) {
      results.push({
        name: capability.name,
        description: capability.description,
        signature: capability.signature,
        status: capability.status,
        step: capability.step,
        score,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}
