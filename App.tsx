import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
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
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const cardBounce = useRef(new Animated.Value(1)).current;
  const heroFloat = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.4)).current;
  const activeItem = alphabet.find(([letter]) => letter === activeLetter);

  useEffect(() => {
    if (!activeLetter) return;

    heroFloat.setValue(0);
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: -15,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ])
    );
    floating.start();
    return () => floating.stop();
  }, [activeLetter, heroFloat]);

  const playLetter = (letter: string, word: string) => {
    setActiveLetter(letter);
    heroScale.setValue(0.4);
    Animated.spring(heroScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 11,
      bounciness: 14,
    }).start();

    cardBounce.setValue(1);
    Animated.sequence([
      Animated.spring(cardBounce, { toValue: 1.18, useNativeDriver: true, speed: 18, bounciness: 12 }),
      Animated.spring(cardBounce, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
    ]).start();

    Speech.stop();
    Speech.speak(`${letter}! ${letter} is for ${word}!`, {
      language: "en-US",
      rate: 0.78,
      pitch: 1.08,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LET'S LEARN TOGETHER</Text>
        <Text style={styles.title}>Kids ABC Learning 🌈</Text>
        <Text style={styles.subtitle}>Tap a letter to start its mini animation!</Text>
      </View>

      {activeItem ? (
        <View style={styles.scene}>
          <Text style={styles.sceneStars}>✨ ⭐ ✨</Text>
          <Animated.View
            style={[
              styles.heroContent,
              {
                transform: [
                  { translateY: heroFloat },
                  { scale: heroScale },
                ],
              },
            ]}
          >
            <Text style={styles.heroLetter}>{activeItem[0]}</Text>
            <Text style={styles.heroEmoji}>{activeItem[2]}</Text>
            <Text style={styles.heroWord}>{activeItem[0]} is for {activeItem[1]}!</Text>
            <Text style={styles.heroHint}>🔊 Listen and say it with me!</Text>
          </Animated.View>
          <Text style={styles.sceneStars}>🌈 🎉 🌈</Text>
        </View>
      ) : (
        <View style={[styles.scene, styles.emptyScene]}>
          <Text style={styles.emptyEmoji}>🎈 🧸 🎈</Text>
          <Text style={styles.emptyTitle}>Choose a letter!</Text>
          <Text style={styles.emptyText}>Your animated learning scene will appear here.</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Choose a letter A–Z</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {alphabet.map(([letter, word, emoji], index) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${letter}, ${word}. Play animation and pronunciation`}
            key={letter}
            onPress={() => playLetter(letter, word)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors[index % colors.length] },
              activeLetter === letter && styles.selectedCard,
              pressed && styles.pressed,
            ]}
          >
            <Animated.View
              style={{
                alignItems: "center",
                transform: [{ scale: activeLetter === letter ? cardBounce : 1 }],
              }}
            >
              <Text style={styles.letter}>{letter}</Text>
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={styles.word}>{word}</Text>
            </Animated.View>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.footer}>Little letters, big discoveries! ⭐</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFDF7" },
  header: { paddingTop: 12, paddingHorizontal: 18, paddingBottom: 10, alignItems: "center" },
  eyebrow: { color: "#7C63C9", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#292348", fontSize: 25, fontWeight: "900", textAlign: "center", marginTop: 5 },
  subtitle: { color: "#68647A", fontSize: 13, marginTop: 4, textAlign: "center" },
  scene: {
    marginHorizontal: 14,
    minHeight: 220,
    borderRadius: 26,
    backgroundColor: "#EEE8FF",
    borderWidth: 2,
    borderColor: "#D9CCFF",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 8,
    overflow: "hidden",
  },
  emptyScene: { backgroundColor: "#FFF0C9", borderColor: "#FFE2A0" },
  sceneStars: { fontSize: 22 },
  heroContent: { alignItems: "center", justifyContent: "center" },
  heroLetter: { fontSize: 48, lineHeight: 54, fontWeight: "900", color: "#5A3CB5" },
  heroEmoji: { fontSize: 66, marginTop: 1 },
  heroWord: { color: "#292348", fontSize: 21, fontWeight: "900", marginTop: 5 },
  heroHint: { color: "#6B5C9D", fontSize: 12, fontWeight: "700", marginTop: 5 },
  emptyEmoji: { fontSize: 42 },
  emptyTitle: { color: "#694A9E", fontSize: 22, fontWeight: "900" },
  emptyText: { color: "#6B647E", fontSize: 12, textAlign: "center", paddingHorizontal: 14 },
  sectionTitle: { color: "#39334D", fontSize: 14, fontWeight: "900", paddingHorizontal: 17, paddingTop: 12, paddingBottom: 3 },
  grid: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  card: { width: "21.5%", minHeight: 96, margin: "1.5%", borderRadius: 16, alignItems: "center", justifyContent: "center", paddingVertical: 8, paddingHorizontal: 3, borderWidth: 1, borderColor: "rgba(60,40,100,0.06)" },
  selectedCard: { borderColor: "#7C63C9", borderWidth: 2 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
  letter: { color: "#292348", fontSize: 25, fontWeight: "900" },
  emoji: { fontSize: 25, marginTop: 1 },
  word: { color: "#39334D", fontSize: 10, fontWeight: "800", marginTop: 3, textAlign: "center" },
  footer: { textAlign: "center", paddingVertical: 7, color: "#7C63C9", fontSize: 11, fontWeight: "700" },
});
