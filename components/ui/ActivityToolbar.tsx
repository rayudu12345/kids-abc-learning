import React from "react";
import { StyleSheet, View } from "react-native";
import ActionButton from "./ActionButton";
export default function ActivityToolbar({
  onExit,
  muted,
  onToggleSound,
  soundLabel = "Spoken prompts",
}: {
  onExit: () => void;
  muted: boolean;
  onToggleSound: () => void;
  soundLabel?: string;
}) {
  return (
    <View style={styles.toolbar}>
      <ActionButton onPress={onExit}>‹ Alphabet</ActionButton>
      <ActionButton
        accessibilityRole="switch"
        accessibilityLabel={soundLabel}
        accessibilityState={{ checked: !muted }}
        aria-checked={!muted}
        onPress={onToggleSound}
      >
        {muted ? "🔇 Sound off" : "🔊 Sound on"}
      </ActionButton>
    </View>
  );
}
const styles = StyleSheet.create({
  toolbar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
});
