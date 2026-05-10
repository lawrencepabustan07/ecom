import { ShippingMethod } from "@prisma/client";

import { addToCart, removeCartItem, updateCartItem } from "@/actions/cart-actions";
import { createCheckoutSession } from "@/actions/checkout-actions";
import {
  completePasswordReset,
  loginUser,
  loginWithGoogle,
  registerUser,
  requestPasswordReset,
  updateProfile
} from "@/actions/auth-actions";
import { submitReview } from "@/actions/review-actions";
import { toggleWishlist } from "@/actions/wishlist-actions";
import { isGoogleAuthConfigured, isStripeConfigured } from "@/lib/env";
import { formatPrice } from "@/lib/utils";

export async function LoginForm() {
  const showGoogle = isGoogleAuthConfigured();

  return (
    <div className="space-y-4 rounded-[2rem] border border-black/10 bg-white p-8">
      <form action={loginUser} className="space-y-4">
        <input name="email" type="email" placeholder="Email" className="field" />
        <input name="password" type="password" placeholder="Password" className="field" />
        <button type="submit" className="button-primary w-full">
          Sign in
        </button>
      </form>
      {showGoogle ? (
        <form action={loginWithGoogle}>
          <button type="submit" className="button-secondary w-full">
            Continue with Google
          </button>
        </form>
      ) : (
        <p className="text-sm text-stone-500">Google sign-in is hidden until valid Google OAuth keys are configured.</p>
      )}
    </div>
  );
}

export async function RegisterForm() {
  return (
    <form action={registerUser} className="space-y-4 rounded-[2rem] border border-black/10 bg-white p-8">
      <input name="name" placeholder="Full name" className="field" />
      <input name="email" type="email" placeholder="Email" className="field" />
      <input name="password" type="password" placeholder="Password" className="field" />
      <button type="submit" className="button-primary w-full">
        Create account
      </button>
    </form>
  );
}

export async function AddToCartForm({ variantId }: { variantId: string }) {
  return (
    <form action={addToCart} className="flex items-center gap-3">
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value="1" />
      <button type="submit" className="button-primary">
        Add to cart
      </button>
    </form>
  );
}

export async function WishlistButton({ productId }: { productId: string }) {
  return (
    <form action={toggleWishlist}>
      <input type="hidden" name="productId" value={productId} />
      <button type="submit" className="button-secondary">
        Toggle wishlist
      </button>
    </form>
  );
}

export async function CartItemForm({ itemId, quantity }: { itemId: string; quantity: number }) {
  return (
    <div className="flex items-center gap-3">
      <form action={updateCartItem} className="flex items-center gap-2">
        <input type="hidden" name="itemId" value={itemId} />
        <input type="number" name="quantity" defaultValue={quantity} min={1} max={10} className="field w-20" />
        <button type="submit" className="button-secondary">
          Update
        </button>
      </form>
      <form action={removeCartItem}>
        <input type="hidden" name="itemId" value={itemId} />
        <button type="submit" className="text-sm uppercase tracking-[0.18em] text-stone-500">
          Remove
        </button>
      </form>
    </div>
  );
}

export async function ProfileForm({ userId, defaultName }: { userId: string; defaultName: string | null }) {
  return (
    <form action={updateProfile.bind(null, userId)} className="space-y-4 rounded-[2rem] border border-black/10 bg-white p-8">
      <input name="name" defaultValue={defaultName ?? ""} className="field" />
      <button type="submit" className="button-primary">
        Save profile
      </button>
    </form>
  );
}

export async function CheckoutForm({ subtotal }: { subtotal: number }) {
  const stripeReady = isStripeConfigured();

  return (
    <form action={createCheckoutSession} className="grid gap-4 rounded-[2rem] border border-black/10 bg-white p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <input name="name" placeholder="Full name" className="field" />
        <input name="phone" placeholder="Phone" className="field" />
      </div>
      <input name="line1" placeholder="Address line 1" className="field" />
      <input name="line2" placeholder="Address line 2" className="field" />
      <div className="grid gap-4 md:grid-cols-3">
        <input name="city" placeholder="City" className="field" />
        <input name="state" placeholder="State" className="field" />
        <input name="postalCode" placeholder="Postal code" className="field" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="country" placeholder="Country code" defaultValue="US" className="field" />
        <select name="shippingMethod" className="field">
          <option value={ShippingMethod.STANDARD}>Standard - {formatPrice(1200)}</option>
          <option value={ShippingMethod.EXPRESS}>Express - {formatPrice(2400)}</option>
          <option value={ShippingMethod.WHITE_GLOVE}>White Glove - {formatPrice(4500)}</option>
        </select>
      </div>
      <div className="rounded-[1.5rem] bg-stone-100 p-4 text-sm text-stone-700">
        Cart subtotal: <span className="font-medium text-stone-900">{formatPrice(subtotal)}</span>
      </div>
      {!stripeReady ? (
        <p className="rounded-[1.5rem] bg-amber-100 p-4 text-sm text-amber-900">
          Checkout is disabled until valid Stripe keys are set in `.env.local`.
        </p>
      ) : null}
      <button type="submit" className="button-primary" disabled={!stripeReady}>
        Continue to Stripe
      </button>
    </form>
  );
}

export async function PasswordResetRequestForm() {
  return (
    <form action={requestPasswordReset} className="space-y-4 rounded-[2rem] border border-black/10 bg-white p-8">
      <input name="email" type="email" placeholder="Email" className="field" />
      <button type="submit" className="button-primary w-full">
        Send reset link
      </button>
    </form>
  );
}

export async function PasswordResetForm({ token, email }: { token: string; email: string }) {
  return (
    <form action={completePasswordReset.bind(null, token)} className="space-y-4 rounded-[2rem] border border-black/10 bg-white p-8">
      <input type="hidden" name="email" value={email} />
      <input name="password" type="password" placeholder="New password" className="field" />
      <button type="submit" className="button-primary w-full">
        Reset password
      </button>
    </form>
  );
}

export async function ProductReviewForm({
  productId,
  existingReview
}: {
  productId: string;
  existingReview?: {
    rating: number;
    title: string;
    body: string;
    imageUrl: string | null;
  } | null;
}) {
  return (
    <form action={submitReview} className="grid gap-4 rounded-[2rem] border border-black/10 bg-white p-8">
      <input type="hidden" name="productId" value={productId} />
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <select name="rating" defaultValue={String(existingReview?.rating ?? 5)} className="field">
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
        <input name="title" defaultValue={existingReview?.title ?? ""} placeholder="Review title" className="field" />
      </div>
      <textarea
        name="body"
        defaultValue={existingReview?.body ?? ""}
        placeholder="Share sizing, quality, and delivery notes that help the next customer."
        className="field min-h-32"
      />
      <input
        name="imageUrl"
        defaultValue={existingReview?.imageUrl ?? ""}
        placeholder="Optional image URL"
        className="field"
      />
      <button type="submit" className="button-primary w-full sm:w-fit">
        {existingReview ? "Update review" : "Submit review"}
      </button>
    </form>
  );
}
