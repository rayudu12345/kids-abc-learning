import test from "node:test";
import assert from "node:assert/strict";
import { newPuzzle, placePuzzle, selectPuzzle, puzzleSlice } from "../../puzzleLogic";
test("puzzle pieces cover the picture exactly in both levels", () => {
  for (const parts of [2, 4] as const) {
    const state = newPuzzle(parts);
    assert.deepEqual(
      [...state.order].sort(),
      Array.from({ length: parts }, (_, i) => i),
    );
    let area = 0;
    for (let id = 0; id < parts; id++) {
      const box = puzzleSlice(parts, id, 320);
      assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= 320 && box.y + box.height <= 320);
      area += box.width * box.height;
      for (let other = 0; other < id; other++) {
        const previous = puzzleSlice(parts, other, 320);
        assert.ok(box.x >= previous.x + previous.width || box.y >= previous.y + previous.height);
      }
    }
    assert.equal(area, 320 * 320);
  }
});
test("puzzle retries preserve progress and completed pieces cannot be awarded twice", () => {
  let state = newPuzzle(4);
  assert.equal(selectPuzzle(state, -1), state);
  assert.equal(placePuzzle(state, 0, 9), state);
  state = selectPuzzle(state, 0);
  assert.equal(state.selected, 0);
  state = placePuzzle(state, 0, 1);
  assert.deepEqual(state.placed, []);
  assert.equal(state.hint, 0);
  state = placePuzzle(state, 0, 0);
  assert.equal(state.hint, null);
  assert.equal(placePuzzle(state, 0, 0), state);
  assert.equal(selectPuzzle(state, 0), state);
  for (const id of [1, 2, 3]) state = placePuzzle(state, id, id);
  assert.deepEqual(state.placed, [0, 1, 2, 3]);
  assert.equal(placePuzzle(state, 3, 3), state);
});
