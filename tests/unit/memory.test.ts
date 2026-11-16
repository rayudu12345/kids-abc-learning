import test from "node:test";
import assert from "node:assert/strict";
import { memoryAnimals, memoryAnimalsFor, memoryGroups } from "../../data/memoryAnimals";
import { addMemoryReward, emptyProgress, readProgress } from "../../progressLogic";
import { MemoryState, newMemory, flipMemory, memoryMismatch } from "../../memoryLogic";
test("memory decks have exactly two copies of each animal and unique card IDs", () => {
  for (const count of [2, 3, 4])
    for (let attempt = 0; attempt < 10; attempt++) {
      const state = newMemory(count);
      assert.equal(state.cards.length, count * 2);
      assert.equal(new Set(state.cards.map((card) => card.id)).size, count * 2);
      for (const letter of new Set(state.cards.map((card) => card.animal.id)))
        assert.equal(state.cards.filter((card) => card.animal.id === letter).length, 2);
    }
  assert.equal(newMemory(99).cards.length, 4);
});
test("memory ignores repeat taps, locks mismatches and matches each pair once", () => {
  let state = newMemory(2);
  const first = state.cards[0],
    twin = state.cards.find((card) => card.id !== first.id && card.animal.id === first.animal.id)!,
    other = state.cards.find((card) => card.animal.id !== first.animal.id)!;
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

test("32 curated photos have clear credit, licenses and enough animals in each group", () => {
  assert.equal(memoryAnimals.length, 32);
  assert.equal(new Set(memoryAnimals.map((animal) => animal.id)).size, 32);
  for (const group of memoryGroups) {
    assert.ok(memoryAnimalsFor(group.id).length >= 4);
    assert.equal(newMemory(4, group.id).cards.length, 8);
  }
  for (const animal of memoryAnimals) {
    assert.ok(/^https:\/\/(thumb|upload)\.wikimedia\.org\//.test(animal.photo.uri));
    assert.ok(animal.photo.creator.length > 0 && !animal.photo.creator.includes("<"));
    assert.ok(
      animal.photo.license.startsWith("CC BY") ||
        ["Public domain", "CC0"].includes(animal.photo.license),
    );
    assert.ok(animal.photo.sourceUrl.startsWith("https://commons.wikimedia.org/"));
    assert.ok(animal.photo.licenseUrl.startsWith("https://"));
  }
});
test("matching distinguishes species with the same initial", () => {
  const cat = memoryAnimals.find((animal) => animal.id === "cat")!,
    cow = memoryAnimals.find((animal) => animal.id === "cow")!;
  let state: MemoryState = {
    cards: [
      { id: 0, animal: cat },
      { id: 1, animal: cow },
      { id: 2, animal: cat },
      { id: 3, animal: cow },
    ],
    matched: [],
    revealed: [],
  };
  state = flipMemory(state, 0);
  state = flipMemory(state, 1);
  assert.ok(memoryMismatch(state));
  assert.equal(state.matched.length, 0);
});
test("new species earn saved stars without awarding a sticker for a shared initial", () => {
  const before = { ...emptyProgress(), stars: 7, stickers: ["E"] };
  const cow = addMemoryReward(before, "cow", true);
  assert.equal(cow.stars, 8);
  assert.equal(cow.completed.matching, 1);
  assert.deepEqual(cow.stickers, ["E"]);
  const cat = addMemoryReward(cow, "cat", false);
  assert.deepEqual(cat.stickers, ["E", "C"]);
  assert.deepEqual(readProgress(JSON.stringify(cat)), cat);
  assert.equal(addMemoryReward(cat, "unknown-animal", true), cat);
  assert.equal(before.stars, 7);
});
