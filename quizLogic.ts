export const animals = [
  { letter: "C", word: "Cat", emoji: "🐱" },
  { letter: "D", word: "Dog", emoji: "🐶" },
  { letter: "E", word: "Elephant", emoji: "🐘" },
  { letter: "F", word: "Fish", emoji: "🐠" },
  { letter: "L", word: "Lion", emoji: "🦁" },
  { letter: "P", word: "Parrot", emoji: "🦜" },
  { letter: "R", word: "Rabbit", emoji: "🐇" },
  { letter: "Z", word: "Zebra", emoji: "🦓" },
];
export type Animal = (typeof animals)[number];
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function choicesFor(target: Animal): Animal[] {
  return shuffle([
    target,
    ...shuffle(animals.filter((a) => a.letter !== target.letter)).slice(0, 2),
  ]);
}
export function newLesson(): Animal[] {
  return shuffle(animals).slice(0, 5);
}
