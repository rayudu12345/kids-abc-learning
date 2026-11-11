import test from "node:test";
import assert from "node:assert/strict";
import { AudioController } from "../../audio/AudioController";
const tick = () => new Promise<void>((resolve) => setImmediate(() => resolve()));
test("new audio cancels the previous clip, and stop clears playback", async () => {
  const events: string[] = [];
  const pending = new Map<string, () => void>();
  const controller = new AudioController({
    stopSpeech: async () => {
      events.push("tts-stop");
    },
    startClip: (id) => {
      events.push(`play:${id}`);
      return {
        finished: new Promise<void>((resolve) => pending.set(id, resolve)),
        stop: () => {
          events.push(`stop:${id}`);
          pending.get(id)?.();
        },
      };
    },
  });
  const first = controller.play(["a", "b"]);
  await tick();
  const second = controller.play(["c"]);
  await tick();
  assert.ok(events.includes("stop:a"));
  assert.ok(!events.includes("play:b"));
  await controller.stop();
  await Promise.all([first, second]);
  assert.ok(events.includes("stop:c"));
});
test("late speech-stop completion cannot start stale audio", async () => {
  const resolvers: (() => void)[] = [];
  const plays: string[] = [];
  const controller = new AudioController({
    stopSpeech: () => new Promise<void>((resolve) => resolvers.push(resolve)),
    startClip: (id) => {
      plays.push(id);
      return { finished: Promise.resolve(), stop: () => {} };
    },
  });
  const first = controller.play(["old"]),
    second = controller.play(["new"]);
  resolvers[1]();
  await tick();
  resolvers[0]();
  await Promise.all([first, second]);
  assert.deepEqual(plays, ["new"]);
});
test("clip failures fall back safely and canceled requests never speak", async () => {
  let fallback = 0;
  const controller = new AudioController({
    stopSpeech: async () => {},
    startClip: () => {
      throw new Error("Missing asset");
    },
  });
  await controller.play(["missing"], () => fallback++);
  assert.equal(fallback, 1);
  const pending = controller.play([], () => fallback++);
  await controller.stop();
  await pending;
  assert.equal(fallback, 1);
});
test("unavailable device speech does not crash the app", async () => {
  const controller = new AudioController({
    stopSpeech: async () => {},
    startClip: () => {
      throw new Error("Unavailable");
    },
  });
  await assert.doesNotReject(
    controller.play([], () => {
      throw new Error("No device voice");
    }),
  );
});
