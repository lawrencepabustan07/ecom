"use server";

import { hash } from "bcryptjs";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { assertValidCsrfRequest } from "@/lib/csrf";
import { getDashboardPathForRole } from "@/lib/access";
import { isGoogleAuthConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { signIn } from "@/lib/auth";
import { profileSchema, signUpSchema } from "@/lib/validations";

export async function registerUser(formData: FormData) {
  await assertValidCsrfRequest();
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid sign-up data.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (existing) {
    throw new Error("An account already exists for that email address.");
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hash(parsed.data.password, 10)
    }
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: getDashboardPathForRole("customer")
  });
}

export async function loginUser(formData: FormData) {
  await assertValidCsrfRequest();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { role: true, isBlocked: true }
  });

  if (user?.isBlocked) {
    redirect("/login?error=blocked");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: getDashboardPathForRole(user?.role)
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=invalid_credentials");
    }

    throw error;
  }
}

export async function loginWithGoogle(formData: FormData) {
  void formData;
  await assertValidCsrfRequest();
  if (!isGoogleAuthConfigured()) {
    redirect("/login?error=google_not_configured");
  }

  await signIn("google", {
    redirectTo: "/account"
  });
}

export async function updateProfile(userId: string, formData: FormData) {
  await assertValidCsrfRequest();
  const parsed = profileSchema.safeParse({
    name: formData.get("name")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid profile data.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name: parsed.data.name }
  });

  redirect("/account");
}

export async function requestPasswordReset(formData: FormData) {
  await assertValidCsrfRequest();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    throw new Error("Email is required.");
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    redirect("/reset-password/requested");
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  });

  await sendPasswordResetEmail(email, `${process.env.APP_URL}/reset-password/${token}`);
  redirect("/reset-password/requested");
}

export async function completePasswordReset(token: string, formData: FormData) {
  await assertValidCsrfRequest();
  const password = String(formData.get("password") ?? "");
  const parsed = signUpSchema.pick({ password: true }).safeParse({ password });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid password.");
  }

  const verification = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: String(formData.get("email") ?? ""),
        token
      }
    }
  });

  if (!verification || verification.expires < new Date()) {
    throw new Error("Password reset link is invalid or expired.");
  }

  await prisma.user.update({
    where: { email: verification.identifier },
    data: {
      passwordHash: await hash(parsed.data.password, 10)
    }
  });

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verification.identifier,
        token
      }
    }
  });

  redirect("/login");
}
