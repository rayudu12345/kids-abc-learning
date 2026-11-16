import test from "node:test";
import assert from "node:assert/strict";
import { paintPoint, extendPaint, MAX_PAINT_DOTS, paintColors } from "../../coloringLogic";
test("coloring bounds finger points and rejects invalid input", () => {
  assert.deepEqual(paintPoint(-10, 450), { x: 0, y: 300 });
  assert.equal(paintPoint(NaN, 1), null);
  assert.equal(new Set(paintColors.map((color) => color.name)).size, paintColors.length);
});
test("fast strokes interpolate smoothly, preserve the old stroke and respect page limits", () => {
  const start = [{ x: 0, y: 0 }],
    next = extendPaint(start, { x: 300, y: 300 }, 24, MAX_PAINT_DOTS - 1);
  assert.deepEqual(start, [{ x: 0, y: 0 }]);
  assert.deepEqual(next.at(-1), { x: 300, y: 300 });
  for (let i = 1; i < next.length; i++)
    assert.ok(Math.hypot(next[i].x - next[i - 1].x, next[i].y - next[i - 1].y) <= 6);
  assert.equal(extendPaint(start, { x: 300, y: 300 }, 24, 4).length, 5);
  assert.equal(extendPaint(start, { x: 100, y: 100 }, 24, 0), start);
});
