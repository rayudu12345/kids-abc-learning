import { test, expect } from "@playwright/test";
import { openActivity } from "./helpers";
test("balloons pop, kites sparkle, sound mutes and session resets", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    (window as unknown as { played: string[] }).played = [];
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { played: string[] }).played.push(this.currentSrc || this.src);
      return original.call(this);
    };
  });
  const played = () => page.evaluate(() => (window as unknown as { played: string[] }).played);
  await page.goto("/");
  await openActivity(page, "Balloons and kites");
  await page.getByRole("button", { name: "⏸ Pause flying", exact: true }).click();
  await page.getByRole("button", { name: "Pop balloon B", exact: true }).click();
  await expect(page.getByText("Balloons popped: 1", { exact: true })).toBeVisible();
  await expect(page.getByText("POP! ⭐", { exact: true })).toBeVisible();
  await expect.poll(async () => (await played()).some((url) => url.includes("pop"))).toBe(true);
  await page.getByRole("button", { name: "🪁 Kites", exact: true }).click();
  await page.getByRole("button", { name: "Tap kite 2", exact: true }).click();
  await expect(page.getByText("Kite taps: 1", { exact: true })).toBeVisible();
  await expect.poll(async () => (await played()).some((url) => url.includes("kite"))).toBe(true);
  await page.getByRole("switch", { name: "Balloon and kite sounds" }).click();
  const before = (await played()).length;
  await page.getByRole("button", { name: "Tap kite 1", exact: true }).click();
  await expect(page.getByText("Kite taps: 2", { exact: true })).toBeVisible();
  expect((await played()).length).toBe(before);
  await page.getByRole("button", { name: "▶ Resume flying", exact: true }).click();
  await expect(page.getByRole("button", { name: "⏸ Pause flying", exact: true })).toBeVisible();
  await openActivity(page, "Find the letter");
  await openActivity(page, "Balloons and kites");
  await expect(page.getByText("Balloons popped: 0", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
