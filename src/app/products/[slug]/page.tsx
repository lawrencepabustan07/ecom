import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";

import { AddToCartForm, ProductReviewForm, WishlistButton } from "@/components/forms";
import { auth } from "@/lib/auth";
import { getProductBySlug } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const session = await auth();
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryVariant = product.variants[0];
  const userId = session?.user?.id;
  const existingReview = userId ? product.reviews.find((review) => review.userId === userId) : null;
  const canReview = userId
    ? Boolean(
        await prisma.orderItem.findFirst({
          where: {
            productId: product.id,
            order: {
              userId,
              status: {
                in: ["PAID", "FULFILLED"]
              }
            }
          },
          select: {
            id: true
          }
        })
      )
    : false;

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
          <p className="mt-4 text-sm uppercase tracking-[0.18em] text-stone-500">
            {product.rating.toFixed(1)} stars · {product.reviewCount} reviews
          </p>
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

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-black/10 bg-stone-900 p-8 text-stone-100">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Customer reviews</p>
          <h2 className="mt-4 font-serif text-4xl">{product.rating.toFixed(1)} average rating</h2>
          <p className="mt-3 text-stone-300">{product.reviewCount} verified customer reviews.</p>
          <div className="mt-8 space-y-4">
            {product.reviews.map((review) => (
              <article key={review.id} className="rounded-[1.5rem] border border-white/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{review.title}</p>
                    <p className="text-sm text-stone-400">{review.user.name ?? "Verified customer"}</p>
                  </div>
                  <p className="text-sm uppercase tracking-[0.18em] text-stone-300">{review.rating}/5</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-stone-200">{review.body}</p>
                {review.imageUrl ? (
                  <Link href={review.imageUrl} className="mt-4 inline-flex text-sm uppercase tracking-[0.18em] text-stone-300 underline">
                    View review image
                  </Link>
                ) : null}
              </article>
            ))}
            {product.reviews.length === 0 ? <p className="text-stone-300">No customer reviews yet.</p> : null}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white/60 p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Write a review</p>
          <h2 className="mt-4 font-serif text-4xl text-stone-900">Share how it wore in the real world.</h2>
          <p className="mt-4 text-stone-700">
            Reviews are limited to customers who completed a paid order for this product.
          </p>
          <div className="mt-8">
            {userId && canReview ? (
              <ProductReviewForm productId={product.id} existingReview={existingReview} />
            ) : userId ? (
              <div className="rounded-[2rem] border border-black/10 bg-white p-8">
                <p className="text-stone-700">Complete a paid purchase for this product before leaving a review.</p>
              </div>
            ) : (
              <div className="rounded-[2rem] border border-black/10 bg-white p-8">
                <p className="text-stone-700">Sign in after purchase to leave a verified review.</p>
                <Link href="/login" className="button-primary mt-6 inline-flex">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
