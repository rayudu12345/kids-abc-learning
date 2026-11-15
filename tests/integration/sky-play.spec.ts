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
  const speed = page.getByRole("switch", { name: "Gentle flying speed", exact: true });
  await expect(speed).toBeChecked();
  await speed.click();
  await expect(speed).not.toBeChecked();
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
  await page.getByRole("button", { name: "🌈 Start again", exact: true }).click();
  await expect(page.getByText("Kite taps: 0", { exact: true })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Balloon and kite sounds" })).not.toBeChecked();
  await expect(speed).not.toBeChecked();
  await page.getByRole("button", { name: "🪁 Kites", exact: true }).click();
  await expect(page.getByText("Kite taps: 0", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "🎈 Balloons", exact: true }).click();
  await expect(page.getByText("Balloons popped: 0", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "▶ Resume flying", exact: true }).click();
  await expect(page.getByRole("button", { name: "⏸ Pause flying", exact: true })).toBeVisible();
  await openActivity(page, "Find the letter");
  await openActivity(page, "Balloons and kites");
  await expect(page.getByText("Balloons popped: 0", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("device reduced motion keeps toys still and responds to preference changes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await openActivity(page, "Balloons and kites");
  await expect(page.getByText("🌼 Still play", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "⏸ Pause flying", exact: true })).toBeHidden();
  const target = page.getByRole("button", { name: "Pop balloon B", exact: true });
  const initial = await target.boundingBox();
  await page.waitForTimeout(450);
  expect(await target.boundingBox()).toEqual(initial);
  await target.click();
  await expect(page.getByText("Balloons popped: 1", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "🌈 Start again", exact: true }).click();
  await expect(page.getByText("Balloons popped: 0", { exact: true })).toBeVisible();
  await expect(target).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.getByRole("button", { name: "⏸ Pause flying", exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByText("🌼 Still play", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "🪁 Kites", exact: true }).click();
  await page.getByRole("button", { name: "Tap kite 2", exact: true }).click();
  await expect(page.getByText("Kite taps: 1", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
