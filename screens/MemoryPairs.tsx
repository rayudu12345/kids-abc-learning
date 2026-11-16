import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { flipMemory, memoryMismatch, newMemory } from "../memoryLogic";
import { useProgress } from "../ProgressStore";
import useActivityAudio from "../hooks/useActivityAudio";
import useAutoAdvance from "../hooks/useAutoAdvance";
import MemoryTile from "../components/memory/MemoryTile";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import ActionButton from "../components/ui/ActionButton";
import FeedbackMessage from "../components/ui/FeedbackMessage";
export default function MemoryPairs({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState(() => newMemory(2)),
    current = useRef(state);
  const [peek, setPeek] = useState(true);
  const { recordAnswer } = useProgress(),
    audio = useActivityAudio();
  const pairs = state.cards.length / 2,
    finished = state.matched.length === pairs;
  const update = (next: typeof state) => {
    current.current = next;
    setState(next);
  };
  const reset = (count: number) => {
    void audio.stop();
    update(newMemory(count));
    setPeek(true);
  };
  const choose = (id: number) => {
    if (peek || !audio.active) return;
    const before = current.current,
      next = flipMemory(before, id);
    if (next === before) return;
    update(next);
    if (next.matched.length > before.matched.length) {
      const animal = next.cards.find((card) => card.id === id)!.animal;
      recordAnswer(animal.letter, "matching", next.matched.length === pairs);
      audio.play([animal.word.toLowerCase()]);
    }
  };
  useEffect(() => {
    if (!peek || !audio.active) return;
    const timer = setTimeout(() => setPeek(false), 2200);
    return () => clearTimeout(timer);
  }, [peek, audio.active, state.cards]);
  useAutoAdvance(
    memoryMismatch(state) && audio.active && !peek,
    () => update({ ...current.current, revealed: [] }),
    1500,
  );
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ActivityToolbar
        onExit={onExit}
        muted={audio.muted}
        onToggleSound={audio.toggleSound}
        soundLabel="Memory game sounds"
      />
      <Text style={styles.title}>🐾 Animal memory pairs</Text>
      <Text style={styles.note}>Turn over two cards. Find the same animal!</Text>
      <View style={styles.row}>
        {[2, 3, 4].map((count) => (
          <ActionButton
            key={count}
            accessibilityState={{ selected: pairs === count }}
            onPress={() => reset(count)}
          >{`${count} pairs`}</ActionButton>
        ))}
      </View>
      <Text style={styles.count}>
        Pairs found: {state.matched.length} of {pairs}
      </Text>
      <View style={styles.grid}>
        {state.cards.map((card) => (
          <MemoryTile
            key={card.id}
            card={card}
            visible={
              peek || state.revealed.includes(card.id) || state.matched.includes(card.animal.letter)
            }
            matched={state.matched.includes(card.animal.letter)}
            disabled={peek || state.matched.includes(card.animal.letter) || memoryMismatch(state)}
            columns={pairs === 3 ? 3 : 2}
            onPress={() => choose(card.id)}
          />
        ))}
      </View>
      <FeedbackMessage>
        {finished
          ? "All pairs found! Your stars are saved! ⭐"
          : peek
            ? "Have a little peek at your animal friends!"
            : memoryMismatch(state)
              ? "Different friends! They will turn back. Try again!"
              : "Take your time. Every pair earns one star!"}
      </FeedbackMessage>
      <View style={styles.row}>
        <ActionButton
          disabled={peek || finished || memoryMismatch(state)}
          onPress={() => setPeek(true)}
        >
          👀 Peek at cards
        </ActionButton>
        <ActionButton onPress={() => reset(pairs)}>🌈 Play memory again</ActionButton>
      </View>
      <Text style={styles.note}>No timer, no penalties. Peeking is always welcome.</Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F0FBFF" },
  content: { padding: 16, alignItems: "center", paddingBottom: 30 },
  title: {
    color: "#57388E",
    fontSize: 28,
    fontWeight: "900",
    marginVertical: 18,
    textAlign: "center",
  },
  note: { color: "#615574", fontSize: 19, textAlign: "center", marginVertical: 12 },
  count: { color: "#267866", fontSize: 24, fontWeight: "900", marginVertical: 14 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  grid: {
    width: "100%",
    maxWidth: 700,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
});
