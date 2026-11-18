import { STUDIO_KEY, StudioDocument, readStudio } from "./studioLogic";
type Storage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
};
/** Serialize writes so an older save cannot overwrite a newer picture. */
export function createStudioPersistence(storage: Storage) {
  let queue: Promise<unknown> = Promise.resolve();
  return {
    load: async () => {
      await queue.catch(() => {});
      return readStudio(await storage.getItem(STUDIO_KEY));
    },
    save: (doc: StudioDocument) => {
      let raw: string;
      try {
        raw = JSON.stringify(readStudio(JSON.stringify(doc)));
      } catch (error) {
        return Promise.reject(error);
      }
      const task = queue.catch(() => {}).then(() => storage.setItem(STUDIO_KEY, raw));
      queue = task;
      return task;
    },
  };
}
