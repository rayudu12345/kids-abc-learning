import { shuffle } from "./quizLogic";
import { MemoryAnimal, MemoryGroup, memoryAnimalsFor } from "./data/memoryAnimals";
export type MemoryCard = { id: number; animal: MemoryAnimal };
export type MemoryState = { cards: MemoryCard[]; revealed: number[]; matched: string[] };
export function newMemory(pairCount: number, group: MemoryGroup = "all"): MemoryState {
  const count = [2, 3, 4].includes(pairCount) ? pairCount : 2;
  const chosen = shuffle(memoryAnimalsFor(group)).slice(0, count);
  return {
    cards: shuffle(
      chosen.flatMap((animal, index) => [
        { id: index * 2, animal },
        { id: index * 2 + 1, animal },
      ]),
    ).map((card, position) => ({ ...card, id: position })),
    revealed: [],
    matched: [],
  };
}
export function memoryMismatch(state: MemoryState) {
  return (
    state.revealed.length === 2 &&
    !state.matched.includes(state.cards.find((card) => card.id === state.revealed[0])!.animal.id)
  );
}
export function flipMemory(state: MemoryState, id: number): MemoryState {
  const card = state.cards.find((item) => item.id === id);
  if (
    !card ||
    state.matched.includes(card.animal.id) ||
    state.revealed.includes(id) ||
    memoryMismatch(state)
  )
    return state;
  const revealed = state.revealed.length === 2 ? [id] : [...state.revealed, id];
  const first = state.cards.find((item) => item.id === revealed[0])!;
  const match = revealed.length === 2 && first.animal.id === card.animal.id;
  return {
    ...state,
    revealed,
    matched: match ? [...state.matched, card.animal.id] : state.matched,
  };
}
