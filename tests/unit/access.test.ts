import { describe, expect, it } from "vitest";

import { getDashboardPathForRole, isAdminRole } from "../../src/lib/access";

describe("access helpers", () => {
  it("recognize admin users", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("customer")).toBe(false);
  });

  it("resolve dashboard paths by role", () => {
    expect(getDashboardPathForRole("admin")).toBe("/admin");
    expect(getDashboardPathForRole("customer")).toBe("/account");
    expect(getDashboardPathForRole()).toBe("/account");
  });
});
