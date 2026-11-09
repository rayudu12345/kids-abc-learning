import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { AnimalArt, animalLetters } from "../../AnimalArt";
import { alphabet } from "../../LetterScene";
const colors = ["#FFE3E3", "#DFF4FF", "#E6F8E7", "#FFF0C9", "#F0E5FF", "#FFE5F3"];
function AlphabetCard({
  item,
  index,
  tablet,
  selected,
  bounce,
  onSelect,
}: {
  item: string[];
  index: number;
  tablet: boolean;
  selected: boolean;
  bounce: Animated.Value;
  onSelect: (letter: string, word: string) => void;
}) {
  const [letter, word, emoji] = item;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${letter}, ${word}. Play animation and pronunciation`}
      accessibilityState={{ selected }}
      onPress={() => onSelect(letter, word)}
      style={({ pressed }) => [
        styles.card,
        tablet && { width: "14%", minHeight: 125 },
        { backgroundColor: colors[index % colors.length] },
        selected && styles.selected,
        pressed && { opacity: 0.78 },
      ]}
    >
      <Animated.View
        style={{ alignItems: "center", transform: [{ scale: selected ? bounce : 1 }] }}
      >
        <Text style={styles.letter}>{letter}</Text>
        <View style={{ height: tablet ? 65 : 40, justifyContent: "center" }}>
          {animalLetters[emoji] ? (
            <AnimalArt letter={letter} size={tablet ? 65 : 40} />
          ) : (
            <Text style={{ fontSize: tablet ? 48 : 25 }}>{emoji}</Text>
          )}
        </View>
        <Text style={styles.word}>{word}</Text>
      </Animated.View>
    </Pressable>
  );
}
export default function AlphabetGrid({
  tablet,
  activeLetter,
  bounce,
  onSelect,
}: {
  tablet: boolean;
  activeLetter: string | null;
  bounce: Animated.Value;
  onSelect: (letter: string, word: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {alphabet.map((item, index) => (
        <AlphabetCard
          key={item[0]}
          item={item}
          index={index}
          tablet={tablet}
          selected={activeLetter === item[0]}
          bounce={bounce}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    width: "21.5%",
    minHeight: 96,
    margin: "1.5%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: "rgba(60,40,100,0.06)",
  },
  selected: { borderColor: "#7C63C9", borderWidth: 2 },
  letter: { color: "#292348", fontSize: 25, fontWeight: "900" },
  word: { color: "#39334D", fontSize: 10, fontWeight: "800", marginTop: 3, textAlign: "center" },
});
