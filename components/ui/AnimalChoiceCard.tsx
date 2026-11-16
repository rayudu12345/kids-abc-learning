import React from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions } from "react-native";
import { AnimatedAnimal } from "../../AnimalArt";
export default function AnimalChoiceCard({
  letter,
  name,
  disabled,
  highlighted,
  onPress,
}: {
  letter: string;
  name: string;
  disabled: boolean;
  highlighted: boolean;
  onPress: () => void;
}) {
  const { width } = useWindowDimensions();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Choose ${name}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: highlighted ? "#C6F1DF" : "#FFE6AD" },
        pressed && { opacity: 0.75 },
      ]}
    >
      <AnimatedAnimal letter={letter} size={width >= 600 ? 185 : 115} animate={!disabled} />
      <Text style={styles.name}>
        {name}
        {highlighted ? " ⭐" : ""}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 170,
    borderRadius: 28,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  name: { color: "#57388E", fontSize: 27, fontWeight: "900", marginTop: 12 },
});
