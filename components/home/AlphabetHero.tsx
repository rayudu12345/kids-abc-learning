import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import LetterScene from "../../LetterScene";
import ActionButton from "../ui/ActionButton";
export default function AlphabetHero({
  item,
  version,
  scale,
  width,
  height,
  onExpand,
}: {
  item?: string[];
  version: number;
  scale: Animated.Value;
  width: number;
  height: number;
  onExpand: () => void;
}) {
  if (!item)
    return (
      <View style={[styles.scene, styles.empty]}>
        <Text style={{ fontSize: 42 }}>🎈 🧸 🎈</Text>
        <Text style={styles.emptyTitle}>Choose a letter!</Text>
        <Text style={styles.hint}>Your animated learning scene will appear here.</Text>
      </View>
    );
  return (
    <View style={styles.scene}>
      <Text style={styles.stars}>✨ ⭐ ✨</Text>
      <Animated.View style={{ alignItems: "center", transform: [{ scale }] }}>
        <Text style={styles.letter}>{item[0]}</Text>
        <LetterScene key={`${item[0]}-${version}`} letter={item[0]} width={width} height={height} />
        <ActionButton
          variant="primary"
          accessibilityLabel="Show animation full screen"
          onPress={onExpand}
        >
          ⛶ Make it BIG!
        </ActionButton>
        <Text style={styles.hint}>{item[3]}</Text>
        <Text style={styles.word}>
          {item[0]} is for {item[1]}!
        </Text>
        <Text style={styles.hint}>🔊 Listen and say it with me!</Text>
      </Animated.View>
      <Text style={styles.stars}>🌈 🎉 🌈</Text>
    </View>
  );
}
const styles = StyleSheet.create({
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
  empty: { backgroundColor: "#FFF0C9", borderColor: "#FFE2A0" },
  emptyTitle: { color: "#694A9E", fontSize: 22, fontWeight: "900" },
  stars: { fontSize: 22 },
  letter: { fontSize: 48, lineHeight: 54, fontWeight: "900", color: "#5A3CB5" },
  word: { color: "#292348", fontSize: 21, fontWeight: "900", marginTop: 5 },
  hint: {
    color: "#6B5C9D",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
    textAlign: "center",
    paddingHorizontal: 8,
  },
});
