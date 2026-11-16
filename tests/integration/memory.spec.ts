import { test, expect } from "@playwright/test";
import { openActivity, savedProgress, mockMemoryPhotos } from "./helpers";
test.beforeEach(async ({ page }) => {
  await mockMemoryPhotos(page);
});
test("memory pairs support previews, retries, saved rewards, replay and levels", async ({
  page,
}) => {
  await page.goto("/");
  await openActivity(page, "Animal memory pairs");
  const labels = await page.getByRole("button", { name: /^Open .* card/ }).allTextContents();
  expect(labels.length).toBe(4);
  const cards = await page
    .getByRole("button", { name: /^Open .* card/ })
    .evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label")!));
  const entries = cards.map((label) => ({
    animal: label.match(/^Open (.+) card/)![1],
    id: Number(label.match(/card (\d+)$/)![1]),
  }));
  await expect(page.getByRole("button", { name: /^Hidden card/ })).toHaveCount(4);
  const first = entries[0],
    wrong = entries.find((entry) => entry.animal !== first.animal)!;
  await page.getByRole("button", { name: `Hidden card ${first.id}`, exact: true }).click();
  await page.getByRole("button", { name: `Hidden card ${wrong.id}`, exact: true }).click();
  await expect(
    page.getByText("Different friends! They will turn back. Try again!", { exact: true }),
  ).toBeVisible();
  expect((await savedProgress(page))?.stars ?? 0).toBe(0);
  await expect(page.getByRole("button", { name: /^Hidden card/ })).toHaveCount(4);
  for (const name of new Set(entries.map((entry) => entry.animal))) {
    for (const card of entries.filter((entry) => entry.animal === name))
      await page.getByRole("button", { name: `Hidden card ${card.id}`, exact: true }).click();
  }
  await expect(
    page.getByText("All pairs found! Your stars are saved! ⭐", { exact: true }),
  ).toBeVisible();
  await expect.poll(async () => (await savedProgress(page))?.stars).toBe(2);
  expect((await savedProgress(page)).completed.matching).toBe(1);
  await page.getByRole("button", { name: "4 pairs", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Open .* card/ })).toHaveCount(8);
  expect((await savedProgress(page)).stars).toBe(2);
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "3 pairs", exact: true }).click();
  await page.waitForTimeout(1500);
  await expect(page.getByRole("button", { name: /^Open .* card/ })).toHaveCount(6);
  await expect(page.getByRole("button", { name: /^Hidden card/ })).toHaveCount(6);
});
