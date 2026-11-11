import test from "node:test";
import assert from "node:assert/strict";
import { phonicsSounds } from "../../data/learningCatalog";
import { emptyProgress, addLearningReward, readProgress } from "../../progressLogic";
test("phonics separates six initial continuous sounds from letter names", () => {
  assert.equal(phonicsSounds.length, 6);
  assert.ok(phonicsSounds.every((item) => item.sound.length === 3 && !item.sound.includes("uh")));
});
test("new learning progress preserves old rewards and deduplicates learned content", () => {
  let saved = readProgress(
    JSON.stringify({ version: 1, stars: 7, stickers: ["C"], completed: { letters: 1 } }),
  );
  saved = addLearningReward(saved, "phonics", "M", false);
  saved = addLearningReward(saved, "phonics", "M", true);
  assert.equal(saved.stars, 9);
  assert.deepEqual(saved.learnedPhonics, ["M"]);
  assert.deepEqual(saved.stickers, ["C"]);
  assert.equal(saved.completed.phonics, 1);
  assert.deepEqual(readProgress(JSON.stringify(saved)), saved);
  assert.deepEqual(addLearningReward(saved, "phonics", "?", true), saved);
  assert.deepEqual(emptyProgress().learnedPhonics, []);
});
