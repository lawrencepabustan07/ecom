import { afterEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    cart: {
      upsert: vi.fn(),
      findUnique: vi.fn()
    }
  }
}));

vi.mock("../../src/lib/prisma", () => ({
  prisma: prismaMock
}));

import { assertInventory, calculateCartTotals, getCart, getOrCreateCart } from "../../src/lib/cart";

describe("cart helpers", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calculate subtotal and item count", () => {
    expect(
      calculateCartTotals([
        { quantity: 2, variant: { price: 1500 } },
        { quantity: 1, variant: { price: 4000 } }
      ])
    ).toEqual({
      subtotal: 7000,
      itemCount: 3
    });
  });

  it("return zero totals for an empty cart", () => {
    expect(calculateCartTotals([])).toEqual({
      subtotal: 0,
      itemCount: 0
    });
  });

  it("throw when quantity exceeds stock", () => {
    expect(() => assertInventory(5, 4)).toThrow(/Requested quantity exceeds available inventory/);
  });

  it("allow quantities that match available stock", () => {
    expect(() => assertInventory(4, 4)).not.toThrow();
  });

  it("upsert a cart with nested variant, inventory, and image data", async () => {
    prismaMock.cart.upsert.mockResolvedValue({ id: "cart_1" });

    await expect(getOrCreateCart("user_123")).resolves.toEqual({ id: "cart_1" });
    expect(prismaMock.cart.upsert).toHaveBeenCalledWith({
      where: { userId: "user_123" },
      update: {},
      create: { userId: "user_123" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                inventory: true,
                product: {
                  include: {
                    images: true
                  }
                }
              }
            }
          }
        }
      }
    });
  });

  it("load an existing cart with nested variant, inventory, and image data", async () => {
    prismaMock.cart.findUnique.mockResolvedValue({ id: "cart_2" });

    await expect(getCart("user_123")).resolves.toEqual({ id: "cart_2" });
    expect(prismaMock.cart.findUnique).toHaveBeenCalledWith({
      where: { userId: "user_123" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                inventory: true,
                product: {
                  include: {
                    images: true
                  }
                }
              }
            }
          }
        }
      }
    });
  });
});
