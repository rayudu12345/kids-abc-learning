import React from "react";
import { StyleSheet, Text, View } from "react-native";
export function BalloonArt({ color, letter }: { color: string; letter: string }) {
  return (
    <View pointerEvents="none" style={styles.art}>
      <View style={[styles.balloon, { backgroundColor: color }]}>
        <View style={styles.shine} />
        <View style={styles.badge}>
          <Text style={styles.letter}>{letter}</Text>
        </View>
      </View>
      <View style={[styles.knot, { borderBottomColor: color }]} />
      <View style={styles.string} />
      <View style={styles.stringBend} />
    </View>
  );
}
export function KiteArt({ color }: { color: string }) {
  return (
    <View pointerEvents="none" style={styles.art}>
      <View style={[styles.kite, { backgroundColor: color }]}>
        <View style={styles.sparHorizontal} />
        <View style={styles.sparVertical} />
        <Text style={styles.kiteStar}>★</Text>
      </View>
      <View style={styles.tail} />
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.ribbon,
            {
              top: 105 + index * 21,
              backgroundColor: ["#EF7DA8", "#F2C94C", "#64C8B0"][index],
              transform: [{ rotate: index % 2 ? "-20deg" : "20deg" }],
            },
          ]}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  art: { width: 90, height: 170 },
  balloon: {
    position: "absolute",
    left: 7,
    top: 5,
    width: 76,
    height: 94,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: "rgba(35,29,75,0.16)",
  },
  shine: {
    position: "absolute",
    left: 14,
    top: 12,
    width: 13,
    height: 28,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.65)",
    transform: [{ rotate: "25deg" }],
  },
  badge: {
    alignSelf: "center",
    marginTop: 31,
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#FFF9E8",
    alignItems: "center",
    justifyContent: "center",
  },
  letter: { fontSize: 27, fontWeight: "900", color: "#39334D" },
  knot: {
    position: "absolute",
    left: 37,
    top: 96,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 11,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  string: {
    position: "absolute",
    top: 107,
    left: 43,
    height: 35,
    width: 2,
    backgroundColor: "#947EA8",
    transform: [{ rotate: "-8deg" }],
  },
  stringBend: {
    position: "absolute",
    top: 140,
    left: 46,
    height: 25,
    width: 2,
    backgroundColor: "#947EA8",
    transform: [{ rotate: "15deg" }],
  },
  kite: {
    position: "absolute",
    left: 13,
    top: 15,
    width: 64,
    height: 64,
    transform: [{ rotate: "45deg" }],
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#61517E",
    overflow: "hidden",
  },
  sparHorizontal: {
    position: "absolute",
    left: 0,
    top: 29,
    width: 64,
    height: 3,
    backgroundColor: "#FFECCA",
  },
  sparVertical: {
    position: "absolute",
    top: 0,
    left: 29,
    width: 3,
    height: 64,
    backgroundColor: "#FFECCA",
  },
  kiteStar: {
    position: "absolute",
    left: 16,
    top: 12,
    fontSize: 30,
    color: "#FFF8D0",
    transform: [{ rotate: "-45deg" }],
  },
  tail: {
    position: "absolute",
    left: 44,
    top: 91,
    height: 73,
    width: 2,
    backgroundColor: "#9277AB",
    transform: [{ rotate: "8deg" }],
  },
  ribbon: { position: "absolute", left: 30, width: 27, height: 10, borderRadius: 3 },
});
