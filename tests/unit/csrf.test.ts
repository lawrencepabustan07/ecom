import { describe, expect, it } from "vitest";

import { isAllowedCsrfOrigin } from "../../src/lib/csrf";

describe("csrf helpers", () => {
  it("accept matching origin and host", () => {
    expect(isAllowedCsrfOrigin("http://127.0.0.1:3000", "127.0.0.1:3000")).toBe(true);
  });

  it("reject missing or mismatched origins", () => {
    expect(isAllowedCsrfOrigin("", "127.0.0.1:3000")).toBe(false);
    expect(isAllowedCsrfOrigin("http://127.0.0.1:3000", "")).toBe(false);
    expect(isAllowedCsrfOrigin("http://evil.example", "127.0.0.1:3000")).toBe(false);
  });
});
