import { OrderStatus, ShippingMethod } from "@prisma/client";
import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[0-9]/, "Password must include a number.")
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const cartInputSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(10)
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80)
});

export const checkoutSchema = z.object({
  name: z.string().min(2).max(80),
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  postalCode: z.string().min(3).max(20),
  country: z.string().length(2),
  phone: z.string().min(7).max(20),
  shippingMethod: z.nativeEnum(ShippingMethod)
});

export const adminProductSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers, and hyphens."),
  description: z.string().min(10).max(500),
  details: z.string().min(10).max(1000),
  brand: z.string().min(2).max(80),
  categoryId: z.string().min(1),
  price: z.coerce.number().min(0),
  compareAt: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  rating: z.coerce.number().min(0).max(5),
  reviewCount: z.coerce.number().int().min(0),
  featured: z.union([z.literal("true"), z.literal("false")]),
  imageUrl: z.string().url(),
  imageAlt: z.string().min(2).max(160),
  variantName: z.string().min(2).max(120),
  color: z.string().min(1).max(60),
  size: z.string().min(1).max(60),
  sku: z.string().min(2).max(120),
  inventory: z.coerce.number().int().min(0)
});

export const adminOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.nativeEnum(OrderStatus)
});

export const adminUserBlockSchema = z.object({
  userId: z.string().min(1),
  mode: z.union([z.literal("block"), z.literal("unblock")])
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(3).max(120),
  body: z.string().min(20).max(1000),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional()
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
