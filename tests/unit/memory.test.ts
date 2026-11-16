import test from "node:test";
import assert from "node:assert/strict";
import { newMemory, flipMemory, memoryMismatch } from "../../memoryLogic";
test("memory decks have exactly two copies of each animal and unique card IDs", () => {
  for (const count of [2, 3, 4])
    for (let attempt = 0; attempt < 10; attempt++) {
      const state = newMemory(count);
      assert.equal(state.cards.length, count * 2);
      assert.equal(new Set(state.cards.map((card) => card.id)).size, count * 2);
      for (const letter of new Set(state.cards.map((card) => card.animal.letter)))
        assert.equal(state.cards.filter((card) => card.animal.letter === letter).length, 2);
    }
  assert.equal(newMemory(99).cards.length, 4);
});
test("memory ignores repeat taps, locks mismatches and matches each pair once", () => {
  let state = newMemory(2);
  const first = state.cards[0],
    twin = state.cards.find(
      (card) => card.id !== first.id && card.animal.letter === first.animal.letter,
    )!,
    other = state.cards.find((card) => card.animal.letter !== first.animal.letter)!;
  state = flipMemory(state, first.id);
  assert.equal(flipMemory(state, first.id), state);
  const wrong = flipMemory(state, other.id);
  assert.ok(memoryMismatch(wrong));
  assert.equal(flipMemory(wrong, twin.id), wrong);
  state = flipMemory(state, twin.id);
  assert.equal(state.matched.length, 1);
  assert.equal(flipMemory(state, first.id), state);
  assert.equal(flipMemory(state, -10), state);
});
