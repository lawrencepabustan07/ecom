export function isGoogleAuthConfigured() {
  return Boolean(
    process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET &&
      !process.env.AUTH_GOOGLE_ID.includes("replace") &&
      !process.env.AUTH_GOOGLE_SECRET.includes("replace")
  );
}

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes("replace") &&
      !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes("replace")
  );
}
