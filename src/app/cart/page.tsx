import Link from "next/link";

import { CartItemForm } from "@/components/forms";
import { auth } from "@/lib/auth";
import { calculateCartTotals, getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

export default async function CartPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-serif text-4xl text-stone-900">Your cart is waiting.</h1>
        <p className="mt-4 text-stone-700">Sign in to manage items and move into checkout.</p>
        <Link href="/login" className="button-primary mt-8 inline-flex">
          Sign in
        </Link>
      </div>
    );
  }

  const cart = await getCart(session.user.id);
  const cartItems = cart?.items ?? [];
  const totals = calculateCartTotals(cartItems);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <section className="flex-1 space-y-4 rounded-[2rem] border border-black/10 bg-white/60 p-8">
          <h1 className="font-serif text-4xl text-stone-900">Cart</h1>
          {cartItems.map((item) => (
            <div key={item.id} className="rounded-[1.5rem] border border-black/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl">{item.variant.product.name}</h2>
                  <p className="text-sm text-stone-600">{item.variant.name}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-stone-500">{formatPrice(item.variant.price)}</p>
                </div>
                <CartItemForm itemId={item.id} quantity={item.quantity} />
              </div>
            </div>
          ))}
          {cartItems.length ? null : <p className="text-stone-600">Your cart is empty.</p>}
        </section>

        <aside className="w-full rounded-[2rem] border border-black/10 bg-stone-900 p-8 text-stone-100 lg:max-w-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Summary</p>
          <div className="mt-6 flex items-center justify-between">
            <span>Items</span>
            <span>{totals.itemCount}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          <Link href="/checkout" className="button-primary mt-8 inline-flex w-full justify-center bg-white text-stone-900">
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
