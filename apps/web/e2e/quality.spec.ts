import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("primary pages have no automatically detectable WCAG A or AA violations", async ({
  page,
}) => {
  for (const path of ["/", "/reservar"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      results.violations
        .map((violation) => `${violation.id}: ${violation.help}`)
        .join("\n"),
    ).toEqual([]);
  }
});

test("critical journeys do not emit browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu principal" }).click();
  await page.getByRole("link", { name: "Marcar" }).click();
  await expect(
    page.getByRole("heading", { name: "Tempo para ti." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("keyboard users can skip navigation and close the menu", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Saltar para o conteúdo" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.getByRole("button", { name: "Abrir menu principal" }).click();
  await expect(
    page.getByRole("dialog", { name: "Menu principal" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Menu principal" }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Abrir menu principal" }),
  ).toBeFocused();
});

test.describe("with reduced motion", () => {
  test("decorative motion is disabled without hiding content", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    ).toBe(true);
    await expect(page.locator("[data-reveal]").first()).toHaveCSS(
      "opacity",
      "1",
    );

    await page.getByRole("button", { name: "Abrir menu principal" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu principal" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("transform", "none");
  });
});
