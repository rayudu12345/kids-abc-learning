import test from "node:test";
import assert from "node:assert/strict";
import { animalTraces, letterTraces, sampledStrokes } from "../../traceCatalog";
import { advanceTrace, strokePoints } from "../../tracingLogic";

test("catalogue contains A–Z and 24 unique, named animal outlines", () => {
  assert.equal(letterTraces.map((item) => item.id).join(""), "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  assert.equal(animalTraces.length, 24);
  assert.equal(new Set(animalTraces.map((item) => item.id)).size, 24);
  assert.ok(animalTraces.every((item) => item.name && item.icon));
  assert.throws(() => strokePoints("?"), /Unknown tracing letter/);
});
for (const item of [...letterTraces, ...animalTraces]) {
  test(`${item.name}: every stroke is reachable, bounded and ordered`, () => {
    for (const points of sampledStrokes(item)) {
      assert.ok(points.length >= 2);
      let visited = 0;
      let previous = null;
      for (const point of points) {
        assert.ok(point.x >= 20 && point.x <= 280 && point.y >= 20 && point.y <= 280);
        visited = advanceTrace(points, visited, point, previous);
        previous = point;
      }
      assert.equal(visited, points.length);
      assert.equal(advanceTrace(points, 0, { x: 0, y: 0 }, null), 0);
      // A tiny facial detail may fit inside the child-friendly touch tolerance.
      if (
        points.some(
          (point) => Math.hypot(point.x - points.at(-1)!.x, point.y - points.at(-1)!.y) > 48,
        )
      ) {
        assert.ok(advanceTrace(points, 0, points.at(-1)!, null) < points.length);
      }
    }
  });
}
test("tracing can resume after lifting and accepts fast movements along a path", () => {
  const points = strokePoints("L")[0];
  const count = advanceTrace(points, 0, points[0], null);
  assert.ok(advanceTrace(points, count, points[count], null) > count);
  const corner = points.findIndex((point) => point.y === 250);
  let visited = advanceTrace(points, count, points[corner], points[0]);
  visited = advanceTrace(points, visited, points.at(-1)!, points[corner]);
  assert.equal(visited, points.length);
});
