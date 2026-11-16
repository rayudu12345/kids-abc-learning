import { useEffect, useMemo, useState } from "react";
import { Image } from "react-native";
import { MemoryCard } from "../memoryLogic";
import { memoryPhotoUri } from "../data/memoryAnimals";
export type PhotoStatus = "loading" | "ready" | "failed";
/** Preload each species once; never spend a child's preview time waiting on the network. */
export default function useMemoryPhotos(cards: MemoryCard[]) {
  const animals = useMemo(
    () => [...new Map(cards.map((card) => [card.animal.id, card.animal])).values()],
    [cards],
  );
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<Record<string, PhotoStatus>>({});
  useEffect(() => {
    let live = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setStatus(Object.fromEntries(animals.map((animal) => [animal.id, "loading"])));
    for (const animal of animals) {
      let settled = false;
      const finish = (result: PhotoStatus) => {
        if (!live || settled) return;
        settled = true;
        clearTimeout(timer);
        setStatus((current) => ({ ...current, [animal.id]: result }));
      };
      const timer = setTimeout(() => finish("failed"), 10000);
      timers.push(timer);
      // Web resolves with no value; native prefetch may explicitly return false.
      void Image.prefetch(memoryPhotoUri(animal, attempt)).then(
        (ok) => finish(ok !== false ? "ready" : "failed"),
        () => finish("failed"),
      );
    }
    return () => {
      live = false;
      timers.forEach(clearTimeout);
    };
  }, [animals, attempt]);
  const fail = (id: string) =>
    setStatus((current) => (current[id] === "failed" ? current : { ...current, [id]: "failed" }));
  return {
    animals,
    status,
    attempt,
    fail,
    ready: animals.every(
      (animal) => status[animal.id] === "ready" || status[animal.id] === "failed",
    ),
    failed: animals.some((animal) => status[animal.id] === "failed"),
    retry: () => setAttempt((value) => value + 1),
  };
}
