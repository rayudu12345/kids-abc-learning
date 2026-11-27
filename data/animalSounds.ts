/** Only verified species recordings; garden birds are not a parrot substitute. */
export const soundAnimals = [
  { letter: "C", name: "Cat", clip: "sound-cat", clue: "Meow!" },
  { letter: "D", name: "Dog", clip: "sound-dog", clue: "Woof!" },
  { letter: "E", name: "Elephant", clip: "sound-elephant", clue: "Elephant trumpet!" },
  { letter: "L", name: "Lion", clip: "sound-lion", clue: "Lion roar!" },
  { letter: "P", name: "Parrot", clip: "sound-parrot", clue: "Parrot call!" },
] as const;
export const animalCall = (letter: string) =>
  soundAnimals.find((animal) => animal.letter === letter);
