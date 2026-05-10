"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { assertValidCsrfToken } from "@/lib/csrf";
import { assertInventory, getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { cartInputSchema } from "@/lib/validations";

async function requireSessionUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}

export async function addToCart(formData: FormData) {
  await assertValidCsrfToken(formData);
  const userId = await requireSessionUser();
  const parsed = cartInputSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: Number(formData.get("quantity"))
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid cart input.");
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: parsed.data.variantId },
    include: { inventory: true }
  });

  if (!variant?.inventory) {
    throw new Error("Variant inventory is unavailable.");
  }

  assertInventory(parsed.data.quantity, variant.inventory.quantity);
  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find((item) => item.variantId === parsed.data.variantId);
  const nextQuantity = existingItem ? existingItem.quantity + parsed.data.quantity : parsed.data.quantity;

  assertInventory(nextQuantity, variant.inventory.quantity);

  await prisma.cartItem.upsert({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId: parsed.data.variantId
      }
    },
    update: {
      quantity: nextQuantity
    },
    create: {
      cartId: cart.id,
      variantId: parsed.data.variantId,
      quantity: parsed.data.quantity
    }
  });

  revalidatePath("/cart");
  revalidatePath("/account");
}

export async function updateCartItem(formData: FormData) {
  await assertValidCsrfToken(formData);
  const userId = await requireSessionUser();
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity"));

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((entry) => entry.id === itemId);

  if (!item) {
    throw new Error("Cart item not found.");
  }

  assertInventory(quantity, item.variant.inventory?.quantity ?? 0);

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity }
  });

  revalidatePath("/cart");
}

export async function removeCartItem(formData: FormData) {
  await assertValidCsrfToken(formData);
  await requireSessionUser();
  const itemId = String(formData.get("itemId") ?? "");

  await prisma.cartItem.delete({
    where: { id: itemId }
  });

  revalidatePath("/cart");
}
