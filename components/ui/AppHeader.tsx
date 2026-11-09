import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ActionButton from "./ActionButton";
export default function AppHeader({
  title,
  onOpenMenu,
}: {
  title: string;
  onOpenMenu: () => void;
}) {
  return (
    <View style={styles.header}>
      <ActionButton accessibilityLabel="Open activity menu" variant="primary" onPress={onOpenMenu}>
        ☰ Menu
      </ActionButton>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F0FBFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DCECF1",
  },
  title: { flex: 1, color: "#57388E", fontWeight: "800", fontSize: 17 },
});
