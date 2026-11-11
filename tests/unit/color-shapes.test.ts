import test from "node:test";
import assert from "node:assert/strict";
import { colorItems, shapeItems } from "../../data/learningCatalog";
import { tryLearningMatch } from "../../learningMatchLogic";
import { addLearningReward, emptyProgress } from "../../progressLogic";
test("colors and shapes have names, unique IDs and non-color cues", () => {
  for (const items of [colorItems, shapeItems]) {
    assert.equal(items.length, 6);
    assert.equal(new Set(items.map((item) => item.id)).size, 6);
    assert.ok(
      items.every((item) => item.name && item.symbol && /^#[0-9A-F]{6}$/i.test(item.color)),
    );
  }
});
test("matches require correct targets and cannot award the same tile twice", () => {
  const first = tryLearningMatch([], "red", "red", ["red", "blue"]);
  assert.equal(first.correct, true);
  assert.deepEqual(tryLearningMatch(first.matched, "red", "red", ["red", "blue"]), {
    correct: false,
    matched: ["red"],
  });
  assert.equal(tryLearningMatch([], "red", "blue", ["red", "blue"]).correct, false);
  assert.equal(tryLearningMatch([], "?", "?", ["red"]).correct, false);
  let saved = emptyProgress();
  for (const item of colorItems)
    saved = addLearningReward(saved, "colors", item.id, item.id === "purple");
  assert.equal(saved.practicedColors.length, 6);
  assert.equal(saved.stars, 6);
});
