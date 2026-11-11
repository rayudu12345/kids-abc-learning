import React from "react";
import { StyleSheet, Text, View } from "react-native";
export type SwatchItem = { id: string; name: string; symbol: string; color: string };
export default function LearningSwatch({
  item,
  shape = false,
}: {
  item: SwatchItem;
  shape?: boolean;
}) {
  let mark: React.ReactNode;
  if (!shape)
    mark = (
      <View style={[styles.patch, { backgroundColor: item.color }]}>
        <Text style={styles.symbol}>{item.symbol}</Text>
      </View>
    );
  else if (item.id === "triangle")
    mark = (
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 32,
          borderRightWidth: 32,
          borderBottomWidth: 60,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: item.color,
        }}
      />
    );
  else if (item.id === "star")
    mark = <Text style={{ fontSize: 72, color: item.color, lineHeight: 80 }}>★</Text>;
  else
    mark = (
      <View
        style={{
          width: item.id === "rectangle" ? 85 : 64,
          height: item.id === "rectangle" ? 42 : 64,
          borderRadius: item.id === "circle" || item.id === "oval" ? 50 : 4,
          backgroundColor: item.color,
          transform: item.id === "oval" ? [{ scaleX: 1.3 }, { scaleY: 0.75 }] : [],
        }}
      />
    );
  return (
    <View pointerEvents="none" style={styles.content}>
      <View style={styles.mark}>{mark}</View>
      <Text style={styles.name}>
        {item.name}
        {!shape ? ` ${item.symbol}` : ""}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  content: { alignItems: "center" },
  mark: { height: 85, justifyContent: "center" },
  patch: {
    height: 64,
    width: 64,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: { fontSize: 37, color: "#222" },
  name: { fontSize: 17, fontWeight: "900", color: "#39334D", textAlign: "center" },
});
