import test from "node:test";
import assert from "node:assert/strict";
import { motionRows, frameAtTick, animalMotion, animalPoseAtTick } from "../../data/animalMotion";
import { existsSync } from "node:fs";
test("all eight realistic animals have four looping motion poses", () => {
  assert.equal(Object.keys(motionRows).length, 8);
  assert.deepEqual(Object.values(motionRows).sort(), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(
    Array.from({ length: 8 }, (_, index) => frameAtTick(index)),
    [0, 1, 2, 3, 0, 1, 2, 3],
  );
  assert.ok(existsSync("assets/animal-motion.png"));
});

test("each animal has a bounded, smooth loop with its own action and pace", () => {
  assert.deepEqual(Object.keys(animalMotion).sort(), Object.keys(motionRows).sort());
  for (const [letter, profile] of Object.entries(animalMotion)) {
    assert.ok(profile.frameMs >= 150 && profile.frameMs <= 300);
    assert.ok(profile.poses.length >= 4);
    assert.equal(animalPoseAtTick(letter, 0), 0);
    assert.equal(animalPoseAtTick(letter, profile.poses.length), 0);
    assert.equal(animalPoseAtTick(letter, -1), profile.poses.at(-1));
    assert.ok(profile.poses.every((pose) => Number.isInteger(pose) && pose >= 0 && pose < 4));
    for (const samples of [profile.x, profile.y, profile.tilt]) {
      assert.equal(samples[0], samples.at(-1));
      assert.ok(samples.every((value) => Number.isFinite(value) && Math.abs(value) <= 15));
    }
    assert.ok(profile.action.length > 12);
  }
  assert.notEqual(animalMotion.D.frameMs, animalMotion.E.frameMs);
  assert.ok(Math.min(...animalMotion.R.y) < Math.min(...animalMotion.D.y));
  assert.equal(animalPoseAtTick("unknown", 100), 0);
});
