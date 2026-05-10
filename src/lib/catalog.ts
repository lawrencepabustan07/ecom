import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "./prisma";

export type CatalogFilters = {
  search?: string;
  category?: string;
  brand?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
};

export type CatalogProduct = Prisma.ProductGetPayload<{
  include: {
    images: true;
    category: true;
    variants: { include: { inventory: true } };
  };
}>;

const catalogQuerySchema = z.object({
  search: z.union([z.string(), z.array(z.string())]).optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  brand: z.union([z.string(), z.array(z.string())]).optional(),
  size: z.union([z.string(), z.array(z.string())]).optional(),
  minPrice: z.union([z.string(), z.array(z.string())]).optional(),
  maxPrice: z.union([z.string(), z.array(z.string())]).optional(),
  rating: z.union([z.string(), z.array(z.string())]).optional(),
  sort: z.union([z.string(), z.array(z.string())]).optional()
});

function coerceQueryValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function coercePositiveNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function normalizeCatalogFilters(rawFilters: unknown): CatalogFilters {
  const parsed = catalogQuerySchema.safeParse(rawFilters);
  if (!parsed.success) {
    return {};
  }

  const search = coerceQueryValue(parsed.data.search)?.trim();
  const category = coerceQueryValue(parsed.data.category)?.trim();
  const brand = coerceQueryValue(parsed.data.brand)?.trim();
  const size = coerceQueryValue(parsed.data.size)?.trim();
  const minPrice = coercePositiveNumber(coerceQueryValue(parsed.data.minPrice));
  const maxPrice = coercePositiveNumber(coerceQueryValue(parsed.data.maxPrice));
  const rating = coercePositiveNumber(coerceQueryValue(parsed.data.rating));
  const sort = coerceQueryValue(parsed.data.sort);

  return {
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
    ...(brand ? { brand } : {}),
    ...(size ? { size } : {}),
    ...(typeof minPrice === "number" ? { minPrice } : {}),
    ...(typeof maxPrice === "number" ? { maxPrice } : {}),
    ...(typeof rating === "number" ? { rating } : {}),
    ...(sort === "featured" || sort === "price-asc" || sort === "price-desc" || sort === "newest" ? { sort } : {})
  };
}

export function buildCatalogWhere(filters: CatalogFilters) {
  const search = filters.search?.trim();

  return {
    ...(filters.category ? { category: { slug: filters.category } } : {}),
    ...(filters.brand ? { brand: filters.brand } : {}),
    ...(filters.size ? { variants: { some: { size: filters.size } } } : {}),
    ...(typeof filters.rating === "number" ? { rating: { gte: filters.rating } } : {}),
    ...(typeof filters.minPrice === "number" || typeof filters.maxPrice === "number"
      ? {
          price: {
            ...(typeof filters.minPrice === "number" ? { gte: Math.round(filters.minPrice * 100) } : {}),
            ...(typeof filters.maxPrice === "number" ? { lte: Math.round(filters.maxPrice * 100) } : {})
          }
        }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { brand: { contains: search } },
            { description: { contains: search } },
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

export async function getBrands() {
  const products = await prisma.product.findMany({
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" }
  });

  return products.map((product) => product.brand);
}

export async function getSizes() {
  const variants = await prisma.productVariant.findMany({
    select: { size: true },
    distinct: ["size"],
    orderBy: { size: "asc" }
  });

  return variants.map((variant) => variant.size);
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      variants: { include: { inventory: true } },
    },
  });
}
