import { expect, test } from "@playwright/test";

test("visitor can start a booking", async ({ page }) => {
  await page.goto("/reservar");

  await page.getByText("Gel Natural", { exact: true }).click();
  await page.getByRole("button", { name: /Continuar/ }).click();

  await expect(
    page.getByRole("heading", { name: "Com quem queres marcar?" }),
  ).toBeVisible();
});

test("visitor can complete the demo booking flow", async ({ page }) => {
  await page.goto("/reservar");

  await page.getByText("Manicure Signature", { exact: true }).click();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByText("Inês Martins", { exact: true }).click();
  await page.getByRole("button", { name: /Continuar/ }).click();

  await page.locator('input[name="date"]').nth(1).locator("..").click();
  const firstTime = page.locator('input[name="time"]').first();
  await expect(firstTime).toBeAttached();
  await firstTime.locator("..").click();
  await page.getByRole("button", { name: /Continuar/ }).click();

  await page.getByLabel("Nome").fill("Rita");
  await page.getByLabel("Apelido").fill("Santos");
  await page.getByLabel("Email").fill("rita@example.test");
  await page.getByLabel("Telemóvel").fill("912345678");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirmar marcação" }).click();

  await expect(
    page.getByRole("heading", { name: "Está marcado." }),
  ).toBeVisible();
  await expect(page.getByText(/LM-/)).toBeVisible();
});

test("homepage has an accessible primary heading", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Arte à flor da pele." }),
  ).toBeVisible();
});
