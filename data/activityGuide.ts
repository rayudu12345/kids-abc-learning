import type { Screen } from "./activities";
export type GuidedActivity = Exclude<Screen, "guide">;
export type GuideGroup = "learn" | "play" | "create" | "grownups";
export const guideGroups: { id: GuideGroup | "all"; label: string }[] = [
  { id: "all", label: "All options" },
  { id: "learn", label: "Learn" },
  { id: "play", label: "Play games" },
  { id: "create", label: "Create" },
  { id: "grownups", label: "With a grown-up" },
];
export const activityGuide: Record<
  GuidedActivity,
  { group: GuideGroup; instruction: string; onlinePhotos?: boolean }
> = {
  puzzles: {
    group: "play",
    instruction:
      "Start with two pieces, or choose up to thirty-six! Tap a piece and its space, or drag it there. Use Next pieces to see more pieces. The whole-picture hint can help. Finish the picture to earn a star!",
  },
  home: {
    group: "learn",
    instruction:
      "Tap a letter to meet its picture and hear its name. Tap Make it BIG to watch a larger animation. You can choose any letter!",
  },
  find: {
    group: "learn",
    instruction:
      "Listen to the letter. Tap the letter you hear. Take your time! The next question comes after a little celebration.",
  },
  match: {
    group: "play",
    instruction:
      "Find two pictures of the same animal. Drag an animal to its friend, or tap the animal and then its matching picture. Keep trying!",
  },
  traceLetters: {
    group: "learn",
    instruction:
      "Choose a big letter. Start at the purple dot and follow the path with your finger. You can lift your finger and keep going. Follow each stroke to earn a star!",
  },
  traceLowercase: {
    group: "learn",
    instruction:
      "Choose a little letter. Start at the purple dot and follow the moving guide with your finger. Lift and keep going whenever you need to!",
  },
  traceAnimals: {
    group: "create",
    instruction:
      "Choose an animal outline. Follow the purple dot and draw along its paths with your finger. Finish the strokes to earn a star!",
  },
  pairs: {
    group: "learn",
    instruction:
      "Find the little letter that belongs to the big letter. Tap your choice. A gentle hint helps you try again!",
  },
  phonics: {
    group: "learn",
    instruction:
      "Listen to the beginning sound of a word. Look at the animal pictures and choose the matching sound. Practice a few sounds at a time!",
  },
  counting: {
    group: "learn",
    instruction:
      "Tap each animal once to count it. When every animal has a number, choose how many you counted. Count slowly and listen!",
  },
  colorsShapes: {
    group: "learn",
    instruction:
      "Listen to a color or shape name. Drag the matching tile to its space, or tap the tile and then its matching space. Words and symbols can help!",
  },
  skyPlay: {
    group: "play",
    instruction:
      "Tap a flying balloon to pop it! Choose kites to make a happy sparkle. Try gentle speed, or pause the toys to make tapping easier!",
  },
  advanced: {
    group: "learn",
    instruction:
      "Explore some bigger words with a grown-up. Tap a letter to see a new object and hear about it. Make the picture bigger when you like!",
  },
  audio: {
    group: "learn",
    instruction:
      "Tap a letter, word or animal sound to listen. Listen again whenever you like, then try saying the word with your grown-up!",
  },
  animalSounds: {
    group: "play",
    instruction:
      "Listen to a real cat, dog, elephant, lion or parrot sound. Tap the animal that makes it! You can hear it again and keep trying. The next sound comes after a little cheer!",
  },
  memory: {
    group: "play",
    instruction:
      "Have a little peek at the animal cards. Turn over two cards and find the same animal! Peek again whenever you need help. Real photos need internet.",
    onlinePhotos: true,
  },
  eggs: {
    group: "play",
    instruction:
      "Tap an egg three times to discover an animal and its letter. Listen to the name. Another surprise will come after a little celebration!",
  },
  coloring: {
    group: "create",
    instruction:
      "Choose an animal, a color and a brush. Paint with your finger! Try the eraser or Undo. Pictures stay while this activity is open, so take a screenshot to keep one.",
  },
  paint: {
    group: "create",
    instruction:
      "Draw on your own page! Choose a brush, pencil, shape or color. Undo can bring back a change. Your latest picture saves here. Ask a grown-up to save a picture copy.",
  },
  stickers: {
    group: "play",
    instruction:
      "Look at the stars and animal stickers you have collected! Play learning games and trace pictures to make more discoveries.",
  },
  backup: {
    group: "grownups",
    instruction:
      "Ask a grown-up to help here. Save a progress backup outside this app. To restore, choose a backup, check the preview and confirm before replacing progress.",
  },
};
export const surpriseGames: GuidedActivity[] = [
  "puzzles",
  "find",
  "match",
  "animalSounds",
  "eggs",
  "skyPlay",
  "counting",
  "colorsShapes",
];
export function pickSurpriseGame(previous?: GuidedActivity): GuidedActivity {
  const choices = surpriseGames.filter((id) => id !== previous);
  return choices[Math.floor(Math.random() * choices.length)];
}
