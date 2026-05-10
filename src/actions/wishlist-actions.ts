"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { assertValidCsrfToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";

async function requireSessionUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}

export async function toggleWishlist(formData: FormData) {
  await assertValidCsrfToken(formData);
  const userId = await requireSessionUser();
  const productId = String(formData.get("productId") ?? "");

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { id: existing.id }
    });
  } else {
    await prisma.wishlistItem.create({
      data: { userId, productId }
    });
  }

  revalidatePath("/account");
  revalidatePath("/products");
}
