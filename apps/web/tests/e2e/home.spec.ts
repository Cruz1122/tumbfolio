import { expect, test } from "@playwright/test";

test("home renders hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Notebooks entran, presentaciones salen" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Subir/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver colección/ })).toBeVisible();
  await expect(page.locator('input[type="file"]')).toBeAttached();
});
