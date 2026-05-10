import { OrderStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { summarizeOrderStatuses, summarizeTopProducts } from "../../src/lib/analytics";

describe("analytics helpers", () => {
  it("summarize order counts and revenue by status", () => {
    expect(
      summarizeOrderStatuses([
        { status: OrderStatus.PAID, total: 10000 },
        { status: OrderStatus.PAID, total: 8000 },
        { status: OrderStatus.PENDING, total: 4000 }
      ])
    ).toEqual({
      PENDING: { count: 1, revenue: 4000 },
      PAID: { count: 2, revenue: 18000 },
      FULFILLED: { count: 0, revenue: 0 },
      CANCELLED: { count: 0, revenue: 0 }
    });
  });

  it("aggregate top products by revenue and unit count", () => {
    expect(
      summarizeTopProducts([
        { name: "Nocturne Wool Coat", quantity: 1, unitPrice: 42000 },
        { name: "Gallery Cashmere Crew", quantity: 2, unitPrice: 24000 },
        { name: "Nocturne Wool Coat", quantity: 1, unitPrice: 42000 }
      ])
    ).toEqual([
      { name: "Nocturne Wool Coat", units: 2, revenue: 84000 },
      { name: "Gallery Cashmere Crew", units: 2, revenue: 48000 }
    ]);
  });
});
