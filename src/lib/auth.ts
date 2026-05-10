import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { mergeTokenIdIntoSession, mergeUserIdIntoToken } from "./auth-helpers";
import { isGoogleAuthConfigured } from "./env";
import { prisma } from "./prisma";
import { signInSchema } from "./validations";

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
          image: user.image,
          role: user.role
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
