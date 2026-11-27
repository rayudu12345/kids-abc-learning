import { soundAnimals } from "../../data/animalSounds";
import { test, expect } from "@playwright/test";
import { openActivity, savedProgress } from "./helpers";
test("real animal sounds, gentle retry, mute clues, automatic rounds and saved rewards", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    (window as unknown as { played: string[] }).played = [];
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { played: string[] }).played.push(this.currentSrc || this.src);
      return play.call(this);
    };
  });
  const played = () => page.evaluate(() => (window as unknown as { played: string[] }).played);
  await page.goto("/");
  await openActivity(page, "Animal sound match");
  await expect
    .poll(async () =>
      (await played()).some((url) => soundAnimals.some((animal) => url.includes(animal.clip))),
    )
    .toBe(true);
  const firstClip = (await played()).findLast((url) =>
    soundAnimals.some((animal) => url.includes(animal.clip)),
  )!;
  const first = soundAnimals.find((animal) => firstClip.includes(animal.clip))!.name;
  const choices = await page.getByRole("button", { name: /^Choose / }).all();
  for (const choice of choices)
    if ((await choice.getAttribute("aria-label")) !== `Choose ${first}`) {
      await choice.click();
      break;
    }
  await expect(
    page.getByText("Let's try again. The star shows your animal friend!", { exact: true }),
  ).toBeVisible();
  expect((await savedProgress(page))?.stars ?? 0).toBe(0);
  const requests = (await played()).length;
  await page.getByRole("button", { name: "Replay animal sound", exact: true }).click();
  await expect.poll(async () => (await played()).length).toBeGreaterThan(requests);
  await page.getByRole("switch", { name: "Animal sound game audio", exact: true }).click();
  const mutedRequests = (await played()).length;
  const collected: string[] = [];
  for (let round = 1; round <= 4; round++) {
    await expect(page.getByText(`Sound ${round} of 4`, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Replay animal sound", exact: true }),
    ).toBeDisabled();
    const clue = await page.getByText(/^Sound clue:/).innerText();
    const animal = soundAnimals.find((animal) => clue.includes(animal.clue))!;
    const name = animal.name;
    collected.push(animal.letter);
    await page.getByRole("button", { name: `Choose ${name}`, exact: true }).evaluate((button) => {
      (button as HTMLElement).click();
      (button as HTMLElement).click();
    });
    await expect.poll(async () => (await savedProgress(page))?.stars).toBe(round);
    await expect(page.getByText(`Yes! ${name}! One saved star! ⭐`, { exact: true })).toBeVisible();
  }
  await expect(
    page.getByText("Wonderful listening! Four stars saved! 🎉", { exact: true }),
  ).toBeVisible();
  const progress = await savedProgress(page);
  expect(progress.completed.matching).toBe(1);
  expect(progress.stickers.sort()).toEqual([...new Set(collected)].sort());
  expect((await played()).length).toBe(mutedRequests);
  await page.getByRole("button", { name: "🌈 Play sounds again", exact: true }).click();
  await expect(page.getByText("Sound 1 of 4", { exact: true })).toBeVisible();
  expect((await savedProgress(page)).stars).toBe(4);
  await page.reload();
  expect((await savedProgress(page)).stars).toBe(4);
  await openActivity(page, "My sticker book");
  await expect(page.getByText("Completed matching adventures: 1", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
test("leaving sound play cancels its pending advance", async ({ page }) => {
  await page.goto("/");
  await openActivity(page, "Animal sound match");
  await page.getByRole("switch", { name: "Animal sound game audio", exact: true }).click();
  const clue = await page.getByText(/^Sound clue:/).innerText();
  await page
    .getByRole("button", {
      name: `Choose ${soundAnimals.find((animal) => clue.includes(animal.clue))!.name}`,
      exact: true,
    })
    .click();
  await openActivity(page, "Alphabet A–Z");
  await page.waitForTimeout(2400);
  await openActivity(page, "Animal sound match");
  await expect(page.getByText("Sound 1 of 4", { exact: true })).toBeVisible();
  expect((await savedProgress(page)).stars).toBe(1);
  expect((await savedProgress(page)).completed.matching).toBe(0);
});
