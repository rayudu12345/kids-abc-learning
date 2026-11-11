export const phonicsSounds = [
  {
    id: "M",
    sound: "mmm",
    word: "Monkey",
    icon: "🐵",
    audio: "monkey",
    guide: "Close your lips and hum gently.",
  },
  {
    id: "S",
    sound: "sss",
    word: "Snake",
    icon: "🐍",
    audio: "snake",
    guide: "Let air hiss gently past your teeth.",
  },
  {
    id: "F",
    sound: "fff",
    word: "Fish",
    icon: "🐠",
    audio: "fish",
    guide: "Rest your top teeth on your lower lip and blow softly.",
  },
  {
    id: "N",
    sound: "nnn",
    word: "Newt",
    icon: "🦎",
    audio: "newt",
    guide: "Touch your tongue behind your top teeth and hum.",
  },
  {
    id: "L",
    sound: "lll",
    word: "Lion",
    icon: "🦁",
    audio: "lion",
    guide: "Touch your tongue behind your top teeth and let your voice flow.",
  },
  {
    id: "V",
    sound: "vvv",
    word: "Vulture",
    icon: "🦅",
    audio: "vulture",
    guide: "Rest your teeth on your lower lip and make a gentle buzz.",
  },
] as const;
export const countingNumbers = Array.from({ length: 10 }, (_, index) => index + 1);
export const numberWords = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];
export const colorItems = [
  { id: "red", name: "Red", color: "#E54B58", symbol: "♥" },
  { id: "blue", name: "Blue", color: "#347EC4", symbol: "☂" },
  { id: "yellow", name: "Yellow", color: "#E9BA2B", symbol: "☀" },
  { id: "green", name: "Green", color: "#2B946A", symbol: "♣" },
  { id: "orange", name: "Orange", color: "#DF812F", symbol: "◆" },
  { id: "purple", name: "Purple", color: "#8C5CC0", symbol: "☾" },
] as const;
export const shapeItems = [
  { id: "circle", name: "Circle", symbol: "●", color: "#E66083" },
  { id: "square", name: "Square", symbol: "■", color: "#3EA6C3" },
  { id: "triangle", name: "Triangle", symbol: "▲", color: "#8E6DC4" },
  { id: "rectangle", name: "Rectangle", symbol: "▬", color: "#38A887" },
  { id: "star", name: "Star", symbol: "★", color: "#E2AC27" },
  { id: "oval", name: "Oval", symbol: "⬭", color: "#DF805B" },
] as const;
export type LearningActivity = "phonics" | "counting" | "colors" | "shapes";
export function validLearningId(activity: LearningActivity, id: string) {
  if (activity === "phonics") return phonicsSounds.some((item) => item.id === id);
  if (activity === "counting") return countingNumbers.some((number) => String(number) === id);
  return (activity === "colors" ? colorItems : shapeItems).some((item) => item.id === id);
}
