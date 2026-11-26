import { test, expect, Page } from "@playwright/test";
import { openActivity, savedProgress } from "./helpers";
async function choose(page: Page, piece: number) {
  const name = (await page.getByTestId("puzzle-animal").textContent())!;
  await page.getByRole("button", { name: `Choose ${name} piece ${piece}`, exact: true }).click();
}
async function slot(page: Page, piece: number) {
  await page.getByRole("button", { name: new RegExp(`^Puzzle space ${piece}:`) }).click();
}
test("puzzle hints, tap placement, progression and saved rewards", async ({ page }) => {
  await page.goto("/");
  await openActivity(page, "Animal picture puzzles");
  await choose(page, 1);
  await slot(page, 2);
  await expect(page.getByText("Try the highlighted space:", { exact: false })).toBeVisible();
  expect((await savedProgress(page))?.stars ?? 0).toBe(0);
  await slot(page, 1);
  await choose(page, 2);
  await slot(page, 2);
  await expect(
    page.getByText("Beautiful picture! One saved star! ⭐", { exact: true }),
  ).toBeVisible();
  await expect.poll(async () => (await savedProgress(page))?.stars).toBe(1);
  for (const picture of [2, 3]) {
    await expect(page.getByText(`Picture ${picture} of 3`, { exact: false })).toBeVisible();
    for (const piece of [1, 2]) {
      await choose(page, piece);
      await slot(page, piece);
    }
  }
  await expect(
    page.getByText("Three pictures built! Your three stars are saved! ⭐", { exact: true }),
  ).toBeVisible();
  await expect.poll(async () => (await savedProgress(page))?.stars).toBe(3);
  expect((await savedProgress(page)).completed.matching).toBe(1);
  await page.reload();
  expect((await savedProgress(page)).stars).toBe(3);
});
test("four-piece level, picture hint and safe exit", async ({ page }) => {
  await page.goto("/");
  await openActivity(page, "Animal picture puzzles");
  await page.getByRole("button", { name: "4 pieces", exact: true }).click();
  await page.getByRole("button", { name: "Show whole picture", exact: true }).click();
  await expect(page.getByRole("button", { name: "Hide whole picture", exact: true })).toBeVisible();
  for (const piece of [1, 2, 3, 4]) {
    await choose(page, piece);
    await slot(page, piece);
  }
  await expect.poll(async () => (await savedProgress(page))?.stars).toBe(1);
  await openActivity(page, "Play and learn");
  await expect(page.getByRole("button", { name: "Pick a game for me", exact: true })).toBeVisible();
  await page.waitForTimeout(2800);
  expect((await savedProgress(page)).stars).toBe(1);
});
test("a picture piece can be dragged into its matching space", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await openActivity(page, "Animal picture puzzles");
  const name = (await page.getByTestId("puzzle-animal").textContent())!;
  const source = page.getByRole("button", { name: `Choose ${name} piece 1`, exact: true });
  await source.scrollIntoViewIfNeeded();
  const target = page.getByRole("button", { name: /^Puzzle space 1:/ });
  const from = (await source.boundingBox())!,
    to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 15 });
  await page.mouse.up();
  await expect(source).toBeDisabled();
  await expect(page.getByText("Pieces 1 of 2", { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});
