import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import * as Audio from "../audio/speech";
import { phonicsSounds } from "../data/learningCatalog";
import { useProgress } from "../ProgressStore";
import useAutoAdvance from "../hooks/useAutoAdvance";
import ActionButton from "../components/ui/ActionButton";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import FeedbackMessage from "../components/ui/FeedbackMessage";
import { AnimalArt } from "../AnimalArt";
export default function Phonics({ onExit }: { onExit: () => void }) {
  const [index, setIndex] = useState(0),
    [muted, setMuted] = useState(false),
    [won, setWon] = useState(false),
    [hint, setHint] = useState(false),
    [finished, setFinished] = useState(false);
  const lock = useRef(false);
  const { recordLearning } = useProgress();
  const target = phonicsSounds[index];
  const groupStart = Math.floor(index / 2) * 2,
    choices = phonicsSounds.slice(groupStart, groupStart + 2);
  const hear = () => {
    if (!muted) Audio.playRecording(target.audio, target.word);
  };
  useEffect(() => {
    hear();
    return () => {
      void Audio.stop();
    };
  }, [index, muted]);
  const select = (next: number) => {
    void Audio.stop();
    setIndex(next);
    setWon(false);
    setHint(false);
    setFinished(false);
    lock.current = false;
  };
  const choose = (id: string) => {
    if (lock.current) return;
    if (id !== target.id) {
      setHint(true);
      hear();
      return;
    }
    lock.current = true;
    setWon(true);
    recordLearning("phonics", id, index === phonicsSounds.length - 1);
  };
  useAutoAdvance(
    won && !finished,
    () => {
      if (index === phonicsSounds.length - 1) setFinished(true);
      else select(index + 1);
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
      <Text style={styles.title}>🐾 Little letter sounds</Text>
      <Text style={styles.note}>
        A letter name and a letter sound are different. Some letters make other sounds in other
        words.
      </Text>
      <View style={styles.row}>
        {[0, 2, 4].map((start, i) => (
          <ActionButton key={start} onPress={() => select(start)}>
            {["Start easy: M · S", "More: F · N", "Explore: L · V"][i]}
          </ActionButton>
        ))}
      </View>
      {finished ? (
        <>
          <Text style={styles.sound}>⭐ 🎉 ⭐</Text>
          <Text style={styles.note}>
            Lovely listening! You practiced six common initial sounds.
          </Text>
          <ActionButton onPress={() => select(0)}>Play again</ActionButton>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Sound {index + 1} of {phonicsSounds.length}
          </Text>
          <Text style={styles.sound}>
            {target.id} · {target.sound}
          </Text>
          <Text style={styles.note}>
            {target.guide} Keep the sound short or gently continuous—no extra “uh”.
          </Text>
          <ActionButton
            onPress={() => {
              if (!muted) Audio.playRecording(`letter-${target.id}`, target.id);
            }}
          >{`Hear letter name ${target.id}`}</ActionButton>
          <ActionButton variant="primary" onPress={hear}>{`Hear word ${target.word}`}</ActionButton>
          <Text style={styles.note}>
            {Audio.hasRecording(target.audio)
              ? "Human word recording: listen for its first sound."
              : "Device voice for this example: download an offline English voice."}{" "}
            Try making the initial sound yourself.
          </Text>
          <Text style={styles.subtitle}>Which animal starts with {target.sound}?</Text>
          <View style={styles.row}>
            {choices.map((item) => (
              <ActionButton
                key={item.id}
                onPress={() => choose(item.id)}
                disabled={won}
                style={{
                  width: "45%",
                  minHeight: 130,
                  backgroundColor: hint && item.id === target.id ? "#D7F3DF" : "#FFE4AC",
                }}
                textStyle={{ fontSize: 24 }}
              >{`${item.icon}\n${item.word}`}</ActionButton>
            ))}
          </View>
          {target.id === "F" || target.id === "L" ? (
            <AnimalArt letter={target.id} size={110} />
          ) : null}
          <FeedbackMessage>
            {won
              ? "Wonderful listening! One saved star! ⭐"
              : hint
                ? `Try ${target.word}. Hear its first sound again.`
                : "Take your time and listen again whenever you like."}
          </FeedbackMessage>
        </>
      )}
      <Text style={styles.note}>
        Human word recordings demonstrate initial sounds. Dedicated isolated phoneme recordings are
        not bundled; no letter-name clip is presented as a phoneme.
      </Text>
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
    fontSize: 21,
    fontWeight: "800",
    color: "#267866",
    textAlign: "center",
    marginVertical: 12,
  },
  note: {
    color: "#615574",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 23,
    marginVertical: 10,
    maxWidth: 760,
  },
  sound: { fontSize: 54, fontWeight: "900", color: "#9C3868", textAlign: "center" },
  row: { width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
});
