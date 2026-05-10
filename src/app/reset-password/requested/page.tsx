import Link from "next/link";

export default function ResetPasswordRequestedPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Reset requested</p>
      <h1 className="mt-4 font-serif text-5xl text-stone-900">Check your inbox.</h1>
      <p className="mt-6 text-lg text-stone-700">
        If the email exists in the system, a reset link has been generated and handed to the email adapter.
      </p>
      <Link href="/login" className="button-primary mt-8 inline-flex">
        Return to login
      </Link>
    </div>
  );
}
