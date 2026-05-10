import { ProductCard } from "@/components/product-card";
import {
  type CatalogProduct,
  getBrands,
  getCatalogProducts,
  getCategories,
  getSizes,
  normalizeCatalogFilters,
} from "@/lib/catalog";

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    sort?: "featured" | "price-asc" | "price-desc" | "newest";
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const filters = await searchParams;
  const normalizedFilters = normalizeCatalogFilters(filters);
  const [products, categories, brands, sizes] = await Promise.all([
    getCatalogProducts(normalizedFilters),
    getCategories(),
    getBrands(),
    getSizes(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[2rem] border border-black/10 bg-white/55 p-6">
          <h1 className="font-serif text-3xl text-stone-900">Collection</h1>
          <form className="mt-6 space-y-4">
            <input
              name="search"
              placeholder="Search products"
              defaultValue={normalizedFilters.search}
              className="field"
            />
            <select
              name="category"
              defaultValue={normalizedFilters.category}
              className="field"
              aria-label="Category"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <select name="brand" defaultValue={normalizedFilters.brand} className="field" aria-label="Brand">
              <option value="">All brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <select name="size" defaultValue={normalizedFilters.size} className="field" aria-label="Size">
              <option value="">All sizes</option>
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="minPrice"
                type="number"
                min="0"
                step="1"
                defaultValue={normalizedFilters.minPrice}
                placeholder="Min price (USD)"
                className="field"
              />
              <input
                name="maxPrice"
                type="number"
                min="0"
                step="1"
                defaultValue={normalizedFilters.maxPrice}
                placeholder="Max price (USD)"
                className="field"
              />
            </div>
            <select name="rating" defaultValue={normalizedFilters.rating} className="field" aria-label="Minimum rating">
              <option value="">Any rating</option>
              <option value="4">4 stars & up</option>
              <option value="4.5">4.5 stars & up</option>
            </select>
            <select
              name="sort"
              defaultValue={normalizedFilters.sort ?? "featured"}
              className="field"
              aria-label="Sort by"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
              <option value="newest">Newest</option>
            </select>
            <button type="submit" className="button-primary w-full">
              Apply filters
            </button>
          </form>
        </aside>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
              {products.length} items
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product: CatalogProduct) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
