import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    price: number;
    compareAt: number | null;
    images: Array<{ url: string; alt: string }>;
    category: { name: string };
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-[2rem] border border-black/10 bg-white/70"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-2 p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-stone-500">{product.category.name}</div>
        <h3 className="font-serif text-2xl text-stone-900">{product.name}</h3>
        <p className="text-sm text-stone-600">{product.brand}</p>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-stone-900">{formatPrice(product.price)}</span>
          {product.compareAt ? <span className="text-stone-400 line-through">{formatPrice(product.compareAt)}</span> : null}
        </div>
      </div>
    </Link>
  );
}
