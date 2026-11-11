import test from "node:test";
import assert from "node:assert/strict";
import { countAnimal, numberChoices } from "../../countingLogic";
test("counting ignores double taps and out-of-range animal indices", () => {
  let counted = countAnimal([], 0, 3);
  counted = countAnimal(counted, 0, 3);
  assert.deepEqual(counted, [0]);
  assert.deepEqual(countAnimal(counted, -1, 3), [0]);
  assert.deepEqual(countAnimal(counted, 3, 3), [0]);
  assert.deepEqual(countAnimal(counted, 1, 3), [0, 1]);
});
test("each count 1–10 has unique choices and exactly one answer", () => {
  for (let n = 1; n <= 10; n++) {
    const choices = numberChoices(n);
    assert.equal(choices.length, n <= 5 ? 2 : 3);
    assert.equal(new Set(choices).size, choices.length);
    assert.equal(choices.filter((value) => value === n).length, 1);
  }
  assert.throws(() => numberChoices(0));
  assert.throws(() => numberChoices(11));
});
