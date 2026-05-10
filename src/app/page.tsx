import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts } from "@/lib/catalog";

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-6 rounded-[3rem] border border-black/10 bg-white/45 p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Meridian Atelier</p>
          <h1 className="max-w-3xl font-serif text-5xl leading-none text-stone-900 md:text-7xl">
            Quiet drama for the city after dark.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-stone-700">
            A premium storefront MVP with tailored layers, precise commerce flows, and a visual language pulled from magazine editorials rather than generic UI kits.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="button-primary">
              Explore Collection
            </Link>
            <Link href="/register" className="button-secondary">
              Create Account
            </Link>
          </div>
        </div>
        <div className="rounded-[3rem] border border-black/10 bg-stone-900 p-8 text-stone-100">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-300">Current focus</p>
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-4xl">03</p>
              <p className="mt-2 text-stone-300">Seeded statement pieces ready for catalog, wishlist, cart, and checkout.</p>
            </div>
            <div>
              <p className="text-4xl">1 region</p>
              <p className="mt-2 text-stone-300">Flat-rate shipping configured for a secure single-market launch.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Featured edit</p>
            <h2 className="mt-3 font-serif text-4xl text-stone-900">Tailored essentials, staged with intent.</h2>
          </div>
          <Link href="/products" className="text-sm uppercase tracking-[0.2em] text-stone-600">
            View all
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
