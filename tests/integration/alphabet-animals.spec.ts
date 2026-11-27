import { test, expect } from "@playwright/test";
const animals = [
  ["C", "Cat"],
  ["D", "Dog"],
  ["E", "Elephant"],
  ["F", "Fish"],
  ["L", "Lion"],
  ["P", "Parrot"],
  ["R", "Rabbit"],
  ["Z", "Zebra"],
];
test("alphabet animals have large habitat scenes and changing poses, including full screen", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  for (const [letter, name] of animals) {
    await page
      .getByRole("button", {
        name: `${letter}, ${name}. Play animation and pronunciation`,
        exact: true,
      })
      .click();
    const scene = page.getByTestId("animal-letter-scene");
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toBeVisible();
    await expect(scene).toHaveAttribute("aria-label", new RegExp(`^${name}\\.`));
    const frame = scene.getByTestId("animal-motion-frame");
    const image = frame.getByTestId("animal-current-pose").locator("img");
    const first = await image.evaluate((img) => getComputedStyle(img.parentElement!).left);
    await expect
      .poll(() => image.evaluate((img) => getComputedStyle(img.parentElement!).left))
      .not.toBe(first);
    // Art occupies most of the stage height rather than a small emoji-sized patch.
    const artBox = (await frame.boundingBox())!;
    const sceneBox = (await scene.boundingBox())!;
    expect(artBox.height / sceneBox.height).toBeGreaterThan(0.75);
  }
  await page.getByRole("button", { name: "Show animation full screen", exact: true }).click();
  await expect(page.getByTestId("animal-letter-scene").last()).toBeVisible();
  await page.getByRole("button", { name: "✕ Back to letters", exact: true }).click();
  // Return to a non-animal letter without leaving the previous animal behind.
  await page
    .getByRole("button", { name: "A, Apple. Play animation and pronunciation", exact: true })
    .click();
  await expect(page.getByTestId("animal-letter-scene")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("alphabet animals keep a resting pose when reduced motion is enabled", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "R, Rabbit. Play animation and pronunciation", exact: true })
    .click();
  const scene = page.getByTestId("animal-letter-scene");
  await scene.scrollIntoViewIfNeeded();
  const image = scene.getByTestId("animal-current-pose").locator("img");
  const pose = () => image.evaluate((img) => getComputedStyle(img.parentElement!).left);
  const initial = await pose();
  await page.waitForTimeout(700);
  expect(await pose()).toBe(initial);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(pose).not.toBe(initial);
});
test("expanded alphabet animals play real calls with replay and mute controls", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as { calls: string[] }).calls = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { calls: string[] }).calls.push(this.currentSrc || this.src);
      return play.call(this);
    };
  });
  await page.goto("/");
  for (const [letter, name] of [
    ["E", "Elephant"],
    ["L", "Lion"],
    ["P", "Parrot"],
  ]) {
    await page
      .getByRole("button", {
        name: `${letter}, ${name}. Play animation and pronunciation`,
        exact: true,
      })
      .click();
    await expect
      .poll(() =>
        page.evaluate(
          (clip) =>
            (window as unknown as { calls: string[] }).calls.filter((url) => url.includes(clip))
              .length,
          `sound-${name.toLowerCase()}`,
        ),
      )
      .toBeGreaterThan(0);
    const before = await page.evaluate(
      () => (window as unknown as { calls: string[] }).calls.length,
    );
    await page.getByRole("button", { name: `Hear real ${name} sound`, exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { calls: string[] }).calls.length))
      .toBeGreaterThan(before);
  }
  await page.getByRole("switch", { name: "Alphabet sound", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Hear real Parrot sound", exact: true }),
  ).toBeDisabled();
  const before = await page.evaluate(() => (window as unknown as { calls: string[] }).calls.length);
  await page
    .getByRole("button", { name: "E, Elephant. Play animation and pronunciation", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Hear real Elephant sound", exact: true }),
  ).toBeDisabled();
  expect(await page.evaluate(() => (window as unknown as { calls: string[] }).calls.length)).toBe(
    before,
  );
});
