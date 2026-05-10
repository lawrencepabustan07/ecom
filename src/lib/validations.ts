import { ShippingMethod } from "@prisma/client";
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

export type CheckoutInput = z.infer<typeof checkoutSchema>;
