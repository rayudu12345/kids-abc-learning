import { shuffle } from "./quizLogic";
export type PuzzleState = {
  parts: 2 | 4;
  order: number[];
  selected: number | null;
  placed: number[];
  hint: number | null;
};
export function newPuzzle(parts: 2 | 4): PuzzleState {
  return {
    parts,
    order: shuffle(Array.from({ length: parts }, (_, id) => id)),
    selected: null,
    placed: [],
    hint: null,
  };
}
const valid = (state: PuzzleState, id: number) =>
  Number.isInteger(id) && id >= 0 && id < state.parts;
export function selectPuzzle(state: PuzzleState, id: number): PuzzleState {
  if (
    !valid(state, id) ||
    state.placed.includes(id) ||
    (state.selected === id && state.hint === null)
  )
    return state;
  return { ...state, selected: id, hint: null };
}
export function placePuzzle(state: PuzzleState, piece: number, slot: number): PuzzleState {
  if (!valid(state, piece) || !valid(state, slot) || state.placed.includes(piece)) return state;
  if (piece !== slot) return { ...state, selected: piece, hint: piece };
  return { ...state, selected: null, hint: null, placed: [...state.placed, piece] };
}
export function puzzleSlice(parts: 2 | 4, id: number, size: number) {
  const width = size / 2,
    height = size / (parts / 2);
  return { x: (id % 2) * width, y: Math.floor(id / 2) * height, width, height };
}
export function puzzlePartName(parts: 2 | 4, id: number) {
  return parts === 2
    ? ["Left half", "Right half"][id]
    : ["Top left", "Top right", "Bottom left", "Bottom right"][id];
}
