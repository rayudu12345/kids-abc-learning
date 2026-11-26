import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { AnimalArt, AnimatedAnimal } from "../AnimalArt";
import { DropBox, findDropTarget } from "../matchLogic";
import { puzzlePartName, puzzleSlice } from "../puzzleLogic";
import { activityGuide } from "../data/activityGuide";
import useAnimalPuzzle from "../hooks/useAnimalPuzzle";
import PuzzlePieceArt from "../components/puzzles/PuzzlePieceArt";
import DraggablePuzzlePiece from "../components/puzzles/DraggablePuzzlePiece";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import ActionButton from "../components/ui/ActionButton";
import FeedbackMessage from "../components/ui/FeedbackMessage";
export default function AnimalPuzzles({ onExit }: { onExit: () => void }) {
  const game = useAnimalPuzzle(),
    latest = useRef(game);
  latest.current = game;
  const { width, height } = useWindowDimensions();
  const size = Math.max(220, Math.min(width - 36, height * 0.34, 400));
  const [dragging, setDragging] = useState(false),
    [showPicture, setShowPicture] = useState(false);
  const targets = useRef<Record<string, React.ComponentRef<typeof View> | null>>({}),
    live = useRef(true);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  const drop = async (piece: number, x: number, y: number) => {
    const generation = latest.current.generation.current;
    const boxes = await Promise.all(
      Object.entries(targets.current).map(
        ([id, view]) =>
          new Promise<[string, DropBox]>((resolve) => {
            const empty = { x: 0, y: 0, width: 0, height: 0 };
            if (!view) {
              resolve([id, empty]);
              return;
            }
            const timer = setTimeout(() => resolve([id, empty]), 400);
            view.measureInWindow((left, top, w, h) => {
              clearTimeout(timer);
              resolve([id, { x: left, y: top, width: w, height: h }]);
            });
          }),
      ),
    );
    if (!live.current || generation !== latest.current.generation.current) return;
    const slot = findDropTarget(Object.fromEntries(boxes), x, y);
    if (slot !== undefined) latest.current.place(piece, Number(slot));
  };
  return (
    <ScrollView
      style={styles.page}
      scrollEnabled={!dragging}
      contentContainerStyle={styles.content}
    >
      <ActivityToolbar
        onExit={onExit}
        muted={game.audio.muted}
        onToggleSound={game.audio.toggleSound}
        soundLabel="Puzzle sounds"
      />
      <Text style={styles.title}>🧩 Animal picture puzzles</Text>
      <View style={styles.row}>
        {([2, 4] as const).map((parts) => (
          <ActionButton
            key={parts}
            accessibilityState={{ selected: game.board.parts === parts }}
            onPress={() => game.restart(parts)}
          >{`${parts} pieces`}</ActionButton>
        ))}
        <ActionButton
          onPress={() => game.audio.introduce(activityGuide.puzzles.instruction)}
          disabled={game.audio.muted}
        >
          🔊 Hear how to play
        </ActionButton>
      </View>
      {game.finished ? (
        <>
          <AnimatedAnimal letter={game.animal.letter} size={190} />
          <FeedbackMessage>Three pictures built! Your three stars are saved! ⭐</FeedbackMessage>
          <ActionButton onPress={() => game.restart(game.board.parts)}>
            🌈 Play puzzles again
          </ActionButton>
        </>
      ) : (
        <>
          <Text style={styles.round}>
            Picture {game.index + 1} of 3 · Pieces {game.board.placed.length} of {game.board.parts}
          </Text>
          <Text testID="puzzle-animal" style={styles.name}>
            {game.animal.word}
          </Text>
          <ActionButton onPress={() => setShowPicture((value) => !value)}>
            {showPicture ? "Hide whole picture" : "Show whole picture"}
          </ActionButton>
          {showPicture && <AnimalArt letter={game.animal.letter} size={120} />}
          <View
            style={{
              width: size,
              height: size,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {Array.from({ length: game.board.parts }, (_, slot) => {
              const box = puzzleSlice(game.board.parts, slot, size),
                placed = game.board.placed.includes(slot),
                highlighted = game.board.hint === slot;
              return (
                <Pressable
                  key={slot}
                  ref={(view) => {
                    targets.current[String(slot)] = view;
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Puzzle space ${slot + 1}: ${puzzlePartName(game.board.parts, slot)}`}
                  accessibilityState={{ disabled: placed || game.board.selected === null }}
                  disabled={placed || game.board.selected === null}
                  onPress={() => {
                    if (game.board.selected !== null) game.place(game.board.selected, slot);
                  }}
                  style={{
                    position: "absolute",
                    left: box.x,
                    top: box.y,
                    width: box.width,
                    height: box.height,
                    borderWidth: highlighted ? 4 : 2,
                    borderColor: highlighted ? "#D39225" : placed ? "#299D7C" : "#B6A3D2",
                    overflow: "hidden",
                  }}
                >
                  <PuzzlePieceArt
                    letter={game.animal.letter}
                    parts={game.board.parts}
                    piece={slot}
                    size={size}
                    faded={!placed}
                  />
                  {(placed || highlighted) && (
                    <Text style={styles.badge}>{placed ? "✓" : "⭐"}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
          <FeedbackMessage>
            {game.complete
              ? "Beautiful picture! One saved star! ⭐"
              : game.board.hint !== null
                ? `Try the highlighted space: ${puzzlePartName(game.board.parts, game.board.hint)}.`
                : "Tap a piece, then its space. Or drag it there!"}
          </FeedbackMessage>
          <View style={[styles.row, styles.tray]}>
            {game.board.order.map((piece) => (
              <DraggablePuzzlePiece
                key={`${game.generation.current}-${piece}`}
                piece={piece}
                parts={game.board.parts}
                letter={game.animal.letter}
                name={game.animal.word}
                selected={game.board.selected === piece}
                disabled={game.board.placed.includes(piece)}
                onSelect={game.select}
                onDrop={(id, x, y) => {
                  void drop(id, x, y);
                }}
                onDrag={setDragging}
              />
            ))}
          </View>
        </>
      )}
      <Text style={styles.note}>
        No timer or penalties. A whole-picture hint is always here to help.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F0FBFF" },
  content: { padding: 14, alignItems: "center", paddingBottom: 30 },
  title: {
    fontSize: 27,
    color: "#57388E",
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 14,
  },
  row: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 9 },
  tray: { zIndex: 20, marginTop: 8 },
  round: { fontSize: 19, color: "#9C3868", fontWeight: "800", marginTop: 8 },
  name: { fontSize: 24, color: "#267866", fontWeight: "900", marginTop: 7 },
  badge: {
    position: "absolute",
    right: 5,
    top: 5,
    fontSize: 22,
    color: "#267866",
    fontWeight: "900",
  },
  note: { color: "#615574", fontSize: 17, textAlign: "center", marginVertical: 15 },
});
