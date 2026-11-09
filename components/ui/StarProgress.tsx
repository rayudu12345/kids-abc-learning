import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";
export default function StarProgress({
  earned,
  total = 5,
  style,
}: {
  earned: number;
  total?: number;
  style?: StyleProp<TextStyle>;
}) {
  const count = Math.max(0, Math.min(total, earned));
  return (
    <Text accessibilityLabel={`${count} of ${total} stars earned`} style={[styles.stars, style]}>
      {Array.from({ length: total }, (_, index) => (index < count ? "⭐" : "☆")).join(" ")}
    </Text>
  );
}
const styles = StyleSheet.create({
  stars: { fontSize: 30, color: "#AB7A17", textAlign: "center", marginVertical: 12 },
});
