import SceneModal from "./components/ui/SceneModal";
import ActivityToolbar from "./components/ui/ActivityToolbar";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import * as Speech from "expo-speech";
import { advancedAlphabet } from "./advancedAlphabet";
import AdvancedScene from "./AdvancedScene";
const themes = [
  { ink: "#A73B2B", accent: "#FF785C", soft: "#FFF0DB", card: "#FFE0C2" },
  { ink: "#176C62", accent: "#20BCA4", soft: "#DEFAF0", card: "#BEF0DE" },
  { ink: "#6F3EAA", accent: "#A478EC", soft: "#F1E7FF", card: "#E1CEFF" },
  { ink: "#135F91", accent: "#44B6E8", soft: "#E1F5FF", card: "#BFE9FF" },
  { ink: "#9C3261", accent: "#EF82AD", soft: "#FFEAF3", card: "#FFD1E3" },
  { ink: "#805B0B", accent: "#E9B331", soft: "#FFF8D5", card: "#FFEAA2" },
];
export default function AdvancedLetters({ onExit }: { onExit: () => void }) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [replay, setReplay] = useState(0);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const item = advancedAlphabet[index];
  const theme = themes[index % themes.length];
  const speak = () => {
    Speech.stop();
    if (!muted)
      Speech.speak(`${item.letter}. ${item.letter} is for ${item.word}. ${item.meaning}`, {
        language: "en-US",
        rate: 0.75,
      });
  };
  useEffect(() => {
    speak();
    return () => {
      Speech.stop();
    };
  }, [index, replay, muted]);
  const select = (next: number) => {
    Speech.stop();
    setIndex(next);
    setReplay((r) => r + 1);
  };
  return (
    <>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <ActivityToolbar
          onExit={onExit}
          muted={muted}
          soundLabel="Spoken explanations"
          onToggleSound={() => {
            Speech.stop();
            setMuted((value) => !value);
          }}
        />
        <Text style={styles.headerEmoji}>🌈 🚀 ✨</Text>
        <Text accessibilityLabel="Advanced Letters" style={styles.title}>
          {"Advanced Letters".split("").map((char, i) => (
            <Text key={i} style={{ color: themes[i % themes.length].ink }}>
              {char}
            </Text>
          ))}
        </Text>
        <Text style={styles.subtitle}>Big discoveries, one word at a time</Text>
        <View style={[styles.scene, { backgroundColor: theme.soft, borderColor: theme.accent }]}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View
              style={[
                styles.bubble,
                { width: 160, height: 160, left: -65, top: 40, backgroundColor: "#FFD3E4" },
              ]}
            />
            <View
              style={[
                styles.bubble,
                { width: 190, height: 190, right: -85, top: 120, backgroundColor: "#BFEDE7" },
              ]}
            />
            <View
              style={[
                styles.bubble,
                { width: 120, height: 120, right: 10, bottom: -65, backgroundColor: "#FFE193" },
              ]}
            />
          </View>
          <Text style={[styles.discovery, { backgroundColor: theme.card, color: theme.ink }]}>
            ✨ DISCOVERY {index + 1} OF 26 ✨
          </Text>
          <Text style={[styles.letter, { color: theme.ink }]}>
            {item.letter}{" "}
            <Text style={[styles.lower, { color: themes[(index + 2) % themes.length].ink }]}>
              {item.letter.toLowerCase()}
            </Text>
          </Text>
          <AdvancedScene
            key={`${index}-${replay}`}
            item={item}
            width={Math.min(width - 44, 900)}
            height={Math.min(height * 0.34, (width - 44) * 0.7)}
          />
          <Text style={[styles.word, { color: theme.ink }]}>
            {item.letter} is for {item.word}
          </Text>
          <View style={styles.factCard}>
            <Text style={styles.factLabel}>💡 A little discovery</Text>
            <Text style={styles.meaning}>{item.meaning}</Text>
          </View>
          <Text style={styles.subtitle}>{item.action}</Text>
          <View style={styles.controls}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setReplay((r) => r + 1)}
              style={[styles.button, { backgroundColor: "#146F68" }]}
            >
              <Text style={[styles.buttonText, { color: "white" }]}>↻ Hear and play again</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setExpanded(true)}
              style={[styles.button, { backgroundColor: "#A24475" }]}
            >
              <Text style={[styles.buttonText, { color: "white" }]}>⛶ Make it BIG!</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: index === 0 }}
            disabled={index === 0}
            onPress={() => select(index - 1)}
            style={[styles.button, { backgroundColor: "#DDF5F1" }, index === 0 && styles.disabled]}
          >
            <Text style={styles.buttonText}>← Previous</Text>
          </Pressable>
          <Text style={styles.subtitle}>{index + 1} / 26</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: index === 25 }}
            disabled={index === 25}
            onPress={() => select(index + 1)}
            style={[styles.button, { backgroundColor: "#FFE2B4" }, index === 25 && styles.disabled]}
          >
            <Text style={styles.buttonText}>Next →</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionTitle}>🎨 Pick your next discovery!</Text>
        <View style={styles.grid}>
          {advancedAlphabet.map((entry, i) => (
            <Pressable
              key={entry.letter}
              accessibilityRole="button"
              accessibilityLabel={`${entry.letter}, ${entry.word}`}
              accessibilityState={{ selected: i === index }}
              onPress={() => select(i)}
              style={[
                styles.card,
                {
                  width: width >= 600 ? "14%" : "28%",
                  backgroundColor: themes[i % themes.length].card,
                  borderColor:
                    i === index ? themes[i % themes.length].ink : themes[i % themes.length].accent,
                },
                i === index && styles.selected,
              ]}
            >
              <Text style={[styles.cardLetter, { color: themes[i % themes.length].ink }]}>
                {entry.letter}
              </Text>
              <Text style={styles.cardIcon}>{entry.icon}</Text>
              <Text style={styles.cardWord}>{entry.word}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <SceneModal
        backgroundColor={theme.soft}
        visible={expanded}
        onClose={() => setExpanded(false)}
        closeLabel="✕ Back to Advanced Letters"
        title={`${item.letter} is for ${item.word}`}
        description={item.meaning}
      >
        <AdvancedScene item={item} width={width - 24} height={Math.max(150, height - 260)} />
      </SceneModal>
    </>
  );
}
const styles = StyleSheet.create({
  headerEmoji: { fontSize: 32, marginTop: 12 },
  bubble: { position: "absolute", borderRadius: 110, opacity: 0.5 },
  discovery: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginVertical: 6,
  },
  factCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginVertical: 10,
    width: "100%",
    maxWidth: 800,
  },
  factLabel: {
    color: "#846019",
    fontWeight: "800",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 22,
    color: "#57388E",
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 18,
  },
  cardIcon: { fontSize: 32, marginVertical: 5 },
  page: { flex: 1, backgroundColor: "#F0FBFF" },
  content: { alignItems: "center", padding: 12, paddingBottom: 30 },
  button: {
    padding: 13,
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "#EEE8FF",
    marginVertical: 6,
  },
  buttonText: { color: "#58369e", fontSize: 16, fontWeight: "800", textAlign: "center" },
  title: { fontSize: 30, fontWeight: "900", color: "#292348", textAlign: "center", marginTop: 15 },
  subtitle: {
    fontSize: 15,
    color: "#6B647E",
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  scene: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#EEE8FF",
    borderRadius: 32,
    borderWidth: 3,
    overflow: "hidden",
    padding: 12,
    marginVertical: 12,
  },
  letter: { fontSize: 58, color: "#59359b", fontWeight: "900" },
  lower: { color: "#A28ABB" },
  word: {
    fontSize: 25,
    fontWeight: "900",
    color: "#292348",
    textAlign: "center",
    marginVertical: 8,
  },
  meaning: {
    fontSize: 18,
    color: "#514361",
    textAlign: "center",
    lineHeight: 27,
    maxWidth: 760,
    paddingHorizontal: 10,
  },
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  disabled: { opacity: 0.4 },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  card: {
    minHeight: 140,
    backgroundColor: "#FFF0C9",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F1DEB2",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  selected: { borderWidth: 4, transform: [{ scale: 1.03 }] },
  cardLetter: { fontSize: 34, fontWeight: "900", color: "#59359b" },
  cardWord: { fontSize: 12, fontWeight: "700", color: "#514361", textAlign: "center" },
});
