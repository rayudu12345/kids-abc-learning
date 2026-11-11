import { shuffle } from "./quizLogic";
export function countAnimal(counted: readonly number[], index: number, total: number): number[] {
  if (!Number.isInteger(index) || index < 0 || index >= total || counted.includes(index))
    return [...counted];
  return [...counted, index];
}
export function numberChoices(target: number): number[] {
  if (!Number.isInteger(target) || target < 1 || target > 10) throw new Error("Count must be 1–10");
  const distractors = shuffle(
    Array.from({ length: 10 }, (_, index) => index + 1).filter((value) => value !== target),
  );
  return shuffle([target, ...distractors.slice(0, target <= 5 ? 1 : 2)]);
}
