import { shuffle } from "./quizLogic";
/** Only include animals with a correctly identified, licensed bundled recording. */
export const soundAnimals = [
  { letter: "C", name: "Cat", clip: "sound-cat", clue: "Meow!" },
  { letter: "D", name: "Dog", clip: "sound-dog", clue: "Woof!" },
] as const;
export type SoundAnimal = (typeof soundAnimals)[number];
export function newSoundLesson() {
  return shuffle([...soundAnimals, ...soundAnimals]).map((target) => ({
    target,
    choices: shuffle(soundAnimals),
  }));
}
export function soundAnswer(target: string, choice: string, locked: boolean) {
  if (locked || !soundAnimals.some((animal) => animal.letter === choice)) return "ignored";
  return choice === target ? "correct" : "retry";
}
