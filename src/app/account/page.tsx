import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { ProfileForm } from "@/components/forms";
import { auth } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

type AccountOrder = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

type AccountWishlistItem = Prisma.WishlistItemGetPayload<{
  include: { product: { include: { images: true; category: true } } };
}>;

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-serif text-4xl text-stone-900">Sign in to view your account.</h1>
        <Link href="/login" className="button-primary mt-8 inline-flex">
          Sign in
        </Link>
      </div>
    );
  }

  const [user, wishlist, orders, cart] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: { product: { include: { images: true, category: true } } }
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" }
    }),
    getCart(session.user.id)
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-black/10 bg-white/60 p-8">
            <h1 className="font-serif text-4xl text-stone-900">Account</h1>
            <p className="mt-3 text-stone-600">{user?.email}</p>
            <div className="mt-6">
              <ProfileForm userId={session.user.id} defaultName={user?.name ?? ""} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-stone-900 p-8 text-stone-100">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Current cart</p>
            <p className="mt-4 text-4xl">{cart?.items.length ?? 0}</p>
            <p className="mt-2 text-stone-300">Items ready for checkout.</p>
            <Link href="/cart" className="button-primary mt-6 inline-flex bg-white text-stone-900">
              Open cart
            </Link>
          </section>
        </div>

        <div className="space-y-8">
          <section className="rounded-[2rem] border border-black/10 bg-white/60 p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl text-stone-900">Orders</h2>
            </div>
            <div className="mt-6 space-y-4">
              {orders.map((order: AccountOrder) => (
                <div key={order.id} className="rounded-[1.5rem] border border-black/10 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-stone-600">{order.status}</p>
                    </div>
                    <p>{formatPrice(order.total)}</p>
                  </div>
                </div>
              ))}
              {orders.length === 0 ? <p className="text-stone-600">No orders yet.</p> : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white/60 p-8">
            <h2 className="font-serif text-3xl text-stone-900">Wishlist</h2>
            <div className="mt-6 space-y-4">
              {wishlist.map((entry: AccountWishlistItem) => (
                <div key={entry.id} className="flex items-center justify-between rounded-[1.5rem] border border-black/10 p-5">
                  <div>
                    <p className="font-medium">{entry.product.name}</p>
                    <p className="text-sm text-stone-600">{entry.product.category.name}</p>
                  </div>
                  <Link href={`/products/${entry.product.slug}`} className="text-sm uppercase tracking-[0.18em] text-stone-500">
                    View
                  </Link>
                </div>
              ))}
              {wishlist.length === 0 ? <p className="text-stone-600">No saved products yet.</p> : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
