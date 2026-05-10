import Link from "next/link";

import { LoginForm } from "@/components/forms";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage =
    params.error === "invalid_credentials"
      ? "The email or password was not accepted."
      : params.error === "blocked"
        ? "This account has been blocked. Contact an administrator."
      : params.error === "google_not_configured"
        ? "Google sign-in is not configured in the current environment."
        : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="grid gap-8 rounded-[3rem] border border-black/10 bg-white/55 p-8 md:grid-cols-2 md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Welcome back</p>
          <h1 className="mt-4 font-serif text-5xl text-stone-900">Return to the collection.</h1>
          <p className="mt-4 text-stone-700">Use your account to manage wishlist, cart, orders, and checkout.</p>
          <p className="mt-10 text-sm text-stone-600">
            New here?{" "}
            <Link href="/register" className="underline">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-sm text-stone-600">
            Forgot your password?{" "}
            <Link href="/reset-password" className="underline">
              Reset it
            </Link>
          </p>
          {errorMessage ? <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
