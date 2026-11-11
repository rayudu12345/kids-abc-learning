import { Progress, readProgress } from "./progressLogic";
import { animalTraceIds } from "./traceCatalog";
import { phonicsSounds, colorItems, shapeItems, countingNumbers } from "./data/learningCatalog";
export const MAX_BACKUP_BYTES = 200000;
export type ProgressBackup = {
  format: "kids-abc-progress-backup";
  backupVersion: 1;
  exportedAt: string;
  progress: Progress;
};
function object(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function validCount(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
export function validateBackup(text: string): ProgressBackup {
  if (
    Array.from(text).reduce((size, char) => {
      const code = char.codePointAt(0)!;
      return size + (code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4);
    }, 0) > MAX_BACKUP_BYTES
  )
    throw new Error("Backup is too large.");
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("This is not a valid JSON backup.");
  }
  if (!object(value) || value.format !== "kids-abc-progress-backup" || value.backupVersion !== 1)
    throw new Error("Unsupported backup format or version.");
  if (typeof value.exportedAt !== "string" || !Number.isFinite(Date.parse(value.exportedAt)))
    throw new Error("Backup date is invalid.");
  const data = value.progress;
  if (!object(data) || data.version !== 1 || !validCount(data.stars) || !object(data.completed))
    throw new Error("Backup progress is invalid.");
  for (const [key, count] of Object.entries(data.completed)) {
    if (
      !["letters", "matching", "tracing", "phonics", "counting", "colors", "shapes"].includes(
        key,
      ) ||
      !validCount(count)
    )
      throw new Error("Backup contains an invalid activity count.");
  }
  if (!validCount(data.completed.letters) || !validCount(data.completed.matching))
    throw new Error("Backup is missing activity counts.");
  const sets: Record<string, Set<string>> = {
    stickers: new Set(["C", "D", "E", "F", "L", "P", "R", "Z"]),
    tracedLetters: new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
    tracedLowercase: new Set("abcdefghijklmnopqrstuvwxyz"),
    tracedAnimals: animalTraceIds,
    learnedPhonics: new Set(phonicsSounds.map((item) => item.id)),
    practicedNumbers: new Set(countingNumbers.map(String)),
    practicedColors: new Set(colorItems.map((item) => item.id)),
    practicedShapes: new Set(shapeItems.map((item) => item.id)),
  };
  for (const [key, allowed] of Object.entries(sets)) {
    const list = data[key];
    if (list === undefined && key !== "stickers") continue;
    if (
      !Array.isArray(list) ||
      list.length > allowed.size ||
      new Set(list).size !== list.length ||
      list.some((id) => typeof id !== "string" || !allowed.has(id))
    )
      throw new Error(`Backup contains invalid ${key}.`);
  }
  return {
    format: "kids-abc-progress-backup",
    backupVersion: 1,
    exportedAt: value.exportedAt,
    progress: readProgress(JSON.stringify(data)),
  };
}
export function createBackup(progress: Progress, date = new Date()): string {
  const text = JSON.stringify(
    {
      format: "kids-abc-progress-backup",
      backupVersion: 1,
      exportedAt: date.toISOString(),
      progress,
    },
    null,
    2,
  );
  validateBackup(text);
  return text;
}
