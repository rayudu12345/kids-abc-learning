import { shuffle } from "./quizLogic";
import { soundAnimals } from "./data/animalSounds";
export { soundAnimals } from "./data/animalSounds";
export type SoundAnimal = (typeof soundAnimals)[number];
export function newSoundLesson() {
  return shuffle(soundAnimals)
    .slice(0, 4)
    .map((target) => ({
      target,
      choices: shuffle([
        target,
        shuffle(soundAnimals.filter((animal) => animal.letter !== target.letter))[0],
      ]),
    }));
}
export function soundAnswer(target: string, choice: string, locked: boolean) {
  if (locked || !soundAnimals.some((animal) => animal.letter === choice)) return "ignored";
  return choice === target ? "correct" : "retry";
}
