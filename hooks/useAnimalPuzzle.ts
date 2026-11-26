import { useRef, useState } from "react";
import { animals, shuffle } from "../quizLogic";
import { newPuzzle, placePuzzle, selectPuzzle, PuzzleState } from "../puzzleLogic";
import { useProgress } from "../ProgressStore";
import useActivityAudio from "./useActivityAudio";
import useAutoAdvance from "./useAutoAdvance";
export default function useAnimalPuzzle() {
  const [lesson, setLesson] = useState(() => shuffle(animals).slice(0, 3)),
    [index, setIndex] = useState(0);
  const [board, setBoard] = useState(() => newPuzzle(2)),
    current = useRef(board);
  const [finished, setFinished] = useState(false),
    generation = useRef(0);
  const { recordAnswer } = useProgress(),
    audio = useActivityAudio();
  const animal = lesson[index],
    complete = board.placed.length === board.parts;
  const update = (next: PuzzleState) => {
    if (next !== current.current) {
      current.current = next;
      setBoard(next);
    }
  };
  const select = (id: number) => {
    if (audio.active && !finished) update(selectPuzzle(current.current, id));
  };
  const place = (piece: number, slot: number) => {
    if (!audio.active || finished) return;
    const before = current.current,
      next = placePuzzle(before, piece, slot);
    if (next === before) return;
    update(next);
    if (before.placed.length < next.parts && next.placed.length === next.parts) {
      recordAnswer(animal.letter, "matching", index === lesson.length - 1);
      audio.play([animal.word.toLowerCase()]);
    }
  };
  const restart = (parts: 2 | 4) => {
    generation.current++;
    void audio.stop();
    setLesson(shuffle(animals).slice(0, 3));
    setIndex(0);
    update(newPuzzle(parts));
    setFinished(false);
  };
  useAutoAdvance(
    complete && !finished && audio.active,
    () => {
      generation.current++;
      if (index === lesson.length - 1) setFinished(true);
      else {
        setIndex((value) => value + 1);
        update(newPuzzle(current.current.parts));
      }
    },
    2600,
  );
  return { board, animal, index, complete, finished, select, place, restart, generation, audio };
}
