import useAutoAdvance from "./hooks/useAutoAdvance";
import StarProgress from "./components/ui/StarProgress";
import LetterChoice from "./components/ui/LetterChoice";
import FeedbackMessage from "./components/ui/FeedbackMessage";
import ActivityToolbar from "./components/ui/ActivityToolbar";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import * as Speech from "./audio/speech";
import { AnimalArt, AnimatedAnimal } from "./AnimalArt";
import { choicesFor, newLesson } from "./quizLogic";
import { useProgress } from "./ProgressStore";

export default function LetterPairs({ onExit }: { onExit: () => void }) {
  const { width } = useWindowDimensions();
  const { recordAnswer, saveError } = useProgress();
  const [lesson, setLesson] = useState(newLesson);
  const [round, setRound] = useState(0);
  const target = lesson[round];
  const [choices, setChoices] = useState(() => choicesFor(target));
  const [won, setWon] = useState(false);
  const [hint, setHint] = useState(false);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);
  const locked = useRef(false);
  const say = (text: string) => {
    Speech.stop();
    if (!muted) Speech.speak(text, { language: "en-US", rate: 0.76 });
  };
  const prompt = `This is uppercase ${target.letter}. Can you find lowercase ${target.letter}? ${target.letter} is for ${target.word}.`;
  useEffect(() => {
    if (!muted && !finished) Speech.speak(prompt, { language: "en-US", rate: 0.76 });
    return () => {
      Speech.stop();
    };
  }, [prompt, muted, finished]);
  useAutoAdvance(
    won && !finished,
    () => {
      Speech.stop();
      if (round === lesson.length - 1) {
        setFinished(true);
        return;
      }
      setChoices(choicesFor(lesson[round + 1]));
      setRound(round + 1);
      setWon(false);
      setHint(false);
      locked.current = false;
    },
    3000,
  );
  const choose = (letter: string) => {
    if (locked.current) return;
    if (letter !== target.letter) {
      setHint(true);
      say(`Let's try together. Find lowercase ${target.letter}, in the purple border.`);
      return;
    }
    locked.current = true;
    setWon(true);
    recordAnswer(target.letter, "letters", round === lesson.length - 1);
    say(`Hooray! Uppercase ${target.letter} and lowercase ${target.letter}!`);
  };
  const restart = () => {
    Speech.stop();
    const fresh = newLesson();
    setLesson(fresh);
    setRound(0);
    setChoices(choicesFor(fresh[0]));
    setWon(false);
    setHint(false);
    setFinished(false);
    locked.current = false;
  };
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ActivityToolbar
        onExit={onExit}
        muted={muted}
        soundLabel="Spoken prompts"
        onToggleSound={() => {
          Speech.stop();
          setMuted((value) => !value);
        }}
      />
      <Text style={styles.title}>
        {finished ? "Lovely letter pairs! 🎉" : "Big and little letters"}
      </Text>
      <Text style={styles.subtitle}>
        {finished
          ? "You matched five uppercase and lowercase letters."
          : `Letter pair ${round + 1} of 5`}
      </Text>
      <StarProgress earned={round + (won ? 1 : 0)} />
      {finished ? (
        <>
          <View style={styles.collection}>
            {lesson.map((a) => (
              <View key={a.letter} style={styles.sticker}>
                <AnimalArt letter={a.letter} size={85} />
                <Text style={styles.pair}>
                  {a.letter} {a.letter.toLowerCase()}
                </Text>
                <Text style={styles.subtitle}>{a.word}</Text>
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
          <Text style={styles.subtitle}>Find the little letter that matches</Text>
          <View style={styles.hero}>
            <Text accessibilityLabel={`Uppercase ${target.letter}`} style={styles.upper}>
              {target.letter}
            </Text>
            {won && (
              <Text accessibilityLabel={`Lowercase ${target.letter}`} style={styles.upper}>
                {target.letter.toLowerCase()}
              </Text>
            )}
            <AnimatedAnimal letter={target.letter} size={width >= 600 ? 150 : 105} />
          </View>
          <Text style={styles.subtitle}>
            {target.letter} is for {target.word}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => say(prompt)} style={styles.button}>
            <Text style={styles.buttonText}>🔊 Hear it again</Text>
          </Pressable>
          <View style={styles.choices}>
            {choices.map((a) => (
              <LetterChoice
                key={a.letter}
                letter={a.letter}
                lowercase={true}
                highlighted={(hint || won) && a.letter === target.letter}
                disabled={won}
                onPress={() => choose(a.letter)}
              />
            ))}
          </View>
          <FeedbackMessage>
            {won
              ? `Wonderful! ${target.letter} and ${target.letter.toLowerCase()} belong together! ⭐`
              : hint
                ? `Try ${target.letter.toLowerCase()} in the purple border. Take your time!`
                : "Tap a little letter. There is no hurry. ♡"}
          </FeedbackMessage>
          {won && (
            <Text style={styles.subtitle}>
              {round === 4 ? "Your letter pairs are coming…" : "The next pair is coming…"}
            </Text>
          )}
        </>
      )}
      <Text style={styles.note}>
        {saveError
          ? "Rewards could not be saved yet. Try saving from My sticker book."
          : "Your stars and animal stickers are saved in My sticker book."}
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFDF7" },
  content: { padding: 16, alignItems: "center", paddingBottom: 35 },
  button: {
    padding: 13,
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "#EEE8FF",
    marginVertical: 6,
  },
  buttonText: { fontSize: 16, fontWeight: "800", color: "#58369e" },
  title: { color: "#292348", fontSize: 28, fontWeight: "900", textAlign: "center", marginTop: 18 },
  subtitle: { color: "#6B647E", fontSize: 16, textAlign: "center", marginVertical: 8 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginVertical: 12,
    flexWrap: "wrap",
  },
  upper: { fontSize: 85, fontWeight: "900", color: "#59359b" },
  choices: { flexDirection: "row", gap: 12, width: "100%", maxWidth: 650, marginTop: 14 },
  note: { color: "#6B647E", fontSize: 12, textAlign: "center", marginTop: 15 },
  collection: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  sticker: { backgroundColor: "#FFF0C9", padding: 16, borderRadius: 22, alignItems: "center" },
  pair: { fontSize: 35, fontWeight: "800", color: "#59359b" },
  primary: { padding: 18, backgroundColor: "#6946BC", borderRadius: 24, marginVertical: 15 },
  primaryText: { fontSize: 20, color: "white", fontWeight: "800", textAlign: "center" },
});
