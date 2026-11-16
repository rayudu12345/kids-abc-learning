import catalogue from "./memoryPhotos.json";
export type MemoryGroup = "all" | "farm" | "wild" | "water" | "birds";
export type MemoryAnimal = {
  id: string;
  word: string;
  emoji: string;
  group: Exclude<MemoryGroup, "all">;
  stickerLetter?: string;
  photo: { uri: string; creator: string; license: string; licenseUrl: string; sourceUrl: string };
};
export const memoryAnimals = catalogue as MemoryAnimal[];
export const memoryGroups: { id: MemoryGroup; name: string }[] = [
  { id: "all", name: "All animals" },
  { id: "farm", name: "Pets and farm" },
  { id: "wild", name: "Wild animals" },
  { id: "water", name: "Water animals" },
  { id: "birds", name: "Birds" },
];
export const memoryAnimalsFor = (group: MemoryGroup) =>
  memoryAnimals.filter((animal) => group === "all" || animal.group === group);
export const memoryPhotoUri = (animal: MemoryAnimal, attempt: number) =>
  animal.photo.uri + (attempt ? `?retry=${attempt}` : "");
