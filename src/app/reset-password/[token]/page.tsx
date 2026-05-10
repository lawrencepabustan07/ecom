import { notFound } from "next/navigation";

import { PasswordResetForm } from "@/components/forms";
import { prisma } from "@/lib/prisma";

type ResetTokenPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ResetTokenPage({ params }: ResetTokenPageProps) {
  const { token } = await params;
  const verification = await prisma.verificationToken.findFirst({
    where: { token }
  });

  if (!verification || verification.expires < new Date()) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="grid gap-8 rounded-[3rem] border border-black/10 bg-white/55 p-8 md:grid-cols-2 md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Choose a new password</p>
          <h1 className="mt-4 font-serif text-5xl text-stone-900">Secure the account and continue shopping.</h1>
        </div>
        <PasswordResetForm token={token} email={verification.identifier} />
      </div>
    </div>
  );
}
