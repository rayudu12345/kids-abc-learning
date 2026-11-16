import { animals, shuffle } from "./quizLogic";
export const newEggLesson = () => shuffle(animals);
export function crackEgg(cracks: number) {
  return Math.min(3, Math.max(0, Number.isFinite(cracks) ? Math.floor(cracks) : 0) + 1);
}
