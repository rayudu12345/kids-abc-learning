import React from "react";
import { animalTraces } from "./traceCatalog";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
export const activities = [
  {
    id: "home",
    icon: "🌈",
    title: "Alphabet A–Z",
    detail: "Explore letters, pictures and animations",
    color: "#D7F3FF",
  },
  {
    id: "find",
    icon: "🔎",
    title: "Find the letter",
    detail: "Listen and choose the right letter",
    color: "#E7D9FF",
  },
  {
    id: "match",
    icon: "🐶",
    title: "Match the animals",
    detail: "Drag animal friends together",
    color: "#D4F4E4",
  },
  {
    id: "traceLetters",
    icon: "✍️",
    title: "Trace letters A–Z",
    detail: "Follow colorful uppercase paths",
    color: "#FFE0ED",
  },
  {
    id: "traceLowercase",
    icon: "✍️",
    title: "Trace lowercase a–z",
    detail: "Little letters, big discoveries",
    color: "#D7F3FF",
  },
  {
    id: "traceAnimals",
    icon: "🐾",
    title: "Draw animals",
    detail: `Trace ${animalTraces.length} animal outlines`,
    color: "#FFE2CC",
  },
  {
    id: "pairs",
    icon: "🔤",
    title: "Big & little letters",
    detail: "Match uppercase and lowercase",
    color: "#D7F3FF",
  },
  {
    id: "phonics",
    icon: "👄",
    title: "Letter sounds",
    detail: "Gentle initial-sound practice",
    color: "#FFE0ED",
  },
  {
    id: "counting",
    icon: "🔢",
    title: "Numbers and counting",
    detail: "Count animal friends from 1 to 10",
    color: "#D4F4E4",
  },
  {
    id: "colorsShapes",
    icon: "🎨",
    title: "Colors and shapes",
    detail: "Match names, symbols and pictures",
    color: "#FFE0ED",
  },
  {
    id: "advanced",
    icon: "🚀",
    title: "Advanced Letters",
    detail: "Discover 26 amazing new words",
    color: "#E7D9FF",
  },
  {
    id: "audio",
    icon: "🔊",
    title: "Listen and explore",
    detail: "Offline recordings and animal sounds",
    color: "#FFE2CC",
  },
  {
    id: "stickers",
    icon: "⭐",
    title: "My sticker book",
    detail: "Your saved stars and discoveries",
    color: "#FFEDAD",
  },
  {
    id: "backup",
    icon: "💾",
    title: "Progress backup",
    detail: "Adult export and restore",
    color: "#FFEDAD",
  },
] as const;
export type Screen = (typeof activities)[number]["id"];
export default function SideMenu({
  visible,
  current,
  onClose,
  onNavigate,
}: {
  visible: boolean;
  current: Screen;
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  const { width } = useWindowDimensions();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close activity menu"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView
          accessibilityViewIsModal
          style={[styles.drawer, { width: Math.min(width * 0.88, 370) }]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>🌈 Let's explore!</Text>
              <Text style={styles.subtitle}>Choose an activity</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              onPress={onClose}
              style={styles.close}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.list}>
            {activities.map((activity) => (
              <Pressable
                key={activity.id}
                accessibilityRole="button"
                accessibilityLabel={`Open ${activity.title}`}
                aria-current={current === activity.id ? "page" : undefined}
                accessibilityState={{ selected: current === activity.id }}
                onPress={() => onNavigate(activity.id)}
                style={({ pressed }) => [
                  styles.item,
                  { backgroundColor: activity.color },
                  current === activity.id && styles.selected,
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Text style={styles.icon}>{activity.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{activity.title}</Text>
                  <Text style={styles.detail}>{activity.detail}</Text>
                </View>
                {current === activity.id && <Text style={styles.tick}>✓</Text>}
              </Pressable>
            ))}
          </ScrollView>
          <Text style={styles.footer}>Little letters, big discoveries! ✨</Text>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(35,24,61,0.45)" },
  drawer: {
    height: "100%",
    backgroundColor: "#FFFDF7",
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  title: { fontSize: 23, fontWeight: "900", color: "#57388E" },
  subtitle: { color: "#6B647E", fontSize: 14, marginTop: 6 },
  close: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#57388E", fontSize: 22, fontWeight: "800" },
  list: { padding: 12, gap: 10, paddingBottom: 25 },
  item: {
    minHeight: 82,
    borderWidth: 3,
    borderColor: "transparent",
    borderRadius: 22,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selected: { borderColor: "#7751C5" },
  icon: { fontSize: 29 },
  itemTitle: { fontSize: 17, color: "#39334D", fontWeight: "900" },
  detail: { fontSize: 12, color: "#655574", marginTop: 4 },
  tick: { fontWeight: "900", color: "#684399", fontSize: 22 },
  footer: { textAlign: "center", color: "#6B647E", fontSize: 12, padding: 15 },
});
