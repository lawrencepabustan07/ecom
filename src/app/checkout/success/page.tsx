import Link from "next/link";

import { finalizeCheckout } from "@/actions/checkout-actions";
import { formatPrice } from "@/lib/utils";

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const order = sessionId ? await finalizeCheckout(sessionId) : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Order confirmed</p>
      <h1 className="mt-4 font-serif text-5xl text-stone-900">Thank you for your purchase.</h1>
      {order ? (
        <p className="mt-6 text-lg text-stone-700">
          Order <span className="font-medium">{order.id}</span> has been paid for {formatPrice(order.total)}.
        </p>
      ) : (
        <p className="mt-6 text-lg text-stone-700">We could not confirm the payment session.</p>
      )}
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/account" className="button-primary">
          View account
        </Link>
        <Link href="/products" className="button-secondary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
