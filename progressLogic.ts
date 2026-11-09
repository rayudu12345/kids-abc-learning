import { animalTraceIds } from "./traceCatalog";
export type Activity = "letters" | "matching";
export type Progress = {
  version: 1;
  stars: number;
  stickers: string[];
  completed: Record<Activity | "tracing", number>;
  tracedLetters: string[];
  tracedAnimals: string[];
};
const allowedLetters = new Set(["C", "D", "E", "F", "L", "P", "R", "Z"]);
export function emptyProgress(): Progress {
  return {
    version: 1,
    stars: 0,
    stickers: [],
    completed: { letters: 0, matching: 0, tracing: 0 },
    tracedLetters: [],
    tracedAnimals: [],
  };
}
function count(value: unknown): number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
export function readProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1)
    throw new Error("Unsupported progress data");
  const data = value as Partial<Progress>;
  return {
    version: 1,
    stars: count(data.stars),
    stickers: Array.isArray(data.stickers)
      ? [
          ...new Set(
            data.stickers.filter(
              (letter): letter is string =>
                typeof letter === "string" && allowedLetters.has(letter),
            ),
          ),
        ]
      : [],
    completed: {
      letters: count(data.completed?.letters),
      matching: count(data.completed?.matching),
      tracing: count(data.completed?.tracing),
    },
    tracedLetters: cleanIds(data.tracedLetters, new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))),
    tracedAnimals: cleanIds(data.tracedAnimals, animalTraceIds),
  };
}
export function addReward(
  progress: Progress,
  letter: string,
  activity: Activity,
  completed: boolean,
): Progress {
  if (!allowedLetters.has(letter)) return progress;
  return {
    ...progress,
    stars: progress.stars + 1,
    stickers: [...new Set([...progress.stickers, letter])],
    completed: {
      ...progress.completed,
      [activity]: progress.completed[activity] + (completed ? 1 : 0),
    },
  };
}

function cleanIds(value: unknown, allowed: Set<string>): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.has(id)))]
    : [];
}
export function addTracingReward(
  progress: Progress,
  id: string,
  kind: "letter" | "animal",
): Progress {
  const allowed =
    kind === "letter" ? new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")) : animalTraceIds;
  if (!allowed.has(id)) return progress;
  const sticker =
    kind === "animal"
      ? (
          { cat: "C", dog: "D", elephant: "E", fish: "F", lion: "L", rabbit: "R" } as Record<
            string,
            string
          >
        )[id]
      : undefined;
  return {
    ...progress,
    stars: progress.stars + 1,
    stickers: sticker ? [...new Set([...progress.stickers, sticker])] : progress.stickers,
    completed: { ...progress.completed, tracing: progress.completed.tracing + 1 },
    tracedLetters:
      kind === "letter" ? [...new Set([...progress.tracedLetters, id])] : progress.tracedLetters,
    tracedAnimals:
      kind === "animal" ? [...new Set([...progress.tracedAnimals, id])] : progress.tracedAnimals,
  };
}
