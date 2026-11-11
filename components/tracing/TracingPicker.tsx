import React from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { TraceItem } from "../../traceCatalog";
import { colors, inks } from "./traceTheme";
export default function TracingPicker({
  mode,
  items,
  index,
  completed,
  onSelect,
}: {
  mode: "letter" | "lowercase" | "animal";
  items: TraceItem[];
  index: number;
  completed: string[];
  onSelect: (index: number) => void;
}) {
  const { width } = useWindowDimensions();
  return (
    <>
      <Text style={styles.section}>🎨 Choose any {mode !== "animal" ? "letter" : "animal"}</Text>
      <View style={styles.grid}>
        {items.map((entry, i) => (
          <Pressable
            key={entry.id}
            accessibilityRole="button"
            accessibilityLabel={`Trace ${entry.name}`}
            accessibilityState={{ selected: index === i }}
            onPress={() => onSelect(i)}
            style={[
              styles.card,
              {
                backgroundColor: colors[i % colors.length],
                borderColor: i === index ? inks[i % inks.length] : "transparent",
                width: mode !== "animal" ? (width >= 600 ? "11%" : "18%") : "43%",
              },
            ]}
          >
            <Text style={[styles.cardLabel, { color: inks[i % inks.length] }]}>{entry.icon}</Text>
            {mode === "animal" && <Text style={styles.buttonText}>{entry.name}</Text>}
            {completed.includes(entry.id) && <Text style={styles.check}>✓</Text>}
          </Pressable>
        ))}
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  section: {
    fontSize: 22,
    fontWeight: "900",
    color: "#57388E",
    textAlign: "center",
    marginVertical: 15,
  },
  grid: {
    width: "100%",
    maxWidth: 800,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  card: {
    minHeight: 65,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    padding: 7,
  },
  cardLabel: { fontSize: 30, fontWeight: "900" },
  buttonText: { fontSize: 16, fontWeight: "800", color: "#58369E", textAlign: "center" },
  check: { color: "#176C50", fontWeight: "900", fontSize: 18 },
});
