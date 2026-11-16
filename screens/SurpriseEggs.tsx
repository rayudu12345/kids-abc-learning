import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimatedAnimal } from "../AnimalArt";
import { crackEgg, newEggLesson } from "../eggLogic";
import { useProgress } from "../ProgressStore";
import useActivityAudio from "../hooks/useActivityAudio";
import useAutoAdvance from "../hooks/useAutoAdvance";
import SurpriseEgg from "../components/eggs/SurpriseEgg";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import ActionButton from "../components/ui/ActionButton";
import FeedbackMessage from "../components/ui/FeedbackMessage";
const colors = ["#E975A1", "#6ABBE0", "#AA8AE1", "#69BA9B"];
export default function SurpriseEggs({ onExit }: { onExit: () => void }) {
  const [lesson, setLesson] = useState(newEggLesson),
    [index, setIndex] = useState(0);
  const [cracks, setCracks] = useState(0),
    count = useRef(0);
  const [finished, setFinished] = useState(false);
  const audio = useActivityAudio(),
    { recordAnswer } = useProgress();
  const animal = lesson[index],
    opened = cracks === 3;
  const hear = () => audio.play([`letter-${animal.letter}`, animal.word.toLowerCase()]);
  const tap = () => {
    if (count.current === 3 || !audio.active) return;
    count.current = crackEgg(count.current);
    setCracks(count.current);
    if (count.current === 3) {
      recordAnswer(animal.letter, "letters", index === lesson.length - 1);
      hear();
    }
  };
  const next = () => {
    if (count.current !== 3 || finished) return;
    count.current = 0;
    void audio.stop();
    if (index === lesson.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    count.current = 0;
    setCracks(0);
  };
  useAutoAdvance(opened && !finished && audio.active, next, 5000);
  const restart = () => {
    void audio.stop();
    setLesson(newEggLesson());
    setIndex(0);
    setCracks(0);
    count.current = 0;
    setFinished(false);
  };
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ActivityToolbar
        onExit={onExit}
        muted={audio.muted}
        onToggleSound={audio.toggleSound}
        soundLabel="Surprise egg sounds"
      />
      <Text style={styles.title}>🥚 Animal surprise eggs</Text>
      {finished ? (
        <>
          <FeedbackMessage>Eight animal surprises! Your stars are saved! ⭐</FeedbackMessage>
          <ActionButton onPress={restart}>🌈 Open more eggs</ActionButton>
        </>
      ) : (
        <>
          <Text style={styles.note}>
            Egg {index + 1} of {lesson.length}
          </Text>
          {opened ? (
            <View style={styles.reveal}>
              <Text style={styles.letter}>{animal.letter}</Text>
              <AnimatedAnimal letter={animal.letter} size={210} />
              <Text style={styles.word}>
                {animal.letter} is for {animal.word}!
              </Text>
              <ActionButton onPress={hear} disabled={audio.muted}>
                🔊 Hear the surprise
              </ActionButton>
              <FeedbackMessage>One saved star! ⭐ Another surprise is coming.</FeedbackMessage>
              <ActionButton onPress={next}>Next surprise</ActionButton>
            </View>
          ) : (
            <>
              <Text style={styles.note}>Tap the egg three times. Who is inside?</Text>
              <SurpriseEgg cracks={cracks} color={colors[index % colors.length]} onPress={tap} />
              <Text style={styles.note}>{cracks} of 3 taps</Text>
            </>
          )}
        </>
      )}
      <Text style={styles.note}>
        Tap gently—no shaking needed. Your animal friends are ready offline.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFF5EA" },
  content: { padding: 16, alignItems: "center", paddingBottom: 35 },
  title: {
    color: "#57388E",
    fontSize: 29,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 20,
  },
  note: { color: "#615574", fontSize: 20, textAlign: "center", marginVertical: 12 },
  reveal: {
    alignItems: "center",
    width: "100%",
    borderRadius: 30,
    backgroundColor: "#E9F8E4",
    padding: 12,
  },
  letter: { color: "#6946BC", fontSize: 48, fontWeight: "900" },
  word: { color: "#267866", fontSize: 29, fontWeight: "900", textAlign: "center" },
});
