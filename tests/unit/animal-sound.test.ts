import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { newSoundLesson, soundAnimals, soundAnswer } from "../../animalSoundLogic";
import { addReward, emptyProgress, readProgress } from "../../progressLogic";
test("sound lessons are short, varied and have one correct picture per question", () => {
  for (let attempt = 0; attempt < 30; attempt++) {
    const lesson = newSoundLesson();
    assert.equal(lesson.length, 4);
    assert.equal(new Set(lesson.map((round) => round.target.letter)).size, 4);
    for (const round of lesson) {
      assert.equal(round.choices.length, 2);
      assert.equal(new Set(round.choices.map((animal) => animal.letter)).size, 2);
      assert.equal(
        round.choices.filter((animal) => animal.letter === round.target.letter).length,
        1,
      );
      const audio = readFileSync(`assets/audio/${round.target.clip}.mp3`);
      assert.ok(audio.length > 500);
    }
  }
});
test("sound answers reject unknown or locked taps and allow unlimited retries", () => {
  assert.equal(soundAnswer("C", "D", false), "retry");
  assert.equal(soundAnswer("C", "C", false), "correct");
  assert.equal(soundAnswer("C", "C", true), "ignored");
  assert.equal(soundAnswer("C", "X", false), "ignored");
});
test("sound matching rewards preserve existing stars, stickers and backup format", () => {
  const original = { ...emptyProgress(), stars: 12, stickers: ["E"], tracedLetters: ["A"] };
  const lesson = newSoundLesson();
  const next = lesson.reduce(
    (progress, round, index) => addReward(progress, round.target.letter, "matching", index === 3),
    original,
  );
  assert.equal(next.stars, 16);
  assert.equal(next.completed.matching, 1);
  assert.deepEqual(
    new Set(next.stickers),
    new Set(["E", ...lesson.map((round) => round.target.letter)]),
  );
  assert.deepEqual(next.tracedLetters, ["A"]);
  assert.deepEqual(readProgress(JSON.stringify(next)), next);
  assert.equal(original.stars, 12);
});
