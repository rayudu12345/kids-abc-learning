import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { activities } from "../../data/activities";
import { GuidedActivity } from "../../data/activityGuide";
import ActionButton from "../ui/ActionButton";
export default function ActivityGuideCard({
  activity,
  tablet,
  online,
  grownups,
  onIntroduction,
  onPlay,
}: {
  activity: (typeof activities)[number];
  tablet: boolean;
  online: boolean;
  grownups: boolean;
  onIntroduction: () => void;
  onPlay: (id: GuidedActivity) => void;
}) {
  return (
    <View
      style={[styles.card, { width: tablet ? "48%" : "100%", backgroundColor: activity.color }]}
    >
      <Text style={styles.icon}>{activity.icon}</Text>
      <Text style={styles.title}>{activity.title}</Text>
      <Text style={styles.detail}>{activity.detail}</Text>
      {online && <Text style={styles.badge}>🌐 Online photos</Text>}
      {grownups && <Text style={styles.badge}>For a grown-up</Text>}
      <ActionButton
        accessibilityLabel={`Introduction to ${activity.title}`}
        onPress={onIntroduction}
      >
        🔊 How to play
      </ActionButton>
      <ActionButton
        variant="primary"
        accessibilityLabel={`Launch ${activity.title}`}
        onPress={() => onPlay(activity.id as GuidedActivity)}
      >
        {grownups ? "Open with help" : "Play! ▶"}
      </ActionButton>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    padding: 14,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: 24,
    color: "#57388E",
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 8,
  },
  detail: { fontSize: 17, lineHeight: 24, color: "#493656", textAlign: "center" },
  badge: { fontSize: 16, fontWeight: "800", color: "#615574", marginVertical: 8 },
});
