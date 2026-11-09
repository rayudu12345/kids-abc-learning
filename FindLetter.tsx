import { AnimatedAnimal, AnimalArt } from "./AnimalArt";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import * as Speech from "expo-speech";
import { useProgress } from "./ProgressStore";
import LetterScene from "./LetterScene";
import { choicesFor, newLesson } from "./quizLogic";

export default function FindLetter({ onExit }: { onExit: () => void }) {
  const { recordAnswer, saveError } = useProgress();
  const { width } = useWindowDimensions();
  const [lesson, setLesson] = useState(newLesson);
  const [round, setRound] = useState(0);
  const [won, setWon] = useState(false);
  const [hint, setHint] = useState(false);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);
  const target = lesson[round];
  const [choices, setChoices] = useState(() => choicesFor(target));
  const wonRef = useRef(false);
  const pop = useRef(new Animated.Value(1)).current;
  const say = (text: string) => {
    Speech.stop();
    if (!muted) Speech.speak(text, { language: "en-US", rate: 0.78, pitch: 1.08 });
  };
  const prompt = `Can you find the letter ${target.letter}? ${target.letter} is for ${target.word}.`;
  useEffect(() => {
    if (!muted && !finished) Speech.speak(prompt, { language: "en-US", rate: 0.78 });
    return () => {
      Speech.stop();
    };
  }, [prompt, muted, finished]);
  useEffect(
    () => () => {
      pop.stopAnimation();
    },
    [pop],
  );
  const choose = (letter: string) => {
    if (wonRef.current) return;
    if (letter !== target.letter) {
      setHint(true);
      say(`Let's try together. Find ${target.letter}, for ${target.word}.`);
      return;
    }
    wonRef.current = true;
    recordAnswer(target.letter, "letters", round === lesson.length - 1);
    setWon(true);
    say(`Hooray! ${target.word}!`);
    pop.setValue(0.6);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, bounciness: 12 }).start();
  };
  // Keep the reward visible briefly, then advance once. Cleanup cancels
  // pending advancement when the child leaves the game or restarts.
  useEffect(() => {
    if (!won || finished) return;
    const timer = setTimeout(() => {
      if (!wonRef.current) return;
      wonRef.current = false;
      Speech.stop();
      if (round === lesson.length - 1) {
        setFinished(true);
        return;
      }
      setChoices(choicesFor(lesson[round + 1]));
      setRound(round + 1);
      setWon(false);
      setHint(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [won, finished, round, lesson]);
  const restart = () => {
    const fresh = newLesson();
    Speech.stop();
    setLesson(fresh);
    setRound(0);
    setChoices(choicesFor(fresh[0]));
    setWon(false);
    setHint(false);
    setFinished(false);
    wonRef.current = false;
  };
  const earned = round + (won ? 1 : 0);
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" onPress={onExit} style={styles.button}>
          <Text style={styles.buttonText}>‹ Alphabet</Text>
        </Pressable>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: !muted }}
          accessibilityLabel="Spoken prompts"
          onPress={() => {
            Speech.stop();
            setMuted((m) => !m);
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{muted ? "🔇 Sound off" : "🔊 Sound on"}</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>
        {finished ? "Wonderful exploring!" : "Animal letter adventure"}
      </Text>
      <Text style={styles.subtitle}>
        {finished
          ? "Your animal stickers from this adventure"
          : `Little adventure • ${round + 1} of ${lesson.length}`}
      </Text>
      <Text accessibilityLabel={`${earned} of 5 stars earned`} style={styles.stars}>
        {Array.from({ length: 5 }, (_, i) => (i < earned ? "⭐" : "☆")).join(" ")}
      </Text>
      {finished ? (
        <>
          <Text style={styles.celebrate}>🎉</Text>
          <Text style={styles.message}>You found five letters! Time for a little break?</Text>
          <View style={styles.collection}>
            {lesson.map((animal) => (
              <View key={animal.letter} style={styles.sticker}>
                <AnimalArt letter={animal.letter} size={85} />
                <Text style={styles.stickerLabel}>
                  {animal.letter} · {animal.word}
                </Text>
              </View>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={restart} style={styles.primary}>
            <Text style={styles.primaryText}>Play another adventure</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onExit} style={styles.button}>
            <Text style={styles.buttonText}>Back to exploring</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.question}>Find the letter {target.letter}</Text>
          <Text style={styles.subtitle}>{target.word} is waiting to play!</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Hear the question again"
            onPress={() => say(prompt)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>🔊 Hear it again</Text>
          </Pressable>
          {won ? (
            <Animated.View style={{ transform: [{ scale: pop }], alignItems: "center" }}>
              <LetterScene
                key={target.letter}
                letter={target.letter}
                width={Math.min(width - 40, 550)}
                height={Math.min(width * 0.55, 270)}
              />
              <Text style={styles.message}>
                Hooray! Your {target.word.toLowerCase()} sticker! {target.emoji}
              </Text>
            </Animated.View>
          ) : (
            <View style={{ marginVertical: 14 }}>
              <AnimatedAnimal letter={target.letter} size={160} />
            </View>
          )}
          <View style={styles.choices}>
            {choices.map((animal) => (
              <Pressable
                key={animal.letter}
                accessibilityRole="button"
                accessibilityLabel={`Letter ${animal.letter}`}
                accessibilityState={{ disabled: won }}
                disabled={won}
                onPress={() => choose(animal.letter)}
                style={({ pressed }) => [
                  styles.choice,
                  (hint || won) && animal.letter === target.letter && styles.highlight,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.letter}>{animal.letter}</Text>
              </Pressable>
            ))}
          </View>
          <Text accessibilityLiveRegion="polite" style={styles.message}>
            {won
              ? "One star and one sticker for you! ⭐"
              : hint
                ? `Let's try together! Tap ${target.letter} in the purple border.`
                : "Tap a letter. Take your time! ♡"}
          </Text>
          {won && (
            <Text style={styles.subtitle}>
              {round === lesson.length - 1
                ? "Your sticker collection is coming…"
                : "Next animal is coming…"}
            </Text>
          )}
          <View style={styles.collection}>
            {lesson.slice(0, earned).map((animal) => (
              <Text
                key={animal.letter}
                accessibilityLabel={`${animal.word} sticker`}
                style={styles.smallSticker}
              >
                {animal.emoji}
              </Text>
            ))}
          </View>
        </>
      )}
      <Text style={styles.note}>
        {saveError
          ? "Rewards could not be saved yet. Try saving from My sticker book."
          : "Your stars and stickers are saved in My sticker book."}{" "}
        Take your time choosing; correct answers move on automatically.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFDF7" },
  content: { alignItems: "center", padding: 16, paddingBottom: 35 },
  toolbar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    padding: 13,
    borderRadius: 18,
    backgroundColor: "#EEE8FF",
    marginVertical: 5,
    minHeight: 48,
  },
  buttonText: { color: "#58369e", fontWeight: "800", fontSize: 16 },
  title: { fontSize: 27, color: "#292348", fontWeight: "900", textAlign: "center", marginTop: 18 },
  subtitle: { fontSize: 16, color: "#6B647E", textAlign: "center", marginVertical: 6 },
  stars: { fontSize: 30, color: "#ab7a17", marginVertical: 12 },
  question: { fontSize: 31, fontWeight: "900", color: "#59359b", textAlign: "center" },
  animal: { fontSize: 115, marginVertical: 14 },
  choices: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    maxWidth: 650,
    justifyContent: "center",
  },
  choice: {
    flex: 1,
    maxWidth: 180,
    minHeight: 115,
    backgroundColor: "#DFF4FF",
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#c2e2ef",
    alignItems: "center",
    justifyContent: "center",
  },
  highlight: { borderColor: "#7751C5", backgroundColor: "#F0E5FF" },
  letter: { fontSize: 64, fontWeight: "900", color: "#292348" },
  message: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5e4980",
    textAlign: "center",
    marginVertical: 16,
  },
  primary: { backgroundColor: "#6946BC", padding: 18, borderRadius: 24, marginVertical: 10 },
  primaryText: { color: "white", fontSize: 20, fontWeight: "800", textAlign: "center" },
  collection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginVertical: 14,
  },
  sticker: { backgroundColor: "#fff0c9", borderRadius: 24, padding: 16, alignItems: "center" },
  stickerEmoji: { fontSize: 65 },
  stickerLabel: { fontSize: 16, fontWeight: "800", color: "#614a23" },
  smallSticker: { fontSize: 42, backgroundColor: "#fff0c9", borderRadius: 18, padding: 8 },
  celebrate: { fontSize: 85 },
  note: { fontSize: 12, color: "#6B647E", textAlign: "center", marginTop: 20 },
});
