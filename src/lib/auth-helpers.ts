import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export function mergeUserIdIntoToken(token: JWT, user?: { id?: string; role?: string | null }) {
  if (user?.id) {
    token.sub = user.id;
  }

  if (user?.role) {
    token.role = user.role;
  }

  return token;
}

export function mergeTokenIdIntoSession(session: Session, token: JWT) {
  if (session.user && token.sub) {
    session.user.id = token.sub;
  }

  if (session.user && typeof token.role === "string") {
    session.user.role = token.role;
  }

  return session;
}
