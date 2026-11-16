import { test, expect } from "@playwright/test";
import { mockMemoryPhotos, openActivity, savedProgress } from "./helpers";
test("online photos load before the preview and groups show appropriate animals and credits", async ({
  page,
}) => {
  await mockMemoryPhotos(page);
  await page.goto("/");
  await openActivity(page, "Animal memory pairs");
  await page.getByRole("button", { name: "Wild animals", exact: true }).click();
  await expect(page.getByText("10 animals in this group", { exact: true })).toBeVisible();
  await expect(page.getByTestId("online-memory-photo")).toHaveCount(4);
  const labels = await page
    .getByRole("button", { name: /^Open .* card/ })
    .evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label")!));
  expect(labels).toHaveLength(4);
  const allowed = new Set([
    "Elephant",
    "Lion",
    "Tiger",
    "Zebra",
    "Giraffe",
    "Panda",
    "Koala",
    "Kangaroo",
    "Fox",
    "Bear",
  ]);
  for (const label of labels) expect(allowed.has(label.match(/^Open (.+) card/)![1])).toBe(true);
  await page.getByRole("button", { name: "Photo credits", exact: true }).click();
  await expect(
    page.getByText(
      "Photos from Wikimedia Commons, resized for these cards. Original licenses apply.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /^Hidden card/ })).toHaveCount(4);
});
test("failed photos have readable fallbacks and retry preserves an earned pair", async ({
  page,
}) => {
  const pattern = /https:\/\/(?:thumb|upload)\.wikimedia\.org\//;
  await page.route(pattern, (route) => route.abort());
  await page.goto("/");
  await openActivity(page, "Animal memory pairs");
  await page.getByRole("button", { name: "Water animals", exact: true }).click();
  await expect(page.getByText("Photo unavailable", { exact: true })).toHaveCount(4);
  const labels = await page
    .getByRole("button", { name: /^Open .* card/ })
    .evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label")!));
  const name = labels
    .map((label) => label.match(/^Open (.+) card/)![1])
    .find((word) => word !== "Fish")!;
  const ids = labels
    .filter((label) => label.includes(`Open ${name} card`))
    .map((label) => Number(label.match(/card (\d+)$/)![1]));
  await expect(page.getByRole("button", { name: /^Hidden card/ })).toHaveCount(4);
  for (const id of ids)
    await page.getByRole("button", { name: `Hidden card ${id}`, exact: true }).click();
  await expect.poll(async () => (await savedProgress(page))?.stars).toBe(1);
  expect((await savedProgress(page)).stickers).toEqual([]);
  await page.unroute(pattern);
  await mockMemoryPhotos(page);
  await page.getByRole("button", { name: "Retry photos", exact: true }).click();
  await expect(page.getByTestId("online-memory-photo")).toHaveCount(4);
  await expect(page.getByText("Pairs found: 1 of 2", { exact: true })).toBeVisible();
  expect((await savedProgress(page)).stars).toBe(1);
});
