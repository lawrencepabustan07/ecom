import assert from "node:assert/strict";
import test from "node:test";

import { mergeTokenIdIntoSession, mergeUserIdIntoToken } from "@/lib/auth";

test("auth helpers persist the signed-in user id on the JWT subject", () => {
  assert.deepEqual(mergeUserIdIntoToken({}, { id: "user_123" }), { sub: "user_123" });
});

test("auth helpers expose the JWT subject on the session user", () => {
  assert.deepEqual(
    mergeTokenIdIntoSession(
      {
        expires: new Date("2026-05-10T00:00:00.000Z").toISOString(),
        user: {
          id: "",
          name: "Meridian Customer"
        }
      },
      { sub: "user_123" }
    ),
    {
      expires: new Date("2026-05-10T00:00:00.000Z").toISOString(),
      user: {
        id: "user_123",
        name: "Meridian Customer"
      }
    }
  );
});
