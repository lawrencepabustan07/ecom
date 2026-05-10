import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type CatalogFilters = {
  search?: string;
  category?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
};

export type CatalogProduct = Prisma.ProductGetPayload<{
  include: {
    images: true;
    category: true;
    variants: { include: { inventory: true } };
  };
}>;

export function buildCatalogWhere(filters: CatalogFilters) {
  const search = filters.search?.trim();

  return {
    ...(filters.category ? { category: { slug: filters.category } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { brand: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export function buildCatalogOrder(sort: CatalogFilters["sort"]) {
  switch (sort) {
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "newest":
      return { createdAt: "desc" as const };
    default:
      return [{ featured: "desc" as const }, { createdAt: "desc" as const }];
  }
}

export async function getFeaturedProducts(): Promise<CatalogProduct[]> {
  return prisma.product.findMany({
    where: { featured: true },
    include: {
      images: true,
      category: true,
      variants: { include: { inventory: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 3,
  });
}

export async function getCatalogProducts(
  filters: CatalogFilters,
): Promise<CatalogProduct[]> {
  return prisma.product.findMany({
    where: buildCatalogWhere(filters),
    include: {
      images: true,
      category: true,
      variants: { include: { inventory: true } },
    },
    orderBy: buildCatalogOrder(filters.sort),
  });
}

export async function getCategories(): Promise<
  Prisma.CategoryGetPayload<Record<string, never>>[]
> {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: true,
      variants: { include: { inventory: true } },
    },
  });
}
