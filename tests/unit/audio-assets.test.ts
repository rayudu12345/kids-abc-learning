import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
test("bundled recordings have attribution, allowed licenses and files", () => {
  const entries = JSON.parse(readFileSync(resolve("assets/audio/attribution.json"), "utf8"));
  const allowed = /^(Public domain|CC0|CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0))$/;
  assert.ok(entries.length >= 70);
  for (const entry of entries) {
    assert.match(entry.license, allowed);
    assert.ok(entry.artist && entry.changes);
    assert.match(entry.source, /^https:\/\/commons.wikimedia.org\//);
    assert.ok(existsSync(resolve("assets/audio", entry.file)));
  }
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    assert.ok(entries.some((entry: { id: string }) => entry.id === `letter-${letter}`));
  for (const id of ["sound-cat", "sound-dog", "sound-birds"])
    assert.ok(entries.some((entry: { id: string }) => entry.id === id));
});
