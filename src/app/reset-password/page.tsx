import Link from "next/link";

import { PasswordResetRequestForm } from "@/components/forms";

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="grid gap-8 rounded-[3rem] border border-black/10 bg-white/55 p-8 md:grid-cols-2 md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Password reset</p>
          <h1 className="mt-4 font-serif text-5xl text-stone-900">Recover your access securely.</h1>
          <p className="mt-4 text-stone-700">Enter the email address attached to your account and we will issue a reset link.</p>
          <p className="mt-10 text-sm text-stone-600">
            Back to{" "}
            <Link href="/login" className="underline">
              sign in
            </Link>
          </p>
        </div>
        <PasswordResetRequestForm />
      </div>
    </div>
  );
}
