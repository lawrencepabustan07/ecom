import assert from "node:assert/strict";
import test from "node:test";

import { assertInventory, calculateCartTotals } from "@/lib/cart";

test("cart helpers calculate subtotal and item count", () => {
  assert.deepEqual(
    calculateCartTotals([
      { quantity: 2, variant: { price: 1500 } },
      { quantity: 1, variant: { price: 4000 } }
    ]),
    {
      subtotal: 7000,
      itemCount: 3
    }
  );
});

test("cart helpers throw when quantity exceeds stock", () => {
  assert.throws(() => assertInventory(5, 4), /Requested quantity exceeds available inventory/);
});
