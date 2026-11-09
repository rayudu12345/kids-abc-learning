import { AnimalArt } from "./AnimalArt";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { animals } from "./quizLogic";
import { animalTraces } from "./traceCatalog";
import { useProgress } from "./ProgressStore";
export default function StickerBook({ onExit }: { onExit: () => void }) {
  const { progress, saveError, retrySave } = useProgress();
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" onPress={onExit} style={styles.button}>
        <Text style={styles.buttonText}>‹ Back to exploring</Text>
      </Pressable>
      <Text style={styles.title}>My animal sticker book 🐾</Text>
      <Text style={styles.stars}>⭐ {progress.stars} stars earned</Text>
      <Text style={styles.subtitle}>
        {progress.stickers.length} of {animals.length} animal stickers collected
      </Text>
      <View style={styles.grid}>
        {animals.map((animal) => {
          const earned = progress.stickers.includes(animal.letter);
          return (
            <View
              key={animal.letter}
              accessible
              accessibilityLabel={
                earned
                  ? `${animal.word} sticker collected`
                  : `${animal.word} sticker waiting to be collected`
              }
              style={[styles.sticker, !earned && styles.locked]}
            >
              {earned ? (
                <AnimalArt letter={animal.letter} size={90} />
              ) : (
                <Text style={styles.emoji}>🐾</Text>
              )}
              <Text style={styles.label}>
                {animal.letter} · {animal.word}
              </Text>
              <Text style={styles.hint}>{earned ? "Collected! ⭐" : "Find me in a game"}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.subtitle}>Completed letter adventures: {progress.completed.letters}</Text>
      <Text style={styles.subtitle}>
        Completed matching adventures: {progress.completed.matching}
      </Text>
      <Text style={styles.subtitle}>Traced letters: {progress.tracedLetters.length} / 26</Text>
      <View style={styles.grid}>
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
          <Text
            key={letter}
            accessibilityLabel={`${letter}${progress.tracedLetters.includes(letter) ? " traced" : " waiting to trace"}`}
            style={{
              fontSize: 25,
              fontWeight: "900",
              padding: 10,
              borderRadius: 12,
              backgroundColor: progress.tracedLetters.includes(letter) ? "#C6F1DF" : "#EEEAF3",
              color: "#39334D",
            }}
          >
            {letter}
            {progress.tracedLetters.includes(letter) ? " ✓" : ""}
          </Text>
        ))}
      </View>
      <Text style={styles.subtitle}>
        Animal outlines traced: {progress.tracedAnimals.length} / {animalTraces.length}
      </Text>
      <View style={styles.grid}>
        {animalTraces.map((animal) => (
          <Text
            key={animal.id}
            accessibilityLabel={`${animal.id}${progress.tracedAnimals.includes(animal.id) ? " traced" : " waiting to trace"}`}
            style={{
              fontSize: 40,
              padding: 12,
              borderRadius: 16,
              backgroundColor: progress.tracedAnimals.includes(animal.id) ? "#FFE7AC" : "#EEEAF3",
            }}
          >
            {animal.icon}
            {progress.tracedAnimals.includes(animal.id) ? " ✓" : ""}
          </Text>
        ))}
      </View>
      <Text style={styles.subtitle}>Completed tracings: {progress.completed.tracing}</Text>
      {saveError ? (
        <View>
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            Your latest rewards could not be saved. You can keep playing and try saving again.
          </Text>
          <Pressable accessibilityRole="button" onPress={retrySave} style={styles.button}>
            <Text style={styles.buttonText}>Try saving again</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.hint}>Saved on this tablet. Your stickers will be here next time!</Text>
      )}
      <Text style={styles.note}>
        Play games and trace to earn rewards. Completed tracings earn stars; tracing an animal with
        a matching sticker also unlocks that sticker. Removing the app or clearing its data removes
        saved rewards.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFDF7" },
  content: { alignItems: "center", padding: 20, paddingBottom: 40 },
  button: {
    padding: 16,
    backgroundColor: "#EEE8FF",
    borderRadius: 20,
    marginVertical: 10,
    alignSelf: "center",
  },
  buttonText: { color: "#58369e", fontSize: 18, fontWeight: "800" },
  title: {
    color: "#292348",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 20,
  },
  stars: { color: "#987019", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#6B647E", fontSize: 17, textAlign: "center", marginVertical: 10 },
  grid: {
    width: "100%",
    maxWidth: 800,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    marginVertical: 20,
  },
  sticker: {
    width: "44%",
    maxWidth: 180,
    minHeight: 160,
    backgroundColor: "#FFF0C9",
    borderRadius: 24,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  locked: { backgroundColor: "#EEEAF3" },
  emoji: { fontSize: 68 },
  label: { fontSize: 17, fontWeight: "800", color: "#39334D", textAlign: "center" },
  hint: { color: "#6B647E", fontSize: 14, textAlign: "center", marginVertical: 8 },
  error: { color: "#7f4336", fontSize: 16, textAlign: "center" },
  note: { color: "#6B647E", fontSize: 12, textAlign: "center", maxWidth: 600, marginTop: 20 },
});
