import test from "node:test";
import assert from "node:assert/strict";
import { animals, choicesFor, newLesson, shuffle } from "../../quizLogic";

test("shuffle returns a permutation without changing its input", () => {
  const input = Object.freeze([1, 2, 3, 4]);
  assert.deepEqual(shuffle(input).sort(), input);
  assert.deepEqual(shuffle([]), []);
  assert.deepEqual(shuffle([1]), [1]);
});
test("lessons have five unique animal letters and three choices with one answer", () => {
  for (let trial = 0; trial < 100; trial++) {
    const lesson = newLesson();
    assert.equal(lesson.length, 5);
    assert.equal(new Set(lesson.map((animal) => animal.letter)).size, 5);
    for (const target of animals) {
      const choices = choicesFor(target);
      assert.equal(choices.length, 3);
      assert.equal(new Set(choices.map((animal) => animal.letter)).size, 3);
      assert.equal(choices.filter((animal) => animal.letter === target.letter).length, 1);
    }
  }
});
