import { test, expect } from "@playwright/test";
import { openActivity, savedProgress } from "./helpers";
test("coloring supports painting, brushes, undo, reversible clear and animal drafts", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await openActivity(page, "Coloring animals");
  await page.getByRole("button", { name: "Paint Blue", exact: true }).click();
  await page.getByRole("button", { name: "Big brush", exact: true }).click();
  const canvas = page.getByLabel("Coloring canvas for Cat. Paint with your finger.", {
    exact: true,
  });
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.45);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.6, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => page.getByTestId("paint-dot").count()).toBeGreaterThan(2);
  const count = await page.getByTestId("paint-dot").count();
  await expect(page.getByTestId("paint-dot").first()).toHaveCSS(
    "background-color",
    "rgb(57, 143, 209)",
  );
  await page.getByRole("button", { name: "Paint Eraser", exact: true }).click();
  await canvas.scrollIntoViewIfNeeded();
  const eraseBox = (await canvas.boundingBox())!;
  await page.mouse.click(eraseBox.x + eraseBox.width * 0.5, eraseBox.y + eraseBox.height * 0.5);
  await expect(page.getByTestId("paint-dot").last()).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
  await expect(page.getByTestId("paint-dot")).toHaveCount(count);
  await page.getByRole("button", { name: "Clear picture", exact: true }).click();
  await expect(page.getByTestId("paint-dot")).toHaveCount(0);
  await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
  await expect(page.getByTestId("paint-dot")).toHaveCount(count);
  await page.getByRole("button", { name: "Color Dog", exact: true }).click();
  await expect(page.getByTestId("paint-dot")).toHaveCount(0);
  await page.getByRole("button", { name: "Color Cat", exact: true }).click();
  await expect(page.getByTestId("paint-dot")).toHaveCount(count);
  await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
  await expect(page.getByTestId("paint-dot")).toHaveCount(0);
  expect((await savedProgress(page))?.stars ?? 0).toBe(0);
  expect(errors).toEqual([]);
});
