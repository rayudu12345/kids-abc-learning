import test from "node:test";
import assert from "node:assert/strict";
import { lowercaseTraces, sampledStrokes } from "../../traceCatalog";
import { advanceTrace } from "../../tracingLogic";
import { addTracingReward, emptyProgress, readProgress } from "../../progressLogic";
test("all lowercase paths can be traced and stay on the board", () => {
  assert.equal(lowercaseTraces.map((item) => item.id).join(""), "abcdefghijklmnopqrstuvwxyz");
  for (const item of lowercaseTraces)
    for (const points of sampledStrokes(item)) {
      let count = 0,
        previous = null;
      for (const point of points) {
        assert.ok(point.x >= 20 && point.x <= 280 && point.y >= 20 && point.y <= 280);
        count = advanceTrace(points, count, point, previous);
        previous = point;
      }
      assert.equal(count, points.length, item.id);
    }
});
test("lowercase rewards are separate from uppercase and survive migration", () => {
  let progress = addTracingReward(emptyProgress(), "A", "letter");
  for (const letter of "abcdefghijklmnopqrstuvwxyz")
    progress = addTracingReward(progress, letter, "lowercase");
  assert.equal(progress.tracedLowercase.length, 26);
  assert.deepEqual(progress.tracedLetters, ["A"]);
  assert.equal(progress.stars, 27);
  assert.deepEqual(readProgress(JSON.stringify(progress)), progress);
});
