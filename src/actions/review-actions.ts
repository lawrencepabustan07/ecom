"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { calculateReviewMetrics } from "@/lib/reviews";
import { assertValidCsrfRequest } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

async function requireReviewingUser() {
  const session = await auth();

  if (!session?.user?.id || session.user.isBlocked) {
    redirect("/login");
  }

  return session.user;
}

async function syncProductReviews(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: {
      rating: true
    }
  });

  const metrics = calculateReviewMetrics(reviews);

  await prisma.product.update({
    where: { id: productId },
    data: metrics
  });
}

export async function submitReview(formData: FormData) {
  await assertValidCsrfRequest();
  const user = await requireReviewingUser();

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
    imageUrl: formData.get("imageUrl")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid review input.");
  }

  const hasPurchasedProduct = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: {
        userId: user.id,
        status: {
          in: ["PAID", "FULFILLED"]
        }
      }
    },
    select: {
      id: true
    }
  });

  if (!hasPurchasedProduct) {
    throw new Error("Only customers who purchased this product can leave a review.");
  }

  await prisma.review.upsert({
    where: {
      userId_productId: {
        userId: user.id,
        productId: parsed.data.productId
      }
    },
    update: {
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      imageUrl: parsed.data.imageUrl || null
    },
    create: {
      userId: user.id,
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      imageUrl: parsed.data.imageUrl || null
    }
  });

  await syncProductReviews(parsed.data.productId);

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { slug: true }
  });

  if (product) {
    revalidatePath(`/products/${product.slug}`);
  }

  revalidatePath("/admin");
  revalidatePath("/products");
}
