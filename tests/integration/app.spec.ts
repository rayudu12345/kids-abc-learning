import { test, expect } from "@playwright/test";
import { openActivity, savedProgress, traceOutline } from "./helpers";
import { animals } from "../../quizLogic";
import { PROGRESS_STORAGE_KEY } from "../../progressPersistence";

const runtimeErrors = new WeakMap<object, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page)).toEqual([]);
});

test("all menu routes, sound controls and full-screen scenes work", async ({ page }) => {
  await page.goto("/");
  for (const title of [
    "Find the letter",
    "Match the animals",
    "Trace letters A–Z",
    "Draw animals",
    "Big & little letters",
    "Advanced Letters",
    "My sticker book",
    "Alphabet A–Z",
  ]) {
    await openActivity(page, title);
    await page.getByRole("button", { name: "Open activity menu", exact: true }).click();
    await expect(page.getByRole("button", { name: `Open ${title}`, exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await page.getByRole("button", { name: "Close menu", exact: true }).click();
  }
  await page
    .getByRole("button", { name: "C, Cat. Play animation and pronunciation", exact: true })
    .click();
  await page.getByRole("button", { name: "Show animation full screen", exact: true }).click();
  await expect(page.getByText("C is for Cat!", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "✕ Back to letters", exact: true }).click();
  await openActivity(page, "Advanced Letters");
  const sound = page.getByRole("switch", { name: "Spoken explanations", exact: true });
  await sound.click();
  await expect(sound).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "D, Dodecahedron", exact: true }).click();
  await page.getByRole("button", { name: "⛶ Make it BIG!", exact: true }).click();
  await expect(page.getByText("D is for Dodecahedron", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "✕ Back to Advanced Letters", exact: true }).click();
});

test("letter game gives hints, prevents duplicate answers, advances and saves five rewards", async ({
  page,
}) => {
  await page.goto("/");
  await openActivity(page, "Find the letter");
  for (let round = 0; round < 5; round++) {
    await expect(
      page.getByText(`Little adventure • ${round + 1} of 5`, { exact: true }),
    ).toBeVisible();
    const question = (await page.getByText(/^Find the letter [A-Z]$/).innerText()).trim();
    const letter = question.at(-1)!;
    if (round === 0) {
      const other = page
        .getByRole("button", { name: /^Letter [A-Z]$/ })
        .filter({ hasNotText: letter })
        .first();
      await other.click();
      await expect(
        page.getByText(`Let's try together! Tap ${letter} in the purple border.`, { exact: true }),
      ).toBeVisible();
    }
    const answer = page.getByRole("button", { name: `Letter ${letter}`, exact: true });
    await answer.click();
    await expect(answer).toBeDisabled();
    await expect.poll(async () => (await savedProgress(page))?.stars).toBe(round + 1);
  }
  await expect(
    page.getByText("You found five letters! Time for a little break?", { exact: true }),
  ).toBeVisible();
  await expect.poll(async () => (await savedProgress(page))?.completed.letters).toBe(1);
  await page.reload();
  await openActivity(page, "My sticker book");
  await expect(page.getByText("⭐ 5 stars earned", { exact: true })).toBeVisible();
});

test("lowercase matching gives a hint and automatically moves to a new pair", async ({ page }) => {
  await page.goto("/");
  await openActivity(page, "Big & little letters");
  const upper = await page.getByLabel(/^Uppercase [A-Z]$/).innerText();
  const wrong = page
    .getByRole("button", { name: /^Lowercase [A-Z]$/ })
    .filter({ hasNotText: upper.toLowerCase() })
    .first();
  await wrong.click();
  await expect(
    page.getByText(`Try ${upper.toLowerCase()} in the purple border. Take your time!`, {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: `Lowercase ${upper}`, exact: true }).click();
  await expect(page.getByText("Letter pair 2 of 5", { exact: true })).toBeVisible();
  await expect.poll(async () => (await savedProgress(page))?.stars).toBe(1);
});

test("animal game supports tap matching, dragging, hints and automatic next round", async ({
  page,
}) => {
  await page.goto("/");
  await openActivity(page, "Match the animals");
  const targets = page.getByRole("button", { name: /^Matching .+ picture$/ });
  const names = await targets.evaluateAll((elements) =>
    elements.map((element) =>
      element.getAttribute("aria-label")!.replace(/^Matching | picture$/g, ""),
    ),
  );
  const source = (name: string) =>
    page.getByRole("button", {
      name: `${name}. Select, then tap its matching picture.`,
      exact: true,
    });
  await source(names[0]).click();
  await page.getByRole("button", { name: `Matching ${names[1]} picture`, exact: true }).click();
  await expect(
    page.getByText(`Try the matching ${names[0].toLowerCase()} picture. You can do it!`, {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: `Matching ${names[0]} picture`, exact: true }).click();
  await page
    .getByText("Drag an animal down to its friend", { exact: true })
    .scrollIntoViewIfNeeded();
  const from = (await source(names[1]).boundingBox())!;
  const to = (await page
    .getByRole("button", { name: `Matching ${names[1]} picture`, exact: true })
    .boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 15 });
  await page.mouse.up();
  await expect.poll(async () => (await savedProgress(page))?.stars).toBe(2);
  await source(names[2]).click();
  await page.getByRole("button", { name: `Matching ${names[2]} picture`, exact: true }).click();
  await expect(page.getByText("Animal adventure 2 of 3", { exact: true })).toBeVisible();
});

test("multi-stroke tracing, animal selection and rewards survive reload", async ({ page }) => {
  await page.goto("/");
  await openActivity(page, "Trace letters A–Z");
  await traceOutline(page, "A");
  await expect(page.getByText("Let's trace B", { exact: true })).toBeVisible();
  await openActivity(page, "Draw animals");
  await expect(page.getByRole("button", { name: /^Trace / })).toHaveCount(24);
  await page.getByRole("button", { name: "Trace Dog", exact: true }).click();
  await traceOutline(page, "dog");
  await expect(page.getByText("🐘 Let's draw an elephant!", { exact: true })).toBeVisible();
  await page.reload();
  await openActivity(page, "My sticker book");
  await expect(page.getByText("Traced letters: 1 / 26", { exact: true })).toBeVisible();
  await expect(page.getByText("Animal outlines traced: 1 / 24", { exact: true })).toBeVisible();
  await expect(page.getByText("⭐ 2 stars earned", { exact: true })).toBeVisible();
});

test("failed reads preserve old data, and a failed save can be retried", async ({ page }) => {
  await page.addInitScript(
    ({ key }) => {
      const saved = {
        version: 1,
        stars: 7,
        stickers: ["C"],
        completed: { letters: 1, matching: 0 },
      };
      localStorage.setItem(key, JSON.stringify(saved));
      const original = Storage.prototype.getItem;
      let fail = true;
      Storage.prototype.getItem = function (name) {
        if (name === key && fail) {
          fail = false;
          throw new Error("Temporary read failure");
        }
        return original.call(this, name);
      };
    },
    { key: PROGRESS_STORAGE_KEY },
  );
  await page.goto("/");
  await expect(
    page.getByText("We couldn't open your saved rewards.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Open activity menu", exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Try opening rewards again", exact: true }).click();
  await openActivity(page, "My sticker book");
  await expect(page.getByText("⭐ 7 stars earned", { exact: true })).toBeVisible();
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem;
    let fail = true;
    Storage.prototype.setItem = function (name, value) {
      if (name === key && fail) {
        fail = false;
        throw new Error("Temporary write failure");
      }
      return original.call(this, name, value);
    };
  }, PROGRESS_STORAGE_KEY);
  await openActivity(page, "Find the letter");
  const question = await page.getByText(/^Find the letter [A-Z]$/).innerText();
  await page.getByRole("button", { name: `Letter ${question.trim().at(-1)}`, exact: true }).click();
  await expect(page.getByText(/Rewards could not be saved yet/)).toBeVisible();
  await openActivity(page, "My sticker book");
  await page.getByRole("button", { name: "Try saving again", exact: true }).click();
  await expect(
    page.getByText("Saved on this tablet. Your stickers will be here next time!", { exact: true }),
  ).toBeVisible();
  await expect.poll(async () => (await savedProgress(page))?.stars).toBe(8);
});
