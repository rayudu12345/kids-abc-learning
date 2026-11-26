import { useEffect, useState } from "react";
import { AppState } from "react-native";
import * as Audio from "../audio/speech";
/** Shared play audio: bundled clips, with optional device speech for new animal names. */
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
  const say = (name: string) => {
    if (muted || !active) return;
    const id = name.toLowerCase();
    if (Audio.hasRecording(id)) Audio.playRecording(id);
    else Audio.speak(name, { language: "en-US", rate: 0.78 });
  };
  const introduce = (text: string) => {
    if (!muted && active) Audio.narrate(text);
  };
  const toggleSound = () => {
    void Audio.stop();
    setMuted((value) => !value);
  };
  return { muted, active, play, say, introduce, toggleSound, stop: Audio.stop };
}
