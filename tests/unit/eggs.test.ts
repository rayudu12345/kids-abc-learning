import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { crackEgg, newEggLesson } from "../../eggLogic";
test("eggs reveal only after three taps and stay open on repeated taps", () => {
  assert.equal(crackEgg(0), 1);
  assert.equal(crackEgg(1), 2);
  assert.equal(crackEgg(2), 3);
  assert.equal(crackEgg(3), 3);
  assert.equal(crackEgg(NaN), 1);
  assert.equal(crackEgg(-10), 1);
});
test("egg lessons cover all eight animals with existing offline names and letters", () => {
  const lesson = newEggLesson();
  assert.equal(lesson.length, 8);
  assert.equal(new Set(lesson.map((animal) => animal.letter)).size, 8);
  for (const animal of lesson) {
    assert.ok(existsSync(`assets/audio/${animal.word.toLowerCase()}.mp3`));
    assert.ok(existsSync(`assets/audio/letter-${animal.letter}.mp3`));
  }
});
