import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { openActivity, traceOutline, savedProgress } from "./helpers";
import { createBackup } from "../../backupLogic";
import { emptyProgress } from "../../progressLogic";
import { PROGRESS_STORAGE_KEY } from "../../progressPersistence";
const errors = new WeakMap<object, string[]>();
test.beforeEach(async ({ page }) => {
  const list: string[] = [];
  errors.set(page, list);
  page.on("pageerror", (error) => list.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});
test("offline human recordings play and realistic animal poses change", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    (window as unknown as { played: string[] }).played = [];
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { played: string[] }).played.push(this.currentSrc || this.src);
      return original.call(this);
    };
  });
  await page.goto("/");
  await openActivity(page, "Listen and explore");
  await page.getByRole("button", { name: "Hear letter A", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { played: string[] }).played.some((url) => url.includes("letter-A")),
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Dog bark 🐶", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { played: string[] }).played.some((url) => url.includes("sound-dog")),
      ),
    )
    .toBe(true);
  await openActivity(page, "Find the letter");
  const frame = page.getByTestId("animal-motion-frame").first();
  await expect(frame).toBeVisible();
  const initial = await frame
    .locator("img")
    .evaluate((image) => getComputedStyle(image.parentElement!).left);
  await expect
    .poll(() =>
      frame.locator("img").evaluate((image) => getComputedStyle(image.parentElement!).left),
    )
    .not.toBe(initial);
});
test("phonics uses small groups, allows retries and saves learned sounds", async ({ page }) => {
  await page.goto("/");
  await openActivity(page, "Letter sounds");
  await page.getByRole("button", { name: "🐍\nSnake", exact: true }).click();
  await expect(
    page.getByText("Try Monkey. Hear its first sound again.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "🐵\nMonkey", exact: true }).click();
  await expect(page.getByText("Sound 2 of 6", { exact: true })).toBeVisible();
  await expect.poll(async () => (await savedProgress(page))?.learnedPhonics).toEqual(["M"]);
});
test("lowercase tracing saves separately and survives restart", async ({ page }) => {
  await page.goto("/");
  await openActivity(page, "Trace lowercase a–z");
  await traceOutline(page, "a");
  await expect(page.getByText("Let's trace b", { exact: true })).toBeVisible();
  await page.reload();
  await openActivity(page, "My sticker book");
  await expect(page.getByText("Lowercase traced: 1 / 26", { exact: true })).toBeVisible();
  await expect(page.getByText("Traced letters: 0 / 26", { exact: true })).toBeVisible();
});
test("counting prevents duplicate taps and awards only after every animal is counted", async ({
  page,
}) => {
  await page.goto("/");
  await openActivity(page, "Numbers and counting");
  await page.getByRole("button", { name: "Practice number 3", exact: true }).click();
  const first = page.getByRole("button", { name: /^Count .+ 1$/ });
  await first.click();
  await expect(first).toBeDisabled();
  await expect(page.getByText("Counted 1 of 3", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Answer 3", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: /^Count .+ 2$/ }).click();
  await page.getByRole("button", { name: /^Count .+ 3$/ }).click();
  await page.getByRole("button", { name: "Answer 3", exact: true }).click();
  await expect(page.getByText("Counted 0 of 4", { exact: true })).toBeVisible();
  await expect.poll(async () => (await savedProgress(page))?.practicedNumbers).toEqual(["3"]);
});
test("colors and shapes support tap alternatives and a real drag", async ({ page }) => {
  await page.goto("/");
  await openActivity(page, "Colors and shapes");
  await page.getByRole("button", { name: "Select Red", exact: true }).click();
  await page.getByRole("button", { name: "Match Blue", exact: true }).click();
  await expect(
    page.getByText("Try the matching red tile. Look at its name and symbol.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Match Red", exact: true }).click();
  await expect.poll(async () => (await savedProgress(page))?.practicedColors).toEqual(["red"]);
  await page.getByRole("button", { name: "🔷 Shapes", exact: true }).click();
  const from = page.getByRole("button", { name: "Select Circle", exact: true }),
    to = page.getByRole("button", { name: "Match Circle", exact: true });
  await from.scrollIntoViewIfNeeded();
  await to.scrollIntoViewIfNeeded();
  const a = (await from.boundingBox())!,
    b = (await to.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 15 });
  await page.mouse.up();
  await expect.poll(async () => (await savedProgress(page))?.practicedShapes).toEqual(["circle"]);
});
test("backup export, validation, preview, cancellation and failed restore preserve progress", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(({ key, progress }) => localStorage.setItem(key, JSON.stringify(progress)), {
    key: PROGRESS_STORAGE_KEY,
    progress: { ...emptyProgress(), stars: 7 },
  });
  await page.reload();
  await openActivity(page, "Progress backup");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress backup", exact: true }).click();
  const download = await downloadPromise;
  const text = await readFile((await download.path())!, "utf8");
  expect(JSON.parse(text).progress.stars).toBe(7);
  async function choose(text: string) {
    const chooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Choose backup to restore", exact: true }).click();
    await (
      await chooserPromise
    ).setFiles({ name: "progress.json", mimeType: "application/json", buffer: Buffer.from(text) });
  }
  await choose("{broken");
  await expect(page.getByText(/This is not a valid JSON backup/)).toBeVisible();
  expect((await savedProgress(page)).stars).toBe(7);
  const backup = createBackup({ ...emptyProgress(), stars: 99, tracedLowercase: ["a"] });
  await choose(backup);
  await expect(page.getByText("Backup preview", { exact: true })).toBeVisible();
  expect((await savedProgress(page)).stars).toBe(7);
  await page.getByRole("button", { name: "Cancel restore", exact: true }).click();
  expect((await savedProgress(page)).stars).toBe(7);
  await choose(backup);
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem;
    let once = true;
    Storage.prototype.setItem = function (name, value) {
      if (name === key && once) {
        once = false;
        throw new Error("Test restore write failure");
      }
      return original.call(this, name, value);
    };
  }, PROGRESS_STORAGE_KEY);
  await page
    .getByRole("button", { name: "Confirm: replace current progress", exact: true })
    .click();
  await expect(
    page.getByText("Restore failed. Current progress has been kept. Please try again.", {
      exact: true,
    }),
  ).toBeVisible();
  expect((await savedProgress(page)).stars).toBe(7);
  await page
    .getByRole("button", { name: "Confirm: replace current progress", exact: true })
    .click();
  await expect(
    page.getByText("Backup restored successfully. Your progress is now saved on this device.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await openActivity(page, "My sticker book");
  await expect(page.getByText("⭐ 99 stars earned", { exact: true })).toBeVisible();
  await expect(page.getByText("Lowercase traced: 1 / 26", { exact: true })).toBeVisible();
});
