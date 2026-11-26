import test from "node:test";
import assert from "node:assert/strict";
import { activities } from "../../data/activities";
import { activityGuide, pickSurpriseGame, surpriseGames } from "../../data/activityGuide";
test("every activity has a useful introduction and a browsing group", () => {
  assert.deepEqual(
    Object.keys(activityGuide).sort(),
    activities
      .filter((activity) => activity.id !== "guide")
      .map((activity) => activity.id)
      .sort(),
  );
  for (const guide of Object.values(activityGuide))
    assert.ok(guide.instruction.length > 60 && guide.instruction.length < 400);
  assert.equal(activityGuide.backup.group, "grownups");
  assert.equal(activityGuide.memory.onlinePhotos, true);
});
test("surprise games avoid adult tools, online photos and immediate repeats", () => {
  for (const previous of surpriseGames)
    for (let count = 0; count < 15; count++) {
      const next = pickSurpriseGame(previous);
      assert.notEqual(next, previous);
      assert.ok(surpriseGames.includes(next));
      assert.notEqual(activityGuide[next].group, "grownups");
      assert.ok(!activityGuide[next].onlinePhotos);
    }
});
