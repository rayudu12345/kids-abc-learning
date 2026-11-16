import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { flipMemory, memoryMismatch, newMemory } from "../memoryLogic";
import { useProgress } from "../ProgressStore";
import useActivityAudio from "../hooks/useActivityAudio";
import useAutoAdvance from "../hooks/useAutoAdvance";
import { MemoryGroup, memoryAnimals, memoryGroups, memoryAnimalsFor } from "../data/memoryAnimals";
import useMemoryPhotos from "../hooks/useMemoryPhotos";
import PhotoCredits from "../components/memory/PhotoCredits";
import MemoryTile from "../components/memory/MemoryTile";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import ActionButton from "../components/ui/ActionButton";
import FeedbackMessage from "../components/ui/FeedbackMessage";
export default function MemoryPairs({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState(() => newMemory(2)),
    current = useRef(state);
  const [group, setGroup] = useState<MemoryGroup>("all");
  const photos = useMemoryPhotos(state.cards);
  const [peek, setPeek] = useState(true);
  const { recordMemoryMatch } = useProgress(),
    audio = useActivityAudio();
  const pairs = state.cards.length / 2,
    finished = state.matched.length === pairs;
  const update = (next: typeof state) => {
    current.current = next;
    setState(next);
  };
  const reset = (count: number, nextGroup = group) => {
    void audio.stop();
    setGroup(nextGroup);
    update(newMemory(count, nextGroup));
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
      recordMemoryMatch(animal.id, next.matched.length === pairs);
      audio.say(animal.word);
    }
  };
  useEffect(() => {
    if (!peek || !audio.active || !photos.ready) return;
    const timer = setTimeout(() => setPeek(false), 2200);
    return () => clearTimeout(timer);
  }, [peek, audio.active, state.cards, photos.ready]);
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
      <Text style={styles.note}>
        {memoryAnimals.length} animal friends · Pictures need internet
      </Text>
      <View style={styles.row}>
        {memoryGroups.map((item) => (
          <ActionButton
            key={item.id}
            accessibilityState={{ selected: group === item.id }}
            onPress={() => reset(pairs, item.id)}
          >
            {item.name}
          </ActionButton>
        ))}
      </View>
      <Text style={styles.note}>{memoryAnimalsFor(group).length} animals in this group</Text>
      {photos.failed && (
        <>
          <Text style={styles.note}>
            Some photos could not load. Check your internet or try again. Your stars are safe.
          </Text>
          <ActionButton
            onPress={() => {
              photos.retry();
              setPeek(true);
            }}
          >
            Retry photos
          </ActionButton>
        </>
      )}
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
            photoStatus={photos.status[card.animal.id] ?? "loading"}
            attempt={photos.attempt}
            onPhotoError={() => photos.fail(card.animal.id)}
            visible={
              peek || state.revealed.includes(card.id) || state.matched.includes(card.animal.id)
            }
            matched={state.matched.includes(card.animal.id)}
            disabled={peek || state.matched.includes(card.animal.id) || memoryMismatch(state)}
            columns={pairs === 3 ? 3 : 2}
            onPress={() => choose(card.id)}
          />
        ))}
      </View>
      <FeedbackMessage>
        {finished
          ? "All pairs found! Your stars are saved! ⭐"
          : peek
            ? !photos.ready
              ? "Getting animal photos…"
              : "Have a little peek at your animal friends!"
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
      <Text style={styles.note}>
        No timer, no penalties. Peeking is always welcome. New animal names use the tablet’s English
        voice.
      </Text>
      <PhotoCredits animals={photos.animals} />
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
