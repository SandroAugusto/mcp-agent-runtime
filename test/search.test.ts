import { describe, expect, it } from "vitest";
import type { Capability } from "../src/catalog";
import { searchCatalog } from "../src/search";

const fixture: Capability[] = [
  {
    name: "alpha.run",
    description: "Does something with widgets.",
    signature: "alpha.run(): Promise<void>",
    tags: ["widget"],
    step: 1,
    status: "planned",
  },
  {
    name: "beta.widget",
    description: "Unrelated.",
    signature: "beta.widget(): Promise<void>",
    tags: [],
    step: 1,
    status: "planned",
  },
];

describe("searchCatalog", () => {
  it("ranks a name match above a tag match", () => {
    const results = searchCatalog(fixture, "widget");
    expect(results.map((r) => r.name)).toEqual(["beta.widget", "alpha.run"]);
  });

  it("is case-insensitive and ignores punctuation", () => {
    expect(searchCatalog(fixture, "  ALPHA!! ").map((r) => r.name)).toEqual(["alpha.run"]);
  });

  it("respects the limit", () => {
    expect(searchCatalog(fixture, "widget", 1)).toHaveLength(1);
  });

  it("returns nothing for a blank query", () => {
    expect(searchCatalog(fixture, "   ")).toEqual([]);
  });
});
