import Image from "next/image";
import { notFound } from "next/navigation";

import { AddToCartForm, WishlistButton } from "@/components/forms";
import { getProductBySlug } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryVariant = product.variants[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {product.images.map((image) => (
            <div key={image.id} className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-black/10">
              <Image src={image.url} alt={image.alt} fill className="object-cover" />
            </div>
          ))}
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white/60 p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{product.category.name}</p>
          <h1 className="mt-4 font-serif text-5xl text-stone-900">{product.name}</h1>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-stone-500">{product.brand}</p>
          <p className="mt-6 text-lg leading-8 text-stone-700">{product.description}</p>
          <div className="mt-6 flex items-center gap-4">
            <p className="text-2xl text-stone-900">{formatPrice(product.price)}</p>
            {product.compareAt ? <p className="text-stone-400 line-through">{formatPrice(product.compareAt)}</p> : null}
          </div>
          <div className="mt-8 space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Available variants</p>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((variant) => (
                <div key={variant.id} className="rounded-full border border-black/10 px-4 py-2 text-sm">
                  {variant.name} • {variant.inventory?.quantity ?? 0} left
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {primaryVariant ? <AddToCartForm variantId={primaryVariant.id} /> : null}
            <WishlistButton productId={product.id} />
          </div>
          <div className="mt-10 rounded-[1.5rem] bg-stone-100 p-5 text-sm leading-7 text-stone-700">{product.details}</div>
        </section>
      </div>
    </div>
  );
}
