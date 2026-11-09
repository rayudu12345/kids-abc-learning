import { expect, Page } from "@playwright/test";
import { animalTraces, letterTraces, sampledStrokes } from "../../traceCatalog";
import { PROGRESS_STORAGE_KEY } from "../../progressPersistence";
export async function openActivity(page: Page, title: string) {
  await page.getByRole("button", { name: "Open activity menu", exact: true }).click();
  await page.getByRole("button", { name: `Open ${title}`, exact: true }).click();
  await expect(page.getByRole("button", { name: "Close menu", exact: true })).toBeHidden();
}
export async function savedProgress(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
    PROGRESS_STORAGE_KEY,
  );
}
export async function traceOutline(page: Page, id: string) {
  const item = [...letterTraces, ...animalTraces].find((entry) => entry.id === id)!;
  const canvas = page.getByLabel(
    `Tracing canvas for ${item.name}. Follow the purple starting dot.`,
    { exact: true },
  );
  await canvas.scrollIntoViewIfNeeded();
  const strokes = sampledStrokes(item);
  for (let index = 0; index < strokes.length; index++) {
    const box = (await canvas.boundingBox())!;
    const scale = box.width / 300;
    const points = strokes[index];
    await page.mouse.move(box.x + points[0].x * scale, box.y + points[0].y * scale);
    await page.mouse.down();
    for (const point of points.slice(1))
      await page.mouse.move(box.x + point.x * scale, box.y + point.y * scale);
    await page.mouse.up();
    if (index < strokes.length - 1)
      await expect(page.getByText(new RegExp(`Stroke ${index + 2} of`))).toBeVisible();
  }
  await expect(
    page.getByText(`Wonderful! You traced ${item.name}! One saved star! ⭐`, { exact: true }),
  ).toBeVisible();
}
