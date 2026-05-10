import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export function mergeUserIdIntoToken(token: JWT, user?: { id?: string; role?: string | null; isBlocked?: boolean | null }) {
  if (user?.id) {
    token.sub = user.id;
  }

  if (user?.role) {
    token.role = user.role;
  }

  if (typeof user?.isBlocked === "boolean") {
    token.isBlocked = user.isBlocked;
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

  if (session.user) {
    session.user.isBlocked = Boolean(token.isBlocked);
  }

  return session;
}
