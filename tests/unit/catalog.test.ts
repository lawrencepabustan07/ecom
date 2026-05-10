import { afterEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn()
    },
    category: {
      findMany: vi.fn()
    }
  }
}));

vi.mock("../../src/lib/prisma", () => ({
  prisma: prismaMock
}));

import { buildCatalogOrder, buildCatalogWhere } from "../../src/lib/catalog";
import { getCatalogProducts, getCategories, getFeaturedProducts, getProductBySlug } from "../../src/lib/catalog";

describe("catalog helpers", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("build a case-insensitive search where clause", () => {
    expect(buildCatalogWhere({ search: "coat" })).toEqual({
      OR: [
        { name: { contains: "coat", mode: "insensitive" } },
        { brand: { contains: "coat", mode: "insensitive" } },
        { description: { contains: "coat", mode: "insensitive" } }
      ]
    });
  });

  it("trim search input and combine it with category filters", () => {
    expect(buildCatalogWhere({ search: "  knit  ", category: "knitwear" })).toEqual({
      category: { slug: "knitwear" },
      OR: [
        { name: { contains: "knit", mode: "insensitive" } },
        { brand: { contains: "knit", mode: "insensitive" } },
        { description: { contains: "knit", mode: "insensitive" } }
      ]
    });
  });

  it("return descending price order", () => {
    expect(buildCatalogOrder("price-desc")).toEqual({ price: "desc" });
  });

  it("return newest order when requested", () => {
    expect(buildCatalogOrder("newest")).toEqual({ createdAt: "desc" });
  });

  it("default to featured-first ordering", () => {
    expect(buildCatalogOrder("featured")).toEqual([{ featured: "desc" }, { createdAt: "desc" }]);
  });

  it("query featured products with the expected relation graph", async () => {
    prismaMock.product.findMany.mockResolvedValue([{ id: "product_1" }]);

    await expect(getFeaturedProducts()).resolves.toEqual([{ id: "product_1" }]);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { featured: true },
      include: {
        images: true,
        category: true,
        variants: { include: { inventory: true } }
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 3
    });
  });

  it("query catalog products with built filters and order", async () => {
    prismaMock.product.findMany.mockResolvedValue([{ id: "product_2" }]);

    await expect(getCatalogProducts({ search: "coat", sort: "price-asc" })).resolves.toEqual([{ id: "product_2" }]);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: buildCatalogWhere({ search: "coat", sort: "price-asc" }),
      include: {
        images: true,
        category: true,
        variants: { include: { inventory: true } }
      },
      orderBy: { price: "asc" }
    });
  });

  it("load categories in ascending name order", async () => {
    prismaMock.category.findMany.mockResolvedValue([{ id: "category_1" }]);

    await expect(getCategories()).resolves.toEqual([{ id: "category_1" }]);
    expect(prismaMock.category.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" }
    });
  });

  it("load a product by slug with related records", async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: "product_3" });

    await expect(getProductBySlug("nocturne-wool-coat")).resolves.toEqual({ id: "product_3" });
    expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
      where: { slug: "nocturne-wool-coat" },
      include: {
        category: true,
        images: true,
        variants: { include: { inventory: true } }
      }
    });
  });
});
