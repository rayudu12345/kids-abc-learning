import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
export default function SurpriseEgg({
  cracks,
  color,
  onPress,
}: {
  cracks: number;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Tap surprise egg. ${cracks} of 3 taps.`}
      onPress={onPress}
      style={styles.target}
    >
      <View style={[styles.egg, { backgroundColor: color }]}>
        <View style={styles.shine} />
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { left: 24 + (index % 3) * 57, top: 68 + Math.floor(index / 3) * 58 },
            ]}
          />
        ))}
        {cracks > 0 && <Text style={styles.crack}>ϟ</Text>}
        {cracks > 1 && (
          <Text style={[styles.crack, { left: 102, top: 90, transform: [{ rotate: "35deg" }] }]}>
            ϟ
          </Text>
        )}
      </View>
      <Text style={styles.hint}>Tap, tap, surprise! ✨</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  target: { minHeight: 320, minWidth: 260, alignItems: "center", justifyContent: "center" },
  egg: {
    width: 208,
    height: 255,
    borderTopLeftRadius: 105,
    borderTopRightRadius: 105,
    borderBottomLeftRadius: 85,
    borderBottomRightRadius: 85,
    borderWidth: 5,
    borderColor: "#FFFFFF",
    overflow: "hidden",
  },
  shine: {
    position: "absolute",
    left: 29,
    top: 39,
    width: 22,
    height: 66,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    opacity: 0.5,
    transform: [{ rotate: "20deg" }],
  },
  dot: {
    position: "absolute",
    width: 23,
    height: 26,
    borderRadius: 15,
    backgroundColor: "#FFF8D9",
    opacity: 0.8,
  },
  crack: {
    position: "absolute",
    top: 48,
    left: 68,
    color: "#FFFFFF",
    fontSize: 105,
    fontWeight: "900",
  },
  hint: { fontSize: 22, fontWeight: "900", color: "#57388E", marginTop: 12 },
});
