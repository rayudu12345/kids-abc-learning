import test from "node:test";
import assert from "node:assert/strict";
import { motionRows, frameAtTick } from "../../data/animalMotion";
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
