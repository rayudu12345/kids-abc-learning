import { test, expect, Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { openActivity, savedProgress } from "./helpers";
import { STUDIO_KEY } from "../../studioLogic";
import { PROGRESS_STORAGE_KEY } from "../../progressPersistence";
const canvas = (page: Page) =>
  page.getByLabel("Paint Studio canvas. Draw with your finger.", { exact: true });
const marks = (page: Page) => canvas(page).locator("svg > g");
async function draw(page: Page, from = [0.2, 0.25], to = [0.7, 0.7]) {
  await canvas(page).scrollIntoViewIfNeeded();
  const box = (await canvas(page).boundingBox())!;
  await page.mouse.move(box.x + box.width * from[0], box.y + box.height * from[1]);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * to[0], box.y + box.height * to[1], { steps: 8 });
  await page.mouse.up();
}
async function tapCanvas(page: Page, x: number, y: number) {
  await canvas(page).scrollIntoViewIfNeeded();
  const box = (await canvas(page).boundingBox())!;
  await page.mouse.click(box.x + box.width * x, box.y + box.height * y);
}
test("Paint Studio shapes, fill, eraser, undo/redo and autosaved return", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await openActivity(page, "Paint Studio");
  await page.getByRole("button", { name: "Use rectangle tool", exact: true }).click();
  await draw(page);
  await expect(marks(page)).toHaveCount(1);
  await page.getByRole("button", { name: "Studio color Blue", exact: true }).click();
  await page.getByRole("button", { name: "Use fill tool", exact: true }).click();
  await tapCanvas(page, 0.4, 0.4);
  await expect(marks(page).locator("rect")).toHaveAttribute("fill", "#398FD1");
  await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
  await expect(marks(page).locator("rect")).toHaveAttribute("fill", "none");
  await page.getByRole("button", { name: "↷ Redo", exact: true }).click();
  await expect(marks(page).locator("rect")).toHaveAttribute("fill", "#398FD1");
  await page.getByRole("button", { name: "Use eraser tool", exact: true }).click();
  await draw(page, [0.3, 0.3], [0.6, 0.6]);
  await page.getByRole("button", { name: "Studio color Yellow", exact: true }).click();
  await page.getByRole("button", { name: "Paint page color", exact: true }).click();
  await expect(marks(page).last().locator("polyline")).toHaveAttribute("stroke", "#F6C744");
  await page.getByRole("button", { name: "Clear page", exact: true }).click();
  await expect(marks(page)).toHaveCount(0);
  await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
  await expect(marks(page)).toHaveCount(2);
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) ?? "null")?.marks.length,
        STUDIO_KEY,
      ),
    )
    .toBe(2);
  await page.reload();
  await openActivity(page, "Paint Studio");
  await expect(marks(page)).toHaveCount(2);
  expect((await savedProgress(page))?.stars ?? 0).toBe(0);
  await openActivity(page, "Coloring animals");
  await page.getByRole("button", { name: "🖌 Open Paint Studio", exact: true }).click();
  await expect(marks(page)).toHaveCount(2);
  expect(errors).toEqual([]);
});
test("Paint Studio exports PNG and SVG and preserves artwork if PNG export fails", async ({
  page,
}) => {
  await page.goto("/");
  await openActivity(page, "Paint Studio");
  await draw(page);
  const pngEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "💾 Save PNG picture", exact: true }).click();
  const png = await pngEvent;
  expect(png.suggestedFilename()).toMatch(/\.png$/);
  const bytes = await readFile((await png.path())!);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  const svgEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save SVG picture", exact: true }).click();
  const svg = await svgEvent;
  const text = await readFile((await svg.path())!, "utf8");
  expect(text).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
  expect(text).toContain("<polyline");
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.getByRole("button", { name: "💾 Save PNG picture", exact: true }).click();
  await expect(
    page.getByText("PNG export is unavailable in this browser.", { exact: true }),
  ).toBeVisible();
  await expect(marks(page)).toHaveCount(1);
});
test("paint read and write failures preserve stored picture and learning progress until retry", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, progressKey }) => {
      const originalGet = Storage.prototype.getItem,
        originalSet = Storage.prototype.setItem;
      originalSet.call(
        localStorage,
        key,
        JSON.stringify({ version: 1, background: "#398FD1", marks: [] }),
      );
      originalSet.call(
        localStorage,
        progressKey,
        JSON.stringify({
          version: 1,
          stars: 9,
          stickers: ["C"],
          completed: { letters: 1, matching: 1 },
        }),
      );
      const flags = window as unknown as { paintReadFails: boolean; paintWriteFails: boolean };
      flags.paintReadFails = true;
      flags.paintWriteFails = false;
      Storage.prototype.getItem = function (name) {
        if (name === key && flags.paintReadFails) throw new Error("read failed");
        return originalGet.call(this, name);
      };
      Storage.prototype.setItem = function (name, value) {
        if (name === key && flags.paintWriteFails) throw new Error("write failed");
        return originalSet.call(this, name, value);
      };
    },
    { key: STUDIO_KEY, progressKey: PROGRESS_STORAGE_KEY },
  );
  await page.goto("/");
  await openActivity(page, "Paint Studio");
  await expect(
    page.getByText("We could not open your saved picture. It has been kept unchanged.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(canvas(page)).toBeHidden();
  await page.evaluate(() => {
    const flags = window as unknown as { paintReadFails: boolean; paintWriteFails: boolean };
    flags.paintReadFails = false;
    flags.paintWriteFails = true;
  });
  await page.getByRole("button", { name: "Retry opening picture", exact: true }).click();
  await draw(page);
  await expect(
    page.getByText("Picture could not save. Keep this page open and retry.", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).marks.length, STUDIO_KEY),
  ).toBe(0);
  expect((await savedProgress(page)).stars).toBe(9);
  await page.evaluate(() => {
    (window as unknown as { paintWriteFails: boolean }).paintWriteFails = false;
  });
  await page.getByRole("button", { name: "Retry saving picture", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).marks.length, STUDIO_KEY),
    )
    .toBe(1);
  expect((await savedProgress(page)).stars).toBe(9);
});
