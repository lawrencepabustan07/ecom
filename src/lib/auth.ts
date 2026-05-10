import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import type { Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

import { isGoogleAuthConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validations";

export function mergeUserIdIntoToken(token: JWT, user?: { id?: string }) {
  if (user?.id) {
    token.sub = user.id;
  }

  return token;
}

export function mergeTokenIdIntoSession(session: Session, token: JWT) {
  if (session.user && token.sub) {
    session.user.id = token.sub;
  }

  return session;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    ...(isGoogleAuthConfigured()
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID ?? "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET ?? ""
          })
        ]
      : []),
    Credentials({
      name: "Email and password",
      credentials: {
        email: {},
        password: {}
      },
      authorize: async (rawCredentials) => {
        const parsed = signInSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email }
        });

        if (!user?.passwordHash) {
          return null;
        }

        const matches = await compare(parsed.data.password, user.passwordHash);
        if (!matches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      return mergeUserIdIntoToken(token, user);
    },
    session: async ({ session, token }) => {
      return mergeTokenIdIntoSession(session, token);
    }
  }
});
