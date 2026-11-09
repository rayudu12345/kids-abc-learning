import test from "node:test";
import assert from "node:assert/strict";
import { createProgressPersistence, PROGRESS_STORAGE_KEY } from "../../progressPersistence";
import { addReward, emptyProgress } from "../../progressLogic";

test("storage adapter loads existing rewards", async () => {
  const saved = addReward(emptyProgress(), "C", "letters", true);
  const store = createProgressPersistence({
    getItem: async (key) => {
      assert.equal(key, PROGRESS_STORAGE_KEY);
      return JSON.stringify(saved);
    },
    setItem: async () => undefined,
  });
  assert.deepEqual(await store.load(), saved);
});
test("writes are serialized so an older save cannot overwrite a newer reward", async () => {
  const calls: number[] = [];
  let releaseFirst!: () => void;
  const gate = new Promise<void>((resolve) => {
    releaseFirst = resolve;
  });
  const store = createProgressPersistence({
    getItem: async () => null,
    setItem: async (_, raw) => {
      const stars = JSON.parse(raw).stars;
      calls.push(stars);
      if (stars === 1) await gate;
    },
  });
  const first = store.save({ ...emptyProgress(), stars: 1 });
  const second = store.save({ ...emptyProgress(), stars: 2 });
  await new Promise<void>((resolve) => setImmediate(() => resolve()));
  assert.deepEqual(calls, [1]);
  releaseFirst();
  await Promise.all([first, second]);
  assert.deepEqual(calls, [1, 2]);
});
test("a failed write rejects to the caller but does not block retry", async () => {
  let fail = true;
  let raw: string | null = null;
  const store = createProgressPersistence({
    getItem: async () => raw,
    setItem: async (_, value) => {
      if (fail) {
        fail = false;
        throw new Error("Disk full");
      }
      raw = value;
    },
  });
  const saved = addReward(emptyProgress(), "R", "letters", false);
  await assert.rejects(store.save(saved), /Disk full/);
  await store.save(saved);
  assert.deepEqual(await store.load(), saved);
});
test("read failures are surfaced without writing or discarding stored data", async () => {
  let writes = 0;
  const store = createProgressPersistence({
    getItem: async () => {
      throw new Error("Storage unavailable");
    },
    setItem: async () => {
      writes++;
    },
  });
  await assert.rejects(store.load(), /Storage unavailable/);
  assert.equal(writes, 0);
});
