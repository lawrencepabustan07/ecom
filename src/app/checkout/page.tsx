import Link from "next/link";

import { CheckoutForm } from "@/components/forms";
import { auth } from "@/lib/auth";
import { calculateCartTotals, getCart } from "@/lib/cart";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-serif text-4xl text-stone-900">Sign in to continue checkout.</h1>
        <Link href="/login" className="button-primary mt-8 inline-flex">
          Sign in
        </Link>
      </div>
    );
  }

  const cart = await getCart(session.user.id);
  const subtotal = calculateCartTotals(cart?.items ?? []).subtotal;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 font-serif text-4xl text-stone-900">Checkout</h1>
      <CheckoutForm subtotal={subtotal} />
    </div>
  );
}
