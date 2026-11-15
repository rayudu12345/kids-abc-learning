import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { balloonLetter, flyingLanes } from "../../skyPlayLogic";
test("flying targets have usable, separate lanes on phones and tablets", () => {
  for (const width of [200, 280, 350, 390, 600, 800, 1200]) {
    const lanes = flyingLanes(width);
    assert.equal(lanes.length, width >= 600 ? 5 : width >= 280 ? 3 : 2);
    assert.equal(new Set(lanes.map((lane) => lane.id)).size, lanes.length);
    for (const lane of lanes) {
      assert.ok(lane.width >= 70);
      assert.ok(lane.x >= 0 && lane.x + lane.width <= width);
      assert.ok(lane.phase > 0 && lane.phase < 1);
      assert.ok(lane.duration >= 13000);
    }
    for (let index = 1; index < lanes.length; index++)
      assert.ok(lanes[index].x >= lanes[index - 1].x + lanes[index - 1].width);
  }
});
test("replacement balloons cycle through A–Z", () => {
  assert.equal(balloonLetter(0, 0, 3), "A");
  assert.equal(balloonLetter(2, 0, 3), "C");
  assert.equal(balloonLetter(0, 1, 3), "D");
  assert.equal(balloonLetter(2, 8, 3), "A");
});
test("pop and kite effects are bundled, original short audio assets", () => {
  for (const name of ["pop", "kite"]) {
    const file = readFileSync(`assets/effects/${name}.mp3`);
    assert.ok(file.length > 500 && file.length < 10000);
  }
});
