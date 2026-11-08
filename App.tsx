import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import { ProgressProvider } from "./ProgressStore";
import { AnimalArt, animalLetters } from "./AnimalArt";
import TraceLetters from "./TraceLetters";
import StickerBook from "./StickerBook";
import MatchAnimals from "./MatchAnimals";
import FindLetter from "./FindLetter";
import LetterScene, { alphabet } from "./LetterScene";

const colors = ["#FFE3E3", "#DFF4FF", "#E6F8E7", "#FFF0C9", "#F0E5FF", "#FFE5F3"];

export default function App() {
  return <ProgressProvider><LearningApp /></ProgressProvider>;
}

function LearningApp() {
  const [tracing, setTracing] = useState(false);
  const [stickerBook, setStickerBook] = useState(false);
  const { width, height } = useWindowDimensions();
  const [matching, setMatching] = useState(false);
  const [adventure, setAdventure] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const sceneWidth = Math.max(180, width - 40);
  const sceneHeight = Math.min(height * 0.38, sceneWidth * 0.67);
  const tablet = width >= 600;
  const [sceneVersion, setSceneVersion] = useState(0);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const cardBounce = useRef(new Animated.Value(1)).current;
  const heroScale = useRef(new Animated.Value(0.4)).current;
  const activeItem = alphabet.find(([letter]) => letter === activeLetter);

  useEffect(() => () => { Speech.stop(); }, []);

  const playLetter = (letter: string, word: string) => {
    setActiveLetter(letter);
    setSceneVersion(value => value + 1);
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
    const sound = letter === "C" ? " Meow!" : letter === "L" ? " A soft roar!" : "";
    Speech.speak(`${letter}! ${letter} is for ${word}!${sound}`, {
      language: "en-US",
      rate: 0.78,
      pitch: 1.08,
    });
  };

  if (tracing) return <SafeAreaView style={styles.safe}><TraceLetters onExit={() => { Speech.stop(); setTracing(false); }} /></SafeAreaView>;

  if (stickerBook) return <SafeAreaView style={styles.safe}><StickerBook onExit={() => setStickerBook(false)} /></SafeAreaView>;

  if (matching) return <SafeAreaView style={styles.safe}><MatchAnimals onExit={() => { Speech.stop(); setMatching(false); }} /></SafeAreaView>;

  if (adventure) return <SafeAreaView style={styles.safe}><FindLetter onExit={() => { Speech.stop(); setAdventure(false); }} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LET'S LEARN TOGETHER</Text>
        <Text style={styles.title}>Kids ABC Learning 🌈</Text>
        <Text style={styles.subtitle}>Tap a letter to start its mini animation!</Text>
      </View>

      <Pressable accessibilityRole="button" onPress={() => { Speech.stop(); setExpanded(false); setAdventure(true); }} style={[styles.expandButton, { alignSelf: "center" }]}><Text style={styles.expandText}>🐾 Play: Find the letter!</Text></Pressable>

      <Pressable accessibilityRole="button" onPress={() => { Speech.stop(); setExpanded(false); setMatching(true); }} style={[styles.expandButton, { alignSelf: "center", backgroundColor: "#287F67" }]}><Text style={styles.expandText}>🐶 Play: Match the animals!</Text></Pressable>

      <Pressable accessibilityRole="button" onPress={() => { Speech.stop(); setExpanded(false); setStickerBook(true); }} style={[styles.expandButton, { alignSelf: "center", backgroundColor: "#9B711D" }]}><Text style={styles.expandText}>⭐ My sticker book</Text></Pressable>

      <Pressable accessibilityRole="button" onPress={() => { Speech.stop(); setExpanded(false); setTracing(true); }} style={[styles.expandButton, { alignSelf: "center", backgroundColor: "#A0567C" }]}><Text style={styles.expandText}>✍️ Play: Trace letters!</Text></Pressable>

      {activeItem ? (
        <View style={[styles.scene, { flexShrink: 1 }]}>
          <Text style={styles.sceneStars}>✨ ⭐ ✨</Text>
          <Animated.View
            style={[
              styles.heroContent,
              {
                transform: [
                  { scale: heroScale },
                ],
              },
            ]}
          >
            <Text style={styles.heroLetter}>{activeItem[0]}</Text>
            <LetterScene key={`${activeLetter}-${sceneVersion}`} letter={activeItem[0]} width={sceneWidth} height={sceneHeight} />
            <Pressable accessibilityRole="button" accessibilityLabel="Show animation full screen" onPress={() => setExpanded(true)} style={styles.expandButton}><Text style={styles.expandText}>⛶ Make it BIG!</Text></Pressable>
            <Text style={styles.heroHint}>{activeItem[3]}</Text>
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
              tablet && { width: "14%", minHeight: 125 },
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
              <View style={{ height: tablet ? 65 : 40, justifyContent: "center" }}>{animalLetters[emoji] ? <AnimalArt letter={letter} size={tablet ? 65 : 40} /> : <Text style={[styles.emoji, tablet && { fontSize: 48 }]}>{emoji}</Text>}</View>
              <Text style={styles.word}>{word}</Text>
            </Animated.View>
          </Pressable>
        ))}
      </ScrollView>
      <Modal visible={expanded && !!activeItem} animationType="fade" onRequestClose={() => setExpanded(false)}>
        <SafeAreaView style={styles.fullScreen}>
          <Pressable accessibilityRole="button" onPress={() => setExpanded(false)} style={styles.expandButton}><Text style={styles.expandText}>✕ Back to letters</Text></Pressable>
          <Text style={styles.heroLetter}>{activeItem?.[0]}</Text>
          {activeItem && <LetterScene key={`big-${activeLetter}-${sceneVersion}`} letter={activeItem[0]} width={width - 24} height={Math.max(160, height - 230)} />}
          <Text style={styles.heroWord}>{activeItem?.[0]} is for {activeItem?.[1]}!</Text>
          <Text style={styles.heroHint}>{activeItem?.[3]}</Text>
        </SafeAreaView>
      </Modal>
      <Text style={styles.footer}>Little letters, big discoveries! ⭐</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: "#EEE8FF", alignItems: "center", justifyContent: "center" },
  expandButton: { backgroundColor: "#6946BC", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginVertical: 6 },
  expandText: { color: "white", fontSize: 16, fontWeight: "800" },
  safe: { flex: 1, backgroundColor: "#FFFDF7" },
  header: { paddingTop: 12, paddingHorizontal: 18, paddingBottom: 10, alignItems: "center" },
  eyebrow: { color: "#7C63C9", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#292348", fontSize: 25, fontWeight: "900", textAlign: "center", marginTop: 5 },
  subtitle: { color: "#68647A", fontSize: 13, marginTop: 4, textAlign: "center" },
  scene: {
    marginHorizontal: 14,
    minHeight: 300,
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
  heroContent: { flexShrink: 1, alignItems: "center", justifyContent: "center" },
  heroLetter: { fontSize: 48, lineHeight: 54, fontWeight: "900", color: "#5A3CB5" },
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

