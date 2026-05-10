import Link from "next/link";

import { RegisterForm } from "@/components/forms";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="grid gap-8 rounded-[3rem] border border-black/10 bg-white/55 p-8 md:grid-cols-2 md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Create your profile</p>
          <h1 className="mt-4 font-serif text-5xl text-stone-900">Save your edit, track every order.</h1>
          <p className="mt-4 text-stone-700">Account creation enables secure checkout, wishlist persistence, and order history.</p>
          <p className="mt-10 text-sm text-stone-600">
            Already registered?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
