import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colorItems, shapeItems } from "../data/learningCatalog";
import { shuffle } from "../quizLogic";
import { findDropTarget, DropBox } from "../matchLogic";
import { tryLearningMatch } from "../learningMatchLogic";
import { useProgress } from "../ProgressStore";
import useAutoAdvance from "../hooks/useAutoAdvance";
import * as Audio from "../audio/speech";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import ActionButton from "../components/ui/ActionButton";
import FeedbackMessage from "../components/ui/FeedbackMessage";
import DraggableTile from "../components/ui/DraggableTile";
import LearningSwatch, { SwatchItem } from "../components/ui/LearningSwatch";
export default function ColorsShapes({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<"colors" | "shapes">("colors"),
    [round, setRound] = useState(0),
    [matched, setMatched] = useState<string[]>([]),
    [selected, setSelected] = useState<string | null>(null),
    [muted, setMuted] = useState(false),
    [dragging, setDragging] = useState(false),
    [finished, setFinished] = useState(false),
    [message, setMessage] = useState("Drag a tile to its matching name and picture.");
  const catalogue: readonly SwatchItem[] = mode === "colors" ? colorItems : shapeItems,
    items = catalogue.slice(round * 3, round * 3 + 3);
  const [targets, setTargets] = useState<SwatchItem[]>(() => shuffle(colorItems.slice(0, 3)));
  const matchedRef = useRef<string[]>([]);
  const refs = useRef<Record<string, React.ComponentRef<typeof View> | null>>({}),
    boxes = useRef<Record<string, DropBox>>({});
  const { recordLearning } = useProgress();
  const complete = matched.length === 3;
  const measure = () =>
    Object.entries(refs.current).forEach(([id, view]) =>
      view?.measureInWindow((x, y, width, height) => {
        boxes.current[id] = { x, y, width, height };
      }),
    );
  const hear = (id = items[0].id) => {
    if (!muted) Audio.playSequence(["match", id], `Match ${id}.`);
  };
  useEffect(() => {
    hear();
    return () => {
      void Audio.stop();
    };
  }, [mode, round, muted]);
  const reset = (nextMode = mode, nextRound = 0) => {
    void Audio.stop();
    setMode(nextMode);
    setRound(nextRound);
    setMatched([]);
    matchedRef.current = [];
    setSelected(null);
    boxes.current = {};
    setTargets(
      shuffle<SwatchItem>(
        (nextMode === "colors" ? colorItems : shapeItems).slice(nextRound * 3, nextRound * 3 + 3),
      ),
    );
    setFinished(false);
    setMessage("Drag a tile to its matching name and picture.");
  };
  const match = (id: string, target?: string) => {
    if (complete || matchedRef.current.includes(id)) return;
    const result = tryLearningMatch(
      matchedRef.current,
      id,
      target,
      items.map((item) => item.id),
    );
    if (!result.correct) {
      setSelected(id);
      setMessage(`Try the matching ${id} tile. Look at its name and symbol.`);
      hear(id);
      return;
    }
    matchedRef.current = result.matched;
    setMatched(result.matched);
    setSelected(null);
    recordLearning(mode, id, result.matched.length === 3 && round === 1);
    setMessage(
      result.matched.length === 3
        ? "All matched! Your next step is coming…"
        : `Wonderful! ${id} matches! One saved star! ⭐`,
    );
    hear(id);
  };
  useAutoAdvance(
    complete && !finished,
    () => {
      if (round === 1) setFinished(true);
      else reset(mode, round + 1);
    },
    2500,
  );
  return (
    <ScrollView
      scrollEnabled={!dragging}
      style={styles.page}
      contentContainerStyle={styles.content}
    >
      <ActivityToolbar
        onExit={onExit}
        muted={muted}
        onToggleSound={() => {
          void Audio.stop();
          setMuted((value) => !value);
        }}
      />
      <Text style={styles.title}>🎨 Colors and shapes</Text>
      <View style={styles.row}>
        <ActionButton onPress={() => reset("colors")}>🌈 Colors</ActionButton>
        <ActionButton onPress={() => reset("shapes")}>🔷 Shapes</ActionButton>
      </View>
      {finished ? (
        <>
          <Text style={styles.title}>⭐ Lovely matching! 🎉</Text>
          <Text style={styles.note}>Your {mode} discoveries are saved.</Text>
          <ActionButton onPress={() => reset()}>Play again</ActionButton>
        </>
      ) : (
        <>
          <Text style={styles.note}>
            {mode === "colors"
              ? "Match the color, name and symbol—not color alone."
              : "Match each shape to the same shape and name."}{" "}
            Drag, or tap a tile then tap its match.
          </Text>
          <Text style={styles.note}>
            Round {round + 1} of 2 · {matched.length} of 3 matched
          </Text>
          <ActionButton onPress={() => hear()}>🔊 Hear how to match</ActionButton>
          <View style={styles.board}>
            <View style={[styles.row, { zIndex: 10 }]}>
              {items.map((item) => (
                <DraggableTile
                  key={`${mode}-${round}-${item.id}`}
                  label={`Select ${item.name}`}
                  disabled={matched.includes(item.id)}
                  selected={selected === item.id}
                  onSelect={() => {
                    setSelected(item.id);
                    hear(item.id);
                  }}
                  onDrop={(x, y) => match(item.id, findDropTarget(boxes.current, x, y))}
                  onDrag={(active) => {
                    setDragging(active);
                    if (active) measure();
                  }}
                >
                  <LearningSwatch item={item} shape={mode === "shapes"} />
                  {matched.includes(item.id) && <Text>✓</Text>}
                </DraggableTile>
              ))}
            </View>
            <Text pointerEvents="none" style={styles.arrow}>
              ↓ ↓ ↓
            </Text>
            <View style={styles.row}>
              {targets.map((item) => (
                <View
                  key={`${mode}-${round}-${item.id}`}
                  ref={(view) => {
                    refs.current[item.id] = view;
                  }}
                  collapsable={false}
                  onLayout={measure}
                  style={{ flex: 1 }}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Match ${item.name}`}
                    accessibilityState={{ disabled: matched.includes(item.id) }}
                    disabled={matched.includes(item.id)}
                    onPress={() => {
                      if (selected) match(selected, item.id);
                      else setMessage("First tap a tile in the top row.");
                    }}
                    style={[
                      styles.target,
                      matched.includes(item.id) && {
                        backgroundColor: "#D4F4E4",
                        borderColor: "#2B946A",
                      },
                    ]}
                  >
                    <LearningSwatch item={item} shape={mode === "shapes"} />
                    {matched.includes(item.id) && <Text>Matched! ✓</Text>}
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
          <FeedbackMessage>{message}</FeedbackMessage>
        </>
      )}
      <Text style={styles.note}>
        Orange and oval prompts use the device voice. Download an offline English voice for these
        names.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F0FBFF" },
  content: { padding: 12, alignItems: "center", paddingBottom: 35 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#57388E",
    textAlign: "center",
    marginVertical: 16,
  },
  note: {
    fontSize: 16,
    color: "#615574",
    textAlign: "center",
    lineHeight: 24,
    marginVertical: 12,
    maxWidth: 760,
  },
  row: { width: "100%", flexDirection: "row", justifyContent: "center", gap: 10 },
  board: { width: "100%", maxWidth: 850, marginVertical: 15, overflow: "visible" },
  arrow: { fontSize: 36, color: "#AB92CE", textAlign: "center", paddingVertical: 20 },
  target: {
    minHeight: 145,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: "#B5A1CE",
    borderRadius: 24,
    padding: 8,
    backgroundColor: "#EEE7FA",
  },
});
