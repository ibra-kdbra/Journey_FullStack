import { test, expect } from "@playwright/test";

test("has title and navigation works", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Master Modern Development/i);

  // Check if some main technologies are visible
  await expect(page.getByText("Rust")).toBeVisible();
  await expect(page.getByText("Go")).toBeVisible();
});

test("can navigate to documentation", async ({ page }) => {
  await page.goto("/");

  // Click on a learning path
  await page.getByRole("link", { name: "Rust" }).first().click();

  // Expect to be on a documentation page
  await expect(page).toHaveURL(/\/docs\/courses\/rust\/lesson_0/);
});

test("auth pages are accessible", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.goto("/auth/sign-up");
  await expect(page.getByRole("heading", { name: "Sign Up" })).toBeVisible();
});
