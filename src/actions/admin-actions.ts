"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/access";
import { assertValidCsrfRequest } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { adminOrderStatusSchema, adminProductSchema, adminUserBlockSchema } from "@/lib/validations";

async function requireAdminSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!isAdminRole(session.user.role) || session.user.isBlocked) {
    redirect("/account");
  }

  return session.user;
}

function toCents(value: number) {
  return Math.round(value * 100);
}

export async function createProduct(formData: FormData) {
  await assertValidCsrfRequest();
  await requireAdminSession();

  const parsed = adminProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    details: formData.get("details"),
    brand: formData.get("brand"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    compareAt: formData.get("compareAt"),
    rating: formData.get("rating"),
    reviewCount: formData.get("reviewCount"),
    featured: String(formData.get("featured") ?? "false"),
    imageUrl: formData.get("imageUrl"),
    imageAlt: formData.get("imageAlt"),
    variantName: formData.get("variantName"),
    color: formData.get("color"),
    size: formData.get("size"),
    sku: formData.get("sku"),
    inventory: formData.get("inventory")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid product input.");
  }

  const data = parsed.data;

  await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      details: data.details,
      brand: data.brand,
      categoryId: data.categoryId,
      price: toCents(data.price),
      compareAt: data.compareAt === "" || typeof data.compareAt === "undefined" ? null : toCents(data.compareAt),
      rating: data.rating,
      reviewCount: data.reviewCount,
      featured: data.featured === "true",
      images: {
        create: {
          url: data.imageUrl,
          alt: data.imageAlt
        }
      },
      variants: {
        create: {
          name: data.variantName,
          color: data.color,
          size: data.size,
          sku: data.sku,
          price: toCents(data.price),
          inventory: {
            create: {
              quantity: data.inventory,
              inStock: data.inventory > 0
            }
          }
        }
      }
    }
  });

  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function updateProduct(formData: FormData) {
  await assertValidCsrfRequest();
  await requireAdminSession();

  const productId = String(formData.get("productId") ?? "");
  if (!productId) {
    throw new Error("Product id is required.");
  }

  const parsed = adminProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    details: formData.get("details"),
    brand: formData.get("brand"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    compareAt: formData.get("compareAt"),
    rating: formData.get("rating"),
    reviewCount: formData.get("reviewCount"),
    featured: String(formData.get("featured") ?? "false"),
    imageUrl: formData.get("imageUrl"),
    imageAlt: formData.get("imageAlt"),
    variantName: formData.get("variantName"),
    color: formData.get("color"),
    size: formData.get("size"),
    sku: formData.get("sku"),
    inventory: formData.get("inventory")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid product input.");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      variants: {
        include: {
          inventory: true
        }
      }
    }
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  const primaryVariant = product.variants[0];
  const primaryImage = product.images[0];
  const data = parsed.data;

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      details: data.details,
      brand: data.brand,
      categoryId: data.categoryId,
      price: toCents(data.price),
      compareAt: data.compareAt === "" || typeof data.compareAt === "undefined" ? null : toCents(data.compareAt),
      rating: data.rating,
      reviewCount: data.reviewCount,
      featured: data.featured === "true",
      images: primaryImage
        ? {
            update: {
              where: { id: primaryImage.id },
              data: {
                url: data.imageUrl,
                alt: data.imageAlt
              }
            }
          }
        : {
            create: {
              url: data.imageUrl,
              alt: data.imageAlt
            }
          },
      variants: primaryVariant
        ? {
            update: {
              where: { id: primaryVariant.id },
              data: {
                name: data.variantName,
                color: data.color,
                size: data.size,
                sku: data.sku,
                price: toCents(data.price),
                inventory: primaryVariant.inventory
                  ? {
                      update: {
                        where: { id: primaryVariant.inventory.id },
                        data: {
                          quantity: data.inventory,
                          inStock: data.inventory > 0
                        }
                      }
                    }
                  : {
                      create: {
                        quantity: data.inventory,
                        inStock: data.inventory > 0
                      }
                    }
              }
            }
          }
        : {
            create: {
              name: data.variantName,
              color: data.color,
              size: data.size,
              sku: data.sku,
              price: toCents(data.price),
              inventory: {
                create: {
                  quantity: data.inventory,
                  inStock: data.inventory > 0
                }
              }
            }
          }
    }
  });

  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/");
}

export async function deleteProduct(formData: FormData) {
  await assertValidCsrfRequest();
  await requireAdminSession();

  const productId = String(formData.get("productId") ?? "");
  if (!productId) {
    throw new Error("Product id is required.");
  }

  await prisma.product.delete({
    where: { id: productId }
  });

  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function updateOrderStatus(formData: FormData) {
  await assertValidCsrfRequest();
  await requireAdminSession();

  const parsed = adminOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid order status input.");
  }

  const nextStatus = parsed.data.status;
  const paymentStatus = nextStatus === OrderStatus.PAID || nextStatus === OrderStatus.FULFILLED ? "paid" : undefined;

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: {
      status: nextStatus,
      ...(paymentStatus ? { paymentStatus } : {})
    }
  });

  revalidatePath("/admin");
  revalidatePath("/account");
}

export async function setUserBlockedState(formData: FormData) {
  await assertValidCsrfRequest();
  const session = await requireAdminSession();

  const parsed = adminUserBlockSchema.safeParse({
    userId: formData.get("userId"),
    mode: formData.get("mode")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid user action.");
  }

  if (parsed.data.userId === session.id) {
    throw new Error("Admins cannot block themselves.");
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { role: true }
  });

  if (!target) {
    throw new Error("User not found.");
  }

  if (target.role === "admin") {
    throw new Error("Admin accounts cannot be blocked from this screen.");
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      isBlocked: parsed.data.mode === "block"
    }
  });

  revalidatePath("/admin");
}
