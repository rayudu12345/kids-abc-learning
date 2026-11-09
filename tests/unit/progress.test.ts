import test from "node:test";
import assert from "node:assert/strict";
import { addReward, addTracingReward, emptyProgress, readProgress } from "../../progressLogic";
import { animalTraces } from "../../traceCatalog";

test("missing data starts empty and old saved rewards migrate without loss", () => {
  assert.deepEqual(readProgress(null), emptyProgress());
  const migrated = readProgress(
    JSON.stringify({
      version: 1,
      stars: 7,
      stickers: ["C"],
      completed: { letters: 2, matching: 1 },
    }),
  );
  assert.equal(migrated.stars, 7);
  assert.deepEqual(migrated.stickers, ["C"]);
  assert.equal(migrated.completed.letters, 2);
  assert.deepEqual(migrated.tracedAnimals, []);
  assert.equal(migrated.completed.tracing, 0);
});
test("invalid counters and identifiers are sanitized; corrupt or future data is rejected", () => {
  const saved = readProgress(
    JSON.stringify({
      version: 1,
      stars: -1,
      stickers: ["C", "C", "?", 4],
      tracedLetters: ["A", "?"],
      tracedAnimals: ["dog", "dog", "?"],
      completed: { letters: -4, matching: 2 },
    }),
  );
  assert.equal(saved.stars, 0);
  assert.deepEqual(saved.stickers, ["C"]);
  assert.deepEqual(saved.tracedLetters, ["A"]);
  assert.deepEqual(saved.tracedAnimals, ["dog"]);
  assert.equal(saved.completed.letters, 0);
  assert.equal(saved.completed.matching, 2);
  assert.throws(() => readProgress("{bad"));
  assert.throws(() => readProgress('{"version":99}'), /Unsupported/);
});
test("repeated correct answers earn stars but do not duplicate stickers", () => {
  let saved = emptyProgress();
  saved = addReward(saved, "C", "letters", false);
  saved = addReward(saved, "C", "letters", true);
  saved = addReward(saved, "D", "matching", true);
  assert.equal(saved.stars, 3);
  assert.deepEqual(saved.stickers, ["C", "D"]);
  assert.equal(saved.completed.letters, 1);
  assert.equal(saved.completed.matching, 1);
  assert.deepEqual(addReward(saved, "?", "letters", true), saved);
});
test("all tracing rewards survive a save/load round trip", () => {
  let saved = emptyProgress();
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    saved = addTracingReward(saved, letter, "letter");
  for (const animal of animalTraces) saved = addTracingReward(saved, animal.id, "animal");
  assert.equal(saved.stars, 50);
  assert.equal(saved.tracedLetters.length, 26);
  assert.equal(saved.tracedAnimals.length, 24);
  assert.equal(saved.completed.tracing, 50);
  assert.ok(["C", "D", "E", "F", "L", "R"].every((letter) => saved.stickers.includes(letter)));
  saved = addTracingReward(saved, "A", "letter");
  assert.equal(saved.tracedLetters.length, 26);
  assert.deepEqual(readProgress(JSON.stringify(saved)), saved);
  assert.deepEqual(addTracingReward(saved, "?", "animal"), saved);
});
