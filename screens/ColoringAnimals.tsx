import React from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { animalTraces } from "../traceCatalog";
import { paintColors, MAX_PAINT_DOTS } from "../coloringLogic";
import useColoring from "../hooks/useColoring";
import useActivityAudio from "../hooks/useActivityAudio";
import PaintCanvas from "../components/coloring/PaintCanvas";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import ActionButton from "../components/ui/ActionButton";
import FeedbackMessage from "../components/ui/FeedbackMessage";
export default function ColoringAnimals({
  onExit,
  onOpenStudio,
}: {
  onExit: () => void;
  onOpenStudio: () => void;
}) {
  const { width, height } = useWindowDimensions(),
    paint = useColoring(),
    audio = useActivityAudio();
  const item = animalTraces.find((animal) => animal.id === paint.animal)!;
  const size = Math.max(200, Math.min(width - 32, height * 0.58, 620));
  return (
    <ScrollView
      style={styles.page}
      scrollEnabled={!paint.draft}
      contentContainerStyle={styles.content}
    >
      <ActivityToolbar
        onExit={onExit}
        muted={audio.muted}
        onToggleSound={audio.toggleSound}
        soundLabel="Color names"
      />
      <Text style={styles.title}>🎨 Color animal friends</Text>
      <ActionButton onPress={onOpenStudio}>🖌 Open Paint Studio</ActionButton>
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.row}>
        {paintColors.map((color) => (
          <ActionButton
            key={color.name}
            accessibilityLabel={`Paint ${color.name}`}
            accessibilityState={{ selected: paint.color.name === color.name }}
            onPress={() => {
              paint.setColor(color);
              if (color.recording) audio.play([color.recording]);
            }}
            style={{
              backgroundColor: color.name === "Eraser" ? "#EEEEEE" : color.color,
              borderWidth: 3,
              borderColor: paint.color.name === color.name ? "#493656" : "#FFFFFF",
            }}
            textStyle={{ color: ["Yellow", "Eraser"].includes(color.name) ? "#493656" : "#FFFFFF" }}
          >{`${color.name}${paint.color.name === color.name ? " ✓" : ""}`}</ActionButton>
        ))}
      </View>
      <View style={styles.row}>
        {[12, 24, 36].map((brush) => (
          <ActionButton
            key={brush}
            accessibilityLabel={`${brush === 12 ? "Small" : brush === 24 ? "Medium" : "Big"} brush`}
            accessibilityState={{ selected: paint.brush === brush }}
            onPress={() => paint.setBrush(brush)}
          >{`${brush === 12 ? "Small" : brush === 24 ? "Medium" : "Big"} brush${paint.brush === brush ? " ✓" : ""}`}</ActionButton>
        ))}
      </View>
      <PaintCanvas
        item={item}
        marks={paint.marks}
        draft={paint.draft}
        size={size}
        onStart={paint.start}
        onMove={paint.move}
        onEnd={paint.end}
      />
      <View style={styles.row}>
        <ActionButton disabled={!paint.canUndo} onPress={paint.undo}>
          ↶ Undo
        </ActionButton>
        <ActionButton disabled={!paint.marks.length} onPress={paint.clear}>
          Clear picture
        </ActionButton>
      </View>
      <FeedbackMessage>
        {paint.total >= MAX_PAINT_DOTS
          ? "A page full of color! Undo or clear to make more room."
          : "Tap or paint with your finger. Every picture is yours!"}
      </FeedbackMessage>
      <Text style={styles.note}>
        Pictures stay while this activity is open. Take a screenshot to keep one. Undo can restore a
        cleared picture.
      </Text>
      <Text style={styles.name}>Choose an animal</Text>
      <View style={styles.row}>
        {animalTraces.map((animal) => (
          <ActionButton
            key={animal.id}
            accessibilityLabel={`Color ${animal.name}`}
            accessibilityState={{ selected: animal.id === paint.animal }}
            onPress={() => paint.selectAnimal(animal.id)}
          >{`${animal.icon} ${animal.name}`}</ActionButton>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFF4F8" },
  content: { padding: 16, alignItems: "center", paddingBottom: 35 },
  title: {
    color: "#57388E",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 18,
  },
  name: { color: "#267866", fontSize: 25, fontWeight: "900", marginVertical: 12 },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginVertical: 8,
  },
  note: {
    color: "#615574",
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
    marginVertical: 14,
    maxWidth: 700,
  },
});
