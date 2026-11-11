import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import * as Audio from "../audio/speech";
import { animals } from "../quizLogic";
import { numberWords } from "../data/learningCatalog";
import { countAnimal, numberChoices } from "../countingLogic";
import { useProgress } from "../ProgressStore";
import useAutoAdvance from "../hooks/useAutoAdvance";
import { AnimatedAnimal } from "../AnimalArt";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import ActionButton from "../components/ui/ActionButton";
import FeedbackMessage from "../components/ui/FeedbackMessage";
export default function Counting({ onExit }: { onExit: () => void }) {
  const { width } = useWindowDimensions(),
    { recordLearning } = useProgress();
  const [total, setTotal] = useState(1),
    [counted, setCounted] = useState<number[]>([]),
    [choices, setChoices] = useState(() => numberChoices(1));
  const [muted, setMuted] = useState(false),
    [won, setWon] = useState(false),
    [hint, setHint] = useState(false),
    [finished, setFinished] = useState(false);
  const countedRef = useRef<number[]>([]),
    lock = useRef(false);
  const animal = animals[(total - 1) % animals.length];
  const hear = () => {
    if (!muted) Audio.playSequence(["count", numberWords[total]], `Count ${total} animal friends.`);
  };
  useEffect(() => {
    hear();
    return () => {
      void Audio.stop();
    };
  }, [total, muted]);
  const select = (next: number) => {
    void Audio.stop();
    setTotal(next);
    setChoices(numberChoices(next));
    setCounted([]);
    countedRef.current = [];
    lock.current = false;
    setWon(false);
    setHint(false);
    setFinished(false);
  };
  const tap = (index: number) => {
    if (lock.current) return;
    const next = countAnimal(countedRef.current, index, total);
    if (next.length === countedRef.current.length) return;
    countedRef.current = next;
    setCounted(next);
    if (!muted) Audio.playRecording(numberWords[next.length], String(next.length));
  };
  const choose = (number: number) => {
    if (lock.current || countedRef.current.length !== total) return;
    if (number !== total) {
      setHint(true);
      if (!muted) Audio.playRecording(numberWords[total], String(total));
      return;
    }
    lock.current = true;
    setWon(true);
    recordLearning("counting", String(total), total === 10);
  };
  useAutoAdvance(
    won && !finished,
    () => {
      if (total === 10) setFinished(true);
      else select(total + 1);
    },
    2500,
  );
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ActivityToolbar
        onExit={onExit}
        muted={muted}
        onToggleSound={() => {
          void Audio.stop();
          setMuted((value) => !value);
        }}
      />
      <Text style={styles.title}>🐾 Count animal friends!</Text>
      {finished ? (
        <>
          <Text style={styles.big}>⭐ 🎉 ⭐</Text>
          <Text style={styles.note}>Wonderful counting! Your discoveries are saved.</Text>
          <ActionButton onPress={() => select(1)}>Count again</ActionButton>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Tap each animal once</Text>
          <ActionButton onPress={hear}>🔊 Hear the counting question</ActionButton>
          <Text accessibilityLiveRegion="polite" style={styles.count}>
            Counted {counted.length} of {total}
          </Text>
          <View style={styles.grid}>
            {Array.from({ length: total }, (_, index) => (
              <Pressable
                key={`${total}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`Count ${animal.word} ${index + 1}`}
                accessibilityState={{ disabled: counted.includes(index) }}
                disabled={counted.includes(index) || won}
                onPress={() => tap(index)}
                style={[
                  styles.animalCard,
                  {
                    width: total === 1 ? "60%" : width >= 600 ? "20%" : "42%",
                    backgroundColor: counted.includes(index) ? "#D4F4E4" : "#FFE6AD",
                  },
                ]}
              >
                <AnimatedAnimal
                  animate={!counted.includes(index) && !won}
                  letter={animal.letter}
                  size={total === 1 ? 140 : 90}
                />
                <Text style={styles.badge}>
                  {counted.includes(index) ? `${counted.indexOf(index) + 1} ✓` : "Tap me!"}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.subtitle}>
            {counted.length === total
              ? "How many animal friends did you count?"
              : "Count all the animals to open the choices."}
          </Text>
          <View style={styles.choices}>
            {choices.map((number) => (
              <ActionButton
                key={number}
                accessibilityLabel={`Answer ${number}`}
                disabled={counted.length !== total || won}
                onPress={() => choose(number)}
                style={{
                  flex: 1,
                  minHeight: 95,
                  backgroundColor: hint && number === total ? "#D4F4E4" : "#E7D9FF",
                }}
                textStyle={{ fontSize: 42 }}
              >
                {String(number)}
              </ActionButton>
            ))}
          </View>
          <FeedbackMessage>
            {won
              ? "Wonderful counting! One saved star! ⭐"
              : hint
                ? `Try ${total}. Touch the numbered animals and count again.`
                : "Each animal is counted once. Take your time!"}
          </FeedbackMessage>
          {!won && (
            <ActionButton onPress={() => select(total)}>↻ Count this group again</ActionButton>
          )}
        </>
      )}
      <Text style={styles.subtitle}>Choose a number</Text>
      <View style={styles.row}>
        {Array.from({ length: 10 }, (_, index) => (
          <ActionButton
            key={index}
            accessibilityLabel={`Practice number ${index + 1}`}
            onPress={() => select(index + 1)}
          >
            {String(index + 1)}
          </ActionButton>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F0FBFF" },
  content: { padding: 16, alignItems: "center", paddingBottom: 35 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#57388E",
    textAlign: "center",
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 20,
    color: "#267866",
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 12,
  },
  note: { fontSize: 18, color: "#615574", textAlign: "center", marginVertical: 16 },
  big: { fontSize: 54 },
  count: { fontSize: 28, fontWeight: "900", color: "#9C3868", marginVertical: 16 },
  grid: {
    width: "100%",
    maxWidth: 850,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  animalCard: { borderRadius: 24, padding: 10, alignItems: "center", minHeight: 125 },
  badge: { fontSize: 20, fontWeight: "800", color: "#57388E" },
  choices: { width: "100%", maxWidth: 650, flexDirection: "row", gap: 12 },
  row: { width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
});
