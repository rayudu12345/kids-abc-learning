import { animals, shuffle, Animal } from "./quizLogic";
export type MemoryCard = { id: number; animal: Animal };
export type MemoryState = { cards: MemoryCard[]; revealed: number[]; matched: string[] };
export function newMemory(pairCount: number): MemoryState {
  const count = [2, 3, 4].includes(pairCount) ? pairCount : 2;
  const chosen = shuffle(animals).slice(0, count);
  return {
    cards: shuffle(
      chosen.flatMap((animal, index) => [
        { id: index * 2, animal },
        { id: index * 2 + 1, animal },
      ]),
    ),
    revealed: [],
    matched: [],
  };
}
export function memoryMismatch(state: MemoryState) {
  return (
    state.revealed.length === 2 &&
    !state.matched.includes(
      state.cards.find((card) => card.id === state.revealed[0])!.animal.letter,
    )
  );
}
export function flipMemory(state: MemoryState, id: number): MemoryState {
  const card = state.cards.find((item) => item.id === id);
  if (
    !card ||
    state.matched.includes(card.animal.letter) ||
    state.revealed.includes(id) ||
    memoryMismatch(state)
  )
    return state;
  const revealed = state.revealed.length === 2 ? [id] : [...state.revealed, id];
  const first = state.cards.find((item) => item.id === revealed[0])!;
  const match = revealed.length === 2 && first.animal.letter === card.animal.letter;
  return {
    ...state,
    revealed,
    matched: match ? [...state.matched, card.animal.letter] : state.matched,
  };
}
