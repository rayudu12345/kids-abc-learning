import { selectClips } from "./clipSelection";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as DeviceSpeech from "expo-speech";
import { AudioController, Playback } from "./AudioController";
import { recordings } from "./recordings";
export type SpeechOptions = DeviceSpeech.SpeechOptions;
let configured = false;
function startClip(id: string): Playback {
  if (!(id in recordings)) throw new Error("Recording unavailable");
  if (!configured) {
    configured = true;
    void setAudioModeAsync({
      allowsRecording: false,
      shouldPlayInBackground: false,
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
    }).catch(() => {});
  }
  const player = createAudioPlayer(recordings[id], { updateInterval: 100 });
  player.volume = id.startsWith("sound-") ? 0.5 : 0.85;
  let settle: () => void = () => {};
  let finished = false;
  let listener: { remove: () => void } | undefined;
  let timeout: ReturnType<typeof setTimeout>;
  const cleanup = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    listener?.remove();
    try {
      player.pause();
      player.remove();
    } catch {
      /* Already released. */
    }
  };
  const promise = new Promise<void>((resolve, reject) => {
    settle = () => {
      cleanup();
      resolve();
    };
    listener = player.addListener("playbackStatusUpdate", (status) => {
      if (status.didJustFinish) settle();
    });
    timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Audio timed out"));
    }, 15000);
    try {
      player.play();
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
  return { finished: promise, stop: () => settle() };
}
const controller = new AudioController({ startClip, stopSpeech: () => DeviceSpeech.stop() });
export const stop = () => controller.stop().catch(() => {});
export const hasRecording = (id: string) => id in recordings;
export function playRecording(id: string, fallbackText = id) {
  void controller.play(hasRecording(id) ? [id] : [], () =>
    DeviceSpeech.speak(fallbackText, { language: "en-US", rate: 0.78 }),
  );
}
export function playSequence(ids: string[], fallbackText: string) {
  void controller.play(ids.every(hasRecording) ? ids : [], () =>
    DeviceSpeech.speak(fallbackText, { language: "en-US", rate: 0.78 }),
  );
}
export function speak(text: string, options: SpeechOptions = {}) {
  const clips = selectClips(text, hasRecording);
  void controller.play(clips, () => DeviceSpeech.speak(text, options));
}
