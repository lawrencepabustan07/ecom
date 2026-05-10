import assert from "node:assert/strict";
import test from "node:test";

import { ShippingMethod } from "@prisma/client";

import { calculateOrderTotal, getShippingAmount } from "@/lib/checkout";
import { checkoutSchema } from "@/lib/validations";

test("checkout helpers return the configured shipping amount", () => {
  assert.equal(getShippingAmount(ShippingMethod.EXPRESS), 2400);
});

test("checkout helpers calculate an order total", () => {
  assert.equal(calculateOrderTotal(10000, 1200), 11200);
});

test("checkout helpers validate checkout payloads", () => {
  assert.equal(
    checkoutSchema.safeParse({
      name: "A Buyer",
      line1: "18 Mercer Street",
      city: "New York",
      state: "NY",
      postalCode: "10013",
      country: "US",
      phone: "+12125550183",
      shippingMethod: ShippingMethod.STANDARD
    }).success,
    true
  );
});
