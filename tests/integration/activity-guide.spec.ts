import { test, expect } from "@playwright/test";
import { activities } from "../../data/activities";
import { openActivity, savedProgress } from "./helpers";
test("all options have introductions, replay/mute and launch controls", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { introductions: string[] }).introductions = [];
    speechSynthesis.speak = (utterance) => {
      (window as unknown as { introductions: string[] }).introductions.push(utterance.text);
    };
  });
  await page.goto("/");
  await openActivity(page, "Play and learn");
  await page.getByRole("button", { name: "All options", exact: true }).click();
  for (const activity of activities.filter((item) => item.id !== "guide"))
    await expect(
      page.getByRole("button", { name: `Introduction to ${activity.title}`, exact: true }),
    ).toHaveCount(1);
  await page.getByRole("button", { name: "Introduction to Paint Studio", exact: true }).click();
  await expect(page.getByText("Draw on your own page!", { exact: false })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { introductions: string[] }).introductions.length),
    )
    .toBe(1);
  await page
    .getByRole("button", { name: "Replay introduction to Paint Studio", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { introductions: string[] }).introductions.length),
    )
    .toBe(2);
  await page.getByRole("button", { name: "Close activity introduction", exact: true }).click();
  await page.getByRole("switch", { name: "Spoken introductions", exact: true }).click();
  await page
    .getByRole("button", { name: "Introduction to Balloons and kites", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Replay introduction to Balloons and kites", exact: true }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => (window as unknown as { introductions: string[] }).introductions.length,
    ),
  ).toBe(2);
  await page.getByRole("button", { name: "Start Balloons and kites", exact: true }).click();
  await expect(page.getByText("Balloons popped: 0", { exact: true })).toBeVisible();
  expect((await savedProgress(page))?.stars ?? 0).toBe(0);
});
test("surprise chooser explains a child-friendly game before launching", async ({ page }) => {
  await page.goto("/");
  await openActivity(page, "Play and learn");
  await page.getByRole("switch", { name: "Spoken introductions", exact: true }).click();
  await page.getByRole("button", { name: "Pick a game for me", exact: true }).click();
  const launch = page.getByRole("button", { name: /^Start / });
  const first = await launch.getAttribute("aria-label");
  expect(first).not.toContain("backup");
  expect(first).not.toContain("Advanced");
  await page.getByRole("button", { name: "Close activity introduction", exact: true }).click();
  await page.getByRole("button", { name: "Pick a game for me", exact: true }).click();
  expect(await launch.getAttribute("aria-label")).not.toBe(first);
  await launch.click();
  await expect(
    page.getByRole("button", { name: "Close activity introduction", exact: true }),
  ).toBeHidden();
});
test("alphabet home has no activity shortcuts and every activity stays in the side menu", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("switch", { name: "Alphabet sound", exact: true })).toBeVisible();
  await expect(page.getByText("Choose a letter A–Z", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show more activities", exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "🎉 Play and learn · How to play", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "🖌 Paint Studio", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Open activity menu", exact: true }).click();
  for (const activity of activities)
    await expect(
      page.getByRole("button", { name: `Open ${activity.title}`, exact: true }),
    ).toHaveCount(1);
  await page.getByRole("button", { name: "Open Play and learn", exact: true }).click();
  await expect(page.getByRole("button", { name: "Close menu", exact: true })).toBeHidden();
  await expect(page.getByRole("button", { name: "Pick a game for me", exact: true })).toBeVisible();
});
