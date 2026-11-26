import { shuffle } from "./quizLogic";
export const puzzleLevels = [2, 4, 6, 9, 12, 16, 25, 36] as const;
export type PuzzleParts = (typeof puzzleLevels)[number];
export function puzzleGrid(parts: PuzzleParts) {
  const columns = parts === 2 ? 2 : Math.ceil(Math.sqrt(parts));
  return { columns, rows: parts / columns };
}
export type PuzzleState = {
  parts: PuzzleParts;
  order: number[];
  selected: number | null;
  placed: number[];
  hint: number | null;
};
export function newPuzzle(parts: PuzzleParts): PuzzleState {
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
export function puzzleSlice(parts: PuzzleParts, id: number, size: number) {
  const { columns, rows } = puzzleGrid(parts);
  const width = size / columns,
    height = size / rows;
  return { x: (id % columns) * width, y: Math.floor(id / columns) * height, width, height };
}
export function puzzlePartName(parts: PuzzleParts, id: number) {
  if (parts === 2) return ["Left half", "Right half"][id];
  if (parts === 4) return ["Top left", "Top right", "Bottom left", "Bottom right"][id];
  const { columns } = puzzleGrid(parts);
  return `Row ${Math.floor(id / columns) + 1}, column ${(id % columns) + 1}`;
}
