import { ShippingMethod } from "@prisma/client";

export const SHIPPING_AMOUNTS: Record<ShippingMethod, number> = {
  STANDARD: 1200,
  EXPRESS: 2400,
  WHITE_GLOVE: 4500
};

export function getShippingAmount(method: ShippingMethod) {
  return SHIPPING_AMOUNTS[method];
}

export function calculateOrderTotal(subtotal: number, shippingAmount: number) {
  return subtotal + shippingAmount;
}
