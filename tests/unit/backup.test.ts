import test from "node:test";
import assert from "node:assert/strict";
import { createBackup, validateBackup, MAX_BACKUP_BYTES } from "../../backupLogic";
import { emptyProgress, addTracingReward } from "../../progressLogic";
test("valid backups round trip without losing old or new rewards", () => {
  const saved = addTracingReward(
    addTracingReward(emptyProgress(), "A", "letter"),
    "a",
    "lowercase",
  );
  assert.deepEqual(validateBackup(createBackup(saved)).progress, saved);
});
test("invalid backups reject before any data is changed", () => {
  const base = JSON.parse(createBackup(emptyProgress()));
  for (const change of [
    (b: any) => (b.backupVersion = 99),
    (b: any) => (b.progress.version = 99),
    (b: any) => (b.progress.stars = "9"),
    (b: any) => (b.progress.stars = -1),
    (b: any) => (b.progress.tracedLetters = ["?"]),
    (b: any) => (b.progress.tracedLowercase = ["a", "a"]),
    (b: any) => (b.exportedAt = "bad"),
  ]) {
    const data = structuredClone(base);
    change(data);
    assert.throws(() => validateBackup(JSON.stringify(data)));
  }
  assert.throws(() => validateBackup("{bad"));
  assert.throws(() => validateBackup(" ".repeat(MAX_BACKUP_BYTES + 1)));
});
test("older backup progress receives missing new fields safely", () => {
  const data = JSON.parse(createBackup(emptyProgress()));
  data.progress = { version: 1, stars: 7, stickers: ["C"], completed: { letters: 1, matching: 0 } };
  const saved = validateBackup(JSON.stringify(data)).progress;
  assert.equal(saved.stars, 7);
  assert.deepEqual(saved.tracedLowercase, []);
  assert.deepEqual(saved.stickers, ["C"]);
});
