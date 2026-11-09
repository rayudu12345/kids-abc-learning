import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
export default function LetterChoice({
  letter,
  lowercase = false,
  highlighted,
  disabled,
  onPress,
}: {
  letter: string;
  lowercase?: boolean;
  highlighted: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${lowercase ? "Lowercase" : "Letter"} ${letter}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        highlighted && styles.highlighted,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={styles.letter}>{lowercase ? letter.toLowerCase() : letter}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 125,
    maxWidth: 200,
    backgroundColor: "#DFF4FF",
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#C2E2EF",
    alignItems: "center",
    justifyContent: "center",
  },
  highlighted: { borderColor: "#7751C5", backgroundColor: "#F0E5FF" },
  letter: { fontSize: 68, fontWeight: "900", color: "#292348" },
});
