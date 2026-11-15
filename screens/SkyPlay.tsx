import React, { useEffect, useMemo, useState } from "react";
import { AppState, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import * as Audio from "../audio/speech";
import { SkyMode, FlyingSpeed, flyingLanes } from "../skyPlayLogic";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import ActionButton from "../components/ui/ActionButton";
import FeedbackMessage from "../components/ui/FeedbackMessage";
import useReducedMotion from "../hooks/useReducedMotion";
import FlyingToy from "../components/sky/FlyingToy";
export default function SkyPlay({ onExit }: { onExit: () => void }) {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [speed, setSpeed] = useState<FlyingSpeed>("gentle");
  const [session, setSession] = useState(0);
  const [mode, setMode] = useState<SkyMode>("balloons"),
    [muted, setMuted] = useState(false),
    [paused, setPaused] = useState(false),
    [background, setBackground] = useState(AppState.currentState !== "active");
  const [pops, setPops] = useState(0),
    [kites, setKites] = useState(0);
  const stageWidth = Math.max(200, width - 24),
    stageHeight = Math.max(300, Math.min(height - 360, 620));
  const lanes = useMemo(() => flyingLanes(stageWidth), [stageWidth]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setBackground(state !== "active");
      if (state !== "active") void Audio.stop();
    });
    return () => {
      subscription.remove();
      void Audio.stop();
    };
  }, []);
  const select = (next: SkyMode) => {
    void Audio.stop();
    setMode(next);
  };
  const restart = () => {
    void Audio.stop();
    setPops(0);
    setKites(0);
    setSession((value) => value + 1);
  };
  const hit = () => {
    if (mode === "balloons") setPops((value) => value + 1);
    else setKites((value) => value + 1);
    if (!muted) Audio.playEffect(mode === "balloons" ? "pop" : "kite");
  };
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ActivityToolbar
        onExit={onExit}
        muted={muted}
        soundLabel="Balloon and kite sounds"
        onToggleSound={() => {
          void Audio.stop();
          setMuted((value) => !value);
        }}
      />
      <Text style={styles.title}>🎈 Balloons and kites 🪁</Text>
      <View style={styles.controls}>
        <ActionButton
          accessibilityState={{ selected: mode === "balloons" }}
          onPress={() => select("balloons")}
          style={{ backgroundColor: "#FFE0ED" }}
        >
          🎈 Balloons
        </ActionButton>
        <ActionButton
          accessibilityState={{ selected: mode === "kites" }}
          onPress={() => select("kites")}
          style={{ backgroundColor: "#D4F4E4" }}
        >
          🪁 Kites
        </ActionButton>
        {reducedMotion ? (
          <Text style={styles.still}>🌼 Still play</Text>
        ) : (
          <>
            <ActionButton
              accessibilityRole="switch"
              accessibilityLabel="Gentle flying speed"
              accessibilityState={{ checked: speed === "gentle" }}
              aria-checked={speed === "gentle"}
              onPress={() => setSpeed((value) => (value === "gentle" ? "playful" : "gentle"))}
            >
              {speed === "gentle" ? "🐢 Gentle speed" : "🦋 Playful speed"}
            </ActionButton>
            <ActionButton onPress={() => setPaused((value) => !value)}>
              {paused ? "▶ Resume flying" : "⏸ Pause flying"}
            </ActionButton>
          </>
        )}
        <ActionButton onPress={restart}>🌈 Start again</ActionButton>
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.count}>
        {mode === "balloons" ? `Balloons popped: ${pops}` : `Kite taps: ${kites}`}
      </Text>
      <View style={[styles.sky, { width: stageWidth, height: stageHeight }]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Text style={styles.sun}>☀️</Text>
          <Text style={styles.cloudOne}>☁️</Text>
          <Text style={styles.cloudTwo}>☁️</Text>
          <View style={styles.hill} />
        </View>
        {lanes.map((lane) => (
          <FlyingToy
            key={`${session}-${mode}-${lane.id}`}
            mode={mode}
            lane={lane}
            laneCount={lanes.length}
            height={stageHeight}
            paused={paused || background || reducedMotion}
            reducedMotion={reducedMotion}
            speed={speed}
            onHit={hit}
          />
        ))}
      </View>
      <FeedbackMessage>
        {mode === "balloons"
          ? "Tap a flying balloon—POP! 🎉"
          : "Tap a kite for a happy sparkle! ✨"}
      </FeedbackMessage>
      <Text style={styles.note}>
        {reducedMotion
          ? "Still play follows your device’s reduce motion setting. Tap a toy to celebrate. "
          : "Gentle speed gives little fingers more time. Pause flying for easier tapping. "}
        No timer or penalties. Start again resets both counts; leaving also restarts this activity.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F0FBFF" },
  content: { alignItems: "center", padding: 12, paddingBottom: 28 },
  title: {
    fontSize: 27,
    fontWeight: "900",
    color: "#57388E",
    textAlign: "center",
    marginVertical: 14,
  },
  controls: { flexDirection: "row", flexWrap: "wrap", gap: 9, justifyContent: "center" },
  still: { fontSize: 18, color: "#267866", fontWeight: "800", padding: 13, marginVertical: 6 },
  count: {
    fontSize: 22,
    fontWeight: "900",
    color: "#267866",
    textAlign: "center",
    marginVertical: 12,
  },
  sky: {
    backgroundColor: "#BEEAFF",
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#8ECDE8",
    overflow: "hidden",
  },
  sun: { position: "absolute", right: 14, top: 8, fontSize: 54 },
  cloudOne: { position: "absolute", left: 12, top: 25, fontSize: 58, opacity: 0.9 },
  cloudTwo: { position: "absolute", right: 45, top: 115, fontSize: 48, opacity: 0.8 },
  hill: {
    position: "absolute",
    bottom: -60,
    left: -30,
    right: -30,
    height: 92,
    borderRadius: 100,
    backgroundColor: "#9DDCB4",
  },
  note: {
    color: "#615574",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginVertical: 8,
    maxWidth: 700,
  },
});
