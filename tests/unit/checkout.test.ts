import { ShippingMethod } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { calculateOrderTotal, getShippingAmount } from "../../src/lib/checkout";
import { isGoogleAuthConfigured, isStripeConfigured } from "../../src/lib/env";
import { checkoutSchema } from "../../src/lib/validations";

describe("checkout and environment helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("return the configured shipping amount", () => {
    expect(getShippingAmount(ShippingMethod.EXPRESS)).toBe(2400);
    expect(getShippingAmount(ShippingMethod.WHITE_GLOVE)).toBe(4500);
  });

  it("calculate an order total", () => {
    expect(calculateOrderTotal(10000, 1200)).toBe(11200);
  });

  it("validate checkout payloads", () => {
    expect(
      checkoutSchema.safeParse({
        name: "A Buyer",
        line1: "18 Mercer Street",
        city: "New York",
        state: "NY",
        postalCode: "10013",
        country: "US",
        phone: "+12125550183",
        shippingMethod: ShippingMethod.STANDARD
      }).success
    ).toBe(true);
  });

  it("reject invalid checkout payloads", () => {
    expect(
      checkoutSchema.safeParse({
        name: "A Buyer",
        line1: "18 Mercer Street",
        city: "New York",
        state: "NY",
        postalCode: "10013",
        country: "USA",
        phone: "+12125550183",
        shippingMethod: ShippingMethod.STANDARD
      }).success
    ).toBe(false);
  });

  it("detect when Google auth placeholders are still configured", () => {
    vi.stubEnv("AUTH_GOOGLE_ID", "replace-me");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "replace-me");

    expect(isGoogleAuthConfigured()).toBe(false);
  });

  it("detect when Google auth is fully configured", () => {
    vi.stubEnv("AUTH_GOOGLE_ID", "google-client-id");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "google-client-secret");

    expect(isGoogleAuthConfigured()).toBe(true);
  });

  it("detect when Stripe is fully configured", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_liveish");
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_liveish");

    expect(isStripeConfigured()).toBe(true);
  });

  it("reject placeholder Stripe credentials", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_replace_me");
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_replace_me");

    expect(isStripeConfigured()).toBe(false);
  });
});
