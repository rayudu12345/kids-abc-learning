import TraceCanvas from "./components/tracing/TraceCanvas";
import TracingPicker from "./components/tracing/TracingPicker";
import { colors, inks } from "./components/tracing/traceTheme";
import useAutoAdvance from "./hooks/useAutoAdvance";
import ActivityToolbar from "./components/ui/ActivityToolbar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import * as Speech from "./audio/speech";
import { advanceTrace } from "./tracingLogic";
import { Point, animalTraces, letterTraces, lowercaseTraces, sampledStrokes } from "./traceCatalog";
import { useProgress } from "./ProgressStore";
export default function TraceLetters({
  onExit,
  initialMode = "letter",
}: {
  onExit: () => void;
  initialMode?: "letter" | "lowercase" | "animal";
}) {
  const { width, height } = useWindowDimensions();
  const { progress, recordTracing, saveError } = useProgress();
  const size = Math.max(180, Math.min(width - 32, height * 0.54, 600));
  const scale = size / 300;
  const [mode, setMode] = useState(initialMode);
  const [index, setIndex] = useState(0);
  const [stroke, setStroke] = useState(0);
  const [visited, setVisited] = useState(0);
  const [won, setWon] = useState(false);
  const [finished, setFinished] = useState(false);
  const [muted, setMuted] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [revision, setRevision] = useState(0);
  const [hint, setHint] = useState("Start at the purple dot and follow the colorful path.");
  const items =
    mode === "letter" ? letterTraces : mode === "lowercase" ? lowercaseTraces : animalTraces;
  const item = items[index];
  const article = /^[aeiou]/i.test(item.name) ? "an" : "a";
  const strokes = useMemo(() => sampledStrokes(item), [item]);
  const current = strokes[stroke] ?? strokes[0];
  const visitedRef = useRef(0);
  const previous = useRef<Point | null>(null);
  const locked = useRef(false);
  const pendingStroke = useRef<number | null>(null);
  const guide = useRef(new Animated.Value(0)).current;
  const say = (text: string) => {
    Speech.stop();
    if (!muted) Speech.speak(text, { language: "en-US", rate: 0.78 });
  };
  useEffect(() => {
    if (!muted && !finished)
      Speech.speak(`Let's trace ${item.name}. Start at the purple dot.`, {
        language: "en-US",
        rate: 0.78,
      });
    return () => {
      Speech.stop();
    };
  }, [item.id, muted, finished]);
  useEffect(() => {
    guide.setValue(0);
    if (won || finished) return;
    const loop = Animated.loop(
      Animated.timing(guide, { toValue: 1, duration: current.length * 65, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [item.id, stroke, won, finished, revision, guide]);
  const reset = () => {
    previous.current = null;
    visitedRef.current = 0;
    locked.current = false;
    pendingStroke.current = null;
    setStroke(0);
    setVisited(0);
    setWon(false);
    setDrawing(false);
    setFinished(false);
    setRevision((r) => r + 1);
    setHint("Start at the purple dot and follow the colorful path.");
  };
  const select = (next: number, nextMode = mode) => {
    Speech.stop();
    setMode(nextMode);
    setIndex(next);
    reset();
  };
  useAutoAdvance(
    won && !finished,
    () => {
      if (index === items.length - 1) setFinished(true);
      else {
        setIndex((i) => i + 1);
        reset();
      }
    },
    2500,
  );
  const touch = (event: GestureResponderEvent) => {
    if (locked.current || won) return;
    const point = {
      x: event.nativeEvent.locationX / scale,
      y: event.nativeEvent.locationY / scale,
    };
    const next = advanceTrace(current, visitedRef.current, point, previous.current);
    previous.current = point;
    if (next === visitedRef.current) return;
    visitedRef.current = next;
    setVisited(next);
    if (next === current.length) {
      previous.current = null;
      locked.current = true;
      if (stroke === strokes.length - 1) {
        setWon(true);
        setDrawing(false);
        recordTracing(item.id, item.kind);
        setHint(`Wonderful! You traced ${item.name}! One saved star! ⭐`);
        say(`Wonderful! You traced ${item.name}!`);
      } else {
        pendingStroke.current = stroke + 1;
        setHint("Great! Lift your finger, then start at the next purple dot.");
        say("Great! Lift your finger and find the next purple dot.");
      }
    }
  };
  const release = () => {
    previous.current = null;
    setDrawing(false);
    if (pendingStroke.current !== null) {
      setStroke(pendingStroke.current);
      pendingStroke.current = null;
      locked.current = false;
      visitedRef.current = 0;
      setVisited(0);
    }
  };
  const completed =
    item.kind === "letter"
      ? progress.tracedLetters
      : item.kind === "lowercase"
        ? progress.tracedLowercase
        : progress.tracedAnimals;
  const percent = Math.round(
    ((strokes.slice(0, stroke).reduce((sum, points) => sum + points.length, 0) + visited) /
      strokes.reduce((sum, points) => sum + points.length, 0)) *
      100,
  );
  return (
    <ScrollView scrollEnabled={!drawing} style={styles.page} contentContainerStyle={styles.content}>
      <ActivityToolbar
        onExit={onExit}
        muted={muted}
        soundLabel="Spoken tracing instructions"
        onToggleSound={() => {
          Speech.stop();
          setMuted((value) => !value);
        }}
      />
      <Text style={styles.title}>🌈 Trace and discover!</Text>
      <View style={styles.tabs}>
        {(["letter", "lowercase", "animal"] as const).map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === tab }}
            onPress={() => select(0, tab)}
            style={[
              styles.tab,
              { backgroundColor: tab === "letter" ? "#D7F3FF" : "#FFE0ED" },
              mode === tab && styles.tabSelected,
            ]}
          >
            <Text style={styles.buttonText}>
              {tab === "letter"
                ? "🔤 Letters A–Z"
                : tab === "lowercase"
                  ? "✍️ Lowercase a–z"
                  : "🐾 Animals"}
            </Text>
          </Pressable>
        ))}
      </View>
      {mode === "lowercase" && (
        <Text style={styles.subtitle}>
          Simple handwriting forms, including single-storey a and g.
        </Text>
      )}
      {finished ? (
        <>
          <Text style={styles.bigStars}>⭐ 🎉 ⭐</Text>
          <Text style={styles.message}>Lovely tracing! Explore more or take a little break.</Text>
          <Text style={styles.subtitle}>
            {completed.length} of {items.length} {mode !== "animal" ? "letters" : "animals"} traced
            and saved
          </Text>
          <Pressable accessibilityRole="button" onPress={() => select(0)} style={styles.primary}>
            <Text style={styles.primaryText}>Explore again</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => select(0, mode === "letter" ? "animal" : "letter")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {mode === "letter" ? "Try animal tracing 🐾" : "Try letter tracing 🔤"}
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={[styles.itemTitle, { color: inks[index % inks.length] }]}>
            {mode !== "animal"
              ? `Let's trace ${item.name}`
              : `${item.icon} Let's draw ${article} ${item.name.toLowerCase()}!`}
          </Text>
          <Text style={styles.subtitle}>
            {index + 1} / {items.length} · Stroke {stroke + 1} of {strokes.length}
            {completed.includes(item.id) ? " · Traced before ✓" : ""}
          </Text>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: percent }}
            accessibilityLabel="Tracing progress"
            style={styles.progress}
          >
            <View
              style={{
                width: `${percent}%`,
                height: 10,
                borderRadius: 6,
                backgroundColor: "#27A783",
              }}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              say(
                `Trace ${item.name}. Start at the purple dot, and follow the path with your finger.`,
              )
            }
            style={styles.button}
          >
            <Text style={styles.buttonText}>🔊 Hear how to trace</Text>
          </Pressable>
          <TraceCanvas
            item={item}
            strokes={strokes}
            stroke={stroke}
            visited={visited}
            won={won}
            guide={guide}
            size={size}
            backgroundColor={colors[index % colors.length]}
            onStart={(event) => {
              setDrawing(true);
              previous.current = null;
              touch(event);
            }}
            onMove={touch}
            onEnd={release}
          />
          <Text accessibilityLiveRegion="polite" style={styles.message}>
            {hint}
          </Text>
          {!won && (
            <Pressable accessibilityRole="button" onPress={reset} style={styles.button}>
              <Text style={styles.buttonText}>↻ Try this tracing again</Text>
            </Pressable>
          )}
          <Text style={styles.subtitle}>
            {won
              ? "Your next tracing is coming…"
              : "Follow the path. Lift your finger whenever you need to."}
          </Text>
        </>
      )}
      <TracingPicker
        mode={mode}
        items={items}
        index={index}
        completed={completed}
        onSelect={select}
      />
      <Text style={styles.subtitle}>
        {saveError
          ? "Your latest reward could not be saved. Try saving again from My sticker book."
          : `Saved: ${progress.tracedLetters.length}/26 letters · ${progress.tracedAnimals.length}/{animalTraces.length} animal outlines`}
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F0FBFF" },
  content: { padding: 12, alignItems: "center", paddingBottom: 30 },
  button: {
    padding: 13,
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "#EEE8FF",
    marginVertical: 6,
  },
  buttonText: { fontSize: 16, fontWeight: "800", color: "#58369e", textAlign: "center" },
  title: { color: "#57388E", fontSize: 28, fontWeight: "900", textAlign: "center", marginTop: 16 },
  itemTitle: { fontSize: 26, fontWeight: "900", textAlign: "center", marginTop: 15 },
  subtitle: { color: "#6B647E", textAlign: "center", fontSize: 15, marginVertical: 10 },
  tabs: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
  },
  tab: { padding: 14, borderRadius: 20, borderWidth: 3, borderColor: "transparent" },
  tabSelected: { borderColor: "#7751C5" },
  progress: {
    height: 10,
    width: "85%",
    maxWidth: 600,
    backgroundColor: "#DFD6EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  message: {
    color: "#5E4980",
    fontWeight: "800",
    fontSize: 19,
    textAlign: "center",
    marginVertical: 14,
  },
  bigStars: { fontSize: 55, marginTop: 35 },
  primary: { padding: 18, backgroundColor: "#6946BC", borderRadius: 24, marginVertical: 15 },
  primaryText: { fontSize: 20, color: "white", fontWeight: "800" },
});
