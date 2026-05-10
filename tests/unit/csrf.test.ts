import { describe, expect, it } from "vitest";

import { isValidCsrfToken } from "../../src/lib/csrf";

describe("csrf helpers", () => {
  it("accept matching cookie and form tokens", () => {
    expect(isValidCsrfToken("token-123", "token-123")).toBe(true);
  });

  it("reject missing or mismatched tokens", () => {
    expect(isValidCsrfToken("", "token-123")).toBe(false);
    expect(isValidCsrfToken("token-123", "")).toBe(false);
    expect(isValidCsrfToken("token-123", "token-456")).toBe(false);
  });
});
