import { test, expect } from "@playwright/test";
import { openActivity, savedProgress } from "./helpers";
test("eggs require three taps, reveal an animal once and advance", async ({ page }) => {
  await page.goto("/");
  await openActivity(page, "Surprise eggs");
  await page.getByRole("switch", { name: "Surprise egg sounds", exact: true }).click();
  await page.getByRole("button", { name: "Tap surprise egg. 0 of 3 taps.", exact: true }).click();
  await page.getByRole("button", { name: "Tap surprise egg. 1 of 3 taps.", exact: true }).click();
  expect((await savedProgress(page))?.stars ?? 0).toBe(0);
  await page.getByRole("button", { name: "Tap surprise egg. 2 of 3 taps.", exact: true }).click();
  await expect(page.getByText(/^[CDEFLPRZ] is for/)).toBeVisible();
  await expect.poll(async () => (await savedProgress(page))?.stars).toBe(1);
  await expect(
    page.getByRole("button", { name: "🔊 Hear the surprise", exact: true }),
  ).toBeDisabled();
  await expect(page.getByText("Egg 2 of 8", { exact: true })).toBeVisible();
  expect((await savedProgress(page)).stars).toBe(1);
  await page.getByRole("button", { name: "Tap surprise egg. 0 of 3 taps.", exact: true }).click();
  await openActivity(page, "Alphabet A–Z");
  await openActivity(page, "Surprise eggs");
  await expect(page.getByText("Egg 1 of 8", { exact: true })).toBeVisible();
  expect((await savedProgress(page)).stars).toBe(1);
});

test("all eggs award once despite rapid taps and next presses", async ({ page }) => {
  await page.goto("/");
  await openActivity(page, "Surprise eggs");
  for (let index = 1; index <= 8; index++) {
    await expect(page.getByText(`Egg ${index} of 8`, { exact: true })).toBeVisible();
    for (let tap = 0; tap < 3; tap++)
      await page.getByRole("button", { name: /^Tap surprise egg/ }).click();
    await expect.poll(async () => (await savedProgress(page))?.stars).toBe(index);
    await page.getByRole("button", { name: "Next surprise", exact: true }).evaluate((button) => {
      (button as HTMLElement).click();
      (button as HTMLElement).click();
    });
  }
  await expect(
    page.getByText("Eight animal surprises! Your stars are saved! ⭐", { exact: true }),
  ).toBeVisible();
  expect((await savedProgress(page)).completed.letters).toBe(1);
  expect((await savedProgress(page)).stickers).toHaveLength(8);
});
