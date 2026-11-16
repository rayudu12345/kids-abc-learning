import { useEffect, useState } from "react";
import { AppState } from "react-native";
import * as Audio from "../audio/speech";
/** Small offline-only audio facade for play activities; no device-voice fallback. */
export default function useActivityAudio() {
  const [muted, setMuted] = useState(false);
  const [active, setActive] = useState(AppState.currentState === "active");
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setActive(state === "active");
      if (state !== "active") void Audio.stop();
    });
    return () => {
      subscription.remove();
      void Audio.stop();
    };
  }, []);
  const play = (ids: string[]) => {
    if (!muted && active && ids.every(Audio.hasRecording)) Audio.playSequence(ids, "");
  };
  const toggleSound = () => {
    void Audio.stop();
    setMuted((value) => !value);
  };
  return { muted, active, play, toggleSound, stop: Audio.stop };
}
