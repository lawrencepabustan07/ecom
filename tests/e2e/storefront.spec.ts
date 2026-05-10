import { test, expect } from "@playwright/test";

test("home page renders hero and catalog link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Quiet drama for the city after dark.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore Collection" })).toBeVisible();
});
