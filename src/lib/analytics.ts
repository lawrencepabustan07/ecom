import { OrderStatus } from "@prisma/client";

export function summarizeOrderStatuses(
  orders: Array<{
    status: OrderStatus;
    total: number;
  }>
) {
  const base = {
    PENDING: { count: 0, revenue: 0 },
    PAID: { count: 0, revenue: 0 },
    FULFILLED: { count: 0, revenue: 0 },
    CANCELLED: { count: 0, revenue: 0 }
  };

  for (const order of orders) {
    base[order.status].count += 1;
    base[order.status].revenue += order.total;
  }

  return base;
}

export function summarizeTopProducts(
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>
) {
  const grouped = new Map<string, { name: string; units: number; revenue: number }>();

  for (const item of items) {
    const existing = grouped.get(item.name) ?? {
      name: item.name,
      units: 0,
      revenue: 0
    };

    existing.units += item.quantity;
    existing.revenue += item.quantity * item.unitPrice;
    grouped.set(item.name, existing);
  }

  return [...grouped.values()].sort((left, right) => right.revenue - left.revenue || right.units - left.units);
}
