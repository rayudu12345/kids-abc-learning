import test from "node:test";
import assert from "node:assert/strict";
import { selectClips } from "../../audio/clipSelection";
test("basic letters use licensed words and matching real animal sounds", () => {
  const files = new Set([
    "letter-C",
    "cat",
    "sound-cat",
    "letter-D",
    "dog",
    "sound-dog",
    "letter-M",
    "mango",
  ]);
  const has = (id: string) => files.has(id);
  assert.deepEqual(selectClips("C! C is for Cat! Meow!", has), ["letter-C", "cat", "sound-cat"]);
  assert.deepEqual(selectClips("D! D is for Dog!", has), ["letter-D", "dog", "sound-dog"]);
  assert.deepEqual(selectClips("M! M is for Mango!", has), ["letter-M", "mango"]);
  assert.deepEqual(selectClips("C", has), ["letter-C"]);
});
test("unrecorded guidance and definitions are kept for device speech, not silently dropped", () => {
  assert.deepEqual(
    selectClips("A. A is for Astronaut. A space traveler.", () => true),
    [],
  );
  assert.deepEqual(
    selectClips("Can you find the letter C?", (id) => id === "cat"),
    [],
  );
  assert.deepEqual(
    selectClips("Q! Q is for Queen!", () => false),
    [],
  );
  assert.deepEqual(
    selectClips("mmm", (id) => id === "letter-M"),
    [],
  );
});

test("expanded alphabet calls use actual species recordings and never substitute garden birds", () => {
  const has = (id: string) =>
    [
      "letter-E",
      "elephant",
      "sound-elephant",
      "letter-L",
      "lion",
      "sound-lion",
      "letter-P",
      "parrot",
      "sound-parrot",
      "letter-F",
      "fish",
      "sound-birds",
    ].includes(id);
  for (const [letter, word, clip] of [
    ["E", "Elephant", "elephant"],
    ["L", "Lion", "lion"],
    ["P", "Parrot", "parrot"],
  ])
    assert.deepEqual(selectClips(`${letter}! ${letter} is for ${word}!`, has), [
      `letter-${letter}`,
      clip,
      `sound-${clip}`,
    ]);
  assert.deepEqual(selectClips("F! F is for Fish!", has), ["letter-F", "fish"]);
});
