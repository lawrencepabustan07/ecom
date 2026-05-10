import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

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
