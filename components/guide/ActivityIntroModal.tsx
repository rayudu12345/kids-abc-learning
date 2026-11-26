import React from "react";
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { activities } from "../../data/activities";
import { activityGuide, GuidedActivity } from "../../data/activityGuide";
import ActionButton from "../ui/ActionButton";
export default function ActivityIntroModal({
  activityId,
  muted,
  onClose,
  onHear,
  onPlay,
}: {
  activityId: GuidedActivity | null;
  muted: boolean;
  onClose: () => void;
  onHear: () => void;
  onPlay: () => void;
}) {
  const activity = activities.find((item) => item.id === activityId);
  if (!activityId || !activity) return null;
  const guide = activityGuide[activityId];
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card} accessibilityViewIsModal>
            <ActionButton accessibilityLabel="Close activity introduction" onPress={onClose}>
              ✕ Back to choices
            </ActionButton>
            <Text style={styles.icon}>{activity.icon}</Text>
            <Text style={styles.title}>{activity.title}</Text>
            <Text style={styles.instructions}>{guide.instruction}</Text>
            {guide.onlinePhotos && (
              <Text style={styles.note}>🌐 Internet is needed for real photos.</Text>
            )}
            <ActionButton
              onPress={onHear}
              disabled={muted}
              accessibilityLabel={`Replay introduction to ${activity.title}`}
            >
              🔊 Hear again
            </ActionButton>
            <ActionButton
              variant="primary"
              accessibilityLabel={`Start ${activity.title}`}
              onPress={onPlay}
            >
              {guide.group === "grownups" ? "Open with a grown-up" : "Let's play! 🌈"}
            </ActionButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(44,30,72,.55)" },
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  card: {
    width: "100%",
    maxWidth: 650,
    borderRadius: 30,
    backgroundColor: "#FFF7DE",
    padding: 22,
    alignItems: "center",
  },
  icon: { fontSize: 65, marginVertical: 12 },
  title: { color: "#57388E", fontSize: 29, fontWeight: "900", textAlign: "center" },
  instructions: {
    fontSize: 23,
    lineHeight: 34,
    color: "#493656",
    textAlign: "center",
    marginVertical: 20,
  },
  note: { fontSize: 18, color: "#615574", textAlign: "center", marginBottom: 12 },
});
