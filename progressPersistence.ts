import { Progress, readProgress } from "./progressLogic";
export const PROGRESS_STORAGE_KEY = "@kids-abc/progress/v1";
export type ProgressStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
};
/** Keep writes ordered and allow a new save after an earlier storage failure. */
export function createProgressPersistence(storage: ProgressStorage) {
  let pending: Promise<unknown> = Promise.resolve();
  return {
    async load(): Promise<Progress> {
      return readProgress(await storage.getItem(PROGRESS_STORAGE_KEY));
    },
    save(progress: Progress): Promise<unknown> {
      const write = pending.then(() =>
        storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress)),
      );
      pending = write.catch(() => undefined);
      return write;
    },
  };
}
