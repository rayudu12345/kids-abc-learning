import test from "node:test";
import assert from "node:assert/strict";
import { findDropTarget } from "../../matchLogic";
import { dodecahedronEdges } from "../../advancedGeometry";
import { advancedAlphabet } from "../../advancedAlphabet";
test("drop targets use window coordinates and reject gaps and unmeasured boxes", () => {
  const boxes = {
    C: { x: 20, y: 400, width: 100, height: 125 },
    D: { x: 130, y: 400, width: 100, height: 125 },
  };
  assert.equal(findDropTarget(boxes, 70, 450), "C");
  assert.equal(findDropTarget(boxes, 180, 450), "D");
  assert.equal(findDropTarget(boxes, 125, 450), undefined);
  assert.equal(findDropTarget(boxes, 70, 399), undefined);
  assert.equal(findDropTarget({}, 70, 450), undefined);
  assert.equal(findDropTarget({ C: { x: 0, y: 0, width: 0, height: 0 } }, 0, 0), undefined);
});
test("advanced vocabulary covers A–Z and the dodecahedron has 20 vertices and 30 edges", () => {
  assert.equal(advancedAlphabet.map((item) => item.letter).join(""), "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  const edges = dodecahedronEdges(),
    vertices = new Map<string, number>();
  assert.equal(edges.length, 30);
  for (const edge of edges)
    for (const point of [edge.a, edge.b]) {
      const key = `${point.x},${point.y}`;
      vertices.set(key, (vertices.get(key) ?? 0) + 1);
    }
  assert.equal(vertices.size, 20);
  assert.ok([...vertices.values()].every((degree) => degree === 3));
});
