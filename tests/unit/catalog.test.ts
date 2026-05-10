import assert from "node:assert/strict";
import test from "node:test";

import { buildCatalogOrder, buildCatalogWhere } from "@/lib/catalog";

test("catalog helpers build a case-insensitive search where clause", () => {
  assert.deepEqual(buildCatalogWhere({ search: "coat" }), {
    OR: [
      { name: { contains: "coat", mode: "insensitive" } },
      { brand: { contains: "coat", mode: "insensitive" } },
      { description: { contains: "coat", mode: "insensitive" } }
    ]
  });
});

test("catalog helpers return descending price order", () => {
  assert.deepEqual(buildCatalogOrder("price-desc"), { price: "desc" });
});
