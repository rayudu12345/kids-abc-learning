import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import * as Audio from "../audio/speech";
import { newSoundLesson, soundAnswer } from "../animalSoundLogic";
import { useProgress } from "../ProgressStore";
import useAutoAdvance from "./useAutoAdvance";

export default function useAnimalSoundGame() {
  const { recordAnswer } = useProgress();
  const [lesson, setLesson] = useState(newSoundLesson);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [won, setWon] = useState(false);
  const [hint, setHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [active, setActive] = useState(AppState.currentState === "active");
  const lock = useRef(false);
  const round = lesson[index];
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
  useEffect(() => {
    if (active && !muted && !won && !finished)
      Audio.playSequence(["listen", round.target.clip], "Listen to the animal sound.");
    return () => {
      void Audio.stop();
    };
  }, [active, muted, won, finished, round]);
  const replay = () => {
    if (active && !muted && !lock.current && !finished) Audio.playRecording(round.target.clip);
  };
  const choose = (letter: string) => {
    if (!active || finished) return;
    const result = soundAnswer(round.target.letter, letter, lock.current);
    if (result === "ignored") return;
    if (result === "retry") {
      setHint(true);
      replay();
      return;
    }
    lock.current = true;
    void Audio.stop();
    setWon(true);
    // Picture matching and sound matching both contribute to matching adventures.
    recordAnswer(round.target.letter, "matching", index === lesson.length - 1);
  };
  useAutoAdvance(
    won && !finished && active,
    () => {
      if (index === lesson.length - 1) setFinished(true);
      else {
        setIndex((value) => value + 1);
        setWon(false);
        setHint(false);
        lock.current = false;
      }
    },
    2200,
  );
  const restart = () => {
    void Audio.stop();
    setLesson(newSoundLesson());
    setIndex(0);
    setWon(false);
    setHint(false);
    setFinished(false);
    lock.current = false;
  };
  const toggleSound = () => {
    void Audio.stop();
    setMuted((value) => !value);
  };
  return {
    round,
    index,
    total: lesson.length,
    muted,
    won,
    hint,
    finished,
    choose,
    replay,
    restart,
    toggleSound,
  };
}
