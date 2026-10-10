import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import * as Speech from "expo-speech";

const alphabet = [
  ["A", "Apple", "🍎"], ["B", "Ball", "⚽"], ["C", "Cat", "🐱"],
  ["D", "Dog", "🐶"], ["E", "Elephant", "🐘"], ["F", "Fish", "🐠"],
  ["G", "Giraffe", "🦒"], ["H", "House", "🏠"], ["I", "Ice cream", "🍦"],
  ["J", "Juice", "🧃"], ["K", "Kite", "🪁"], ["L", "Lion", "🦁"],
  ["M", "Moon", "🌙"], ["N", "Nest", "🪺"], ["O", "Orange", "🍊"],
  ["P", "Panda", "🐼"], ["Q", "Queen", "👑"], ["R", "Rainbow", "🌈"],
  ["S", "Sun", "☀️"], ["T", "Tiger", "🐯"], ["U", "Umbrella", "☂️"],
  ["V", "Violin", "🎻"], ["W", "Whale", "🐳"], ["X", "Xylophone", "🎼"],
  ["Y", "Yo-yo", "🪀"], ["Z", "Zebra", "🦓"],
];

const colors = ["#FFE3E3", "#DFF4FF", "#E6F8E7", "#FFF0C9", "#F0E5FF", "#FFE5F3"];

export default function App() {
  const speak = (letter: string, word: string) => {
    Speech.stop();
    Speech.speak(`${letter}. ${letter} is for ${word}!`, {
      language: "en-US",
      rate: 0.8,
      pitch: 1.05,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LET'S LEARN TOGETHER</Text>
        <Text style={styles.title}>Kids ABC Learning 🌈</Text>
        <Text style={styles.subtitle}>Tap a letter to hear it!</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {alphabet.map(([letter, word, emoji], index) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${letter}, ${word}. Tap to hear it`}
            key={letter}
            onPress={() => speak(letter, word)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors[index % colors.length] },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.letter}>{letter}</Text>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.word}>{word}</Text>
            <Text style={styles.tap}>🔊 Tap to listen</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.footer}>Little letters, big discoveries! ⭐</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFDF7" },
  header: { paddingTop: 18, paddingHorizontal: 18, paddingBottom: 12, alignItems: "center" },
  eyebrow: { color: "#7C63C9", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#292348", fontSize: 26, fontWeight: "900", textAlign: "center", marginTop: 6 },
  subtitle: { color: "#68647A", fontSize: 15, marginTop: 5 },
  grid: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 18, flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  card: { width: "30%", minHeight: 145, margin: "1.5%", borderRadius: 20, alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 4, borderWidth: 1, borderColor: "rgba(60,40,100,0.06)" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  letter: { color: "#292348", fontSize: 30, fontWeight: "900" },
  emoji: { fontSize: 31, marginTop: 2 },
  word: { color: "#39334D", fontSize: 13, fontWeight: "800", marginTop: 5, textAlign: "center" },
  tap: { color: "#6B647E", fontSize: 9, marginTop: 5 },
  footer: { textAlign: "center", paddingVertical: 10, color: "#7C63C9", fontSize: 12, fontWeight: "700" },
});
