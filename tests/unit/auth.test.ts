import { describe, expect, it } from "vitest";

import { mergeTokenIdIntoSession, mergeUserIdIntoToken } from "../../src/lib/auth-helpers";

describe("auth helpers", () => {
  it("persist the signed-in user id on the JWT subject", () => {
    expect(mergeUserIdIntoToken({}, { id: "user_123", role: "admin", isBlocked: false })).toEqual({
      sub: "user_123",
      role: "admin",
      isBlocked: false
    });
  });

  it("leaves the token unchanged when no user id is present", () => {
    expect(mergeUserIdIntoToken({ sub: "existing" }, {})).toEqual({ sub: "existing" });
  });

  it("expose the JWT subject on the session user", () => {
    expect(
      mergeTokenIdIntoSession(
        {
          expires: new Date("2026-05-10T00:00:00.000Z").toISOString(),
          user: {
            id: "",
            role: "customer",
            isBlocked: false,
            name: "Meridian Customer"
          }
        },
        { sub: "user_123", role: "admin", isBlocked: true }
      )
    ).toEqual({
      expires: new Date("2026-05-10T00:00:00.000Z").toISOString(),
      user: {
        id: "user_123",
        role: "admin",
        isBlocked: true,
        name: "Meridian Customer"
      }
    });
  });

  it("leaves the session unchanged when the token subject is missing", () => {
    expect(
      mergeTokenIdIntoSession(
        {
          expires: new Date("2026-05-10T00:00:00.000Z").toISOString(),
          user: {
            id: "user_123",
            role: "customer",
            isBlocked: false,
            name: "Meridian Customer"
          }
        },
        {}
      )
    ).toEqual({
      expires: new Date("2026-05-10T00:00:00.000Z").toISOString(),
      user: {
        id: "user_123",
        role: "customer",
        isBlocked: false,
        name: "Meridian Customer"
      }
    });
  });
});
