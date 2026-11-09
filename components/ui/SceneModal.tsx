import React from "react";
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import ActionButton from "./ActionButton";
export default function SceneModal({
  visible,
  onClose,
  title,
  description,
  children,
  closeLabel = "✕ Back to letters",
  backgroundColor = "#EEE8FF",
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  closeLabel?: string;
  backgroundColor?: string;
}) {
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={[styles.page, { backgroundColor }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <ActionButton onPress={onClose}>{closeLabel}</ActionButton>
          <Text style={styles.title}>{title}</Text>
          {children}
          {description && <Text style={styles.description}>{description}</Text>}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#EEE8FF" },
  content: { alignItems: "center", padding: 12 },
  title: {
    color: "#292348",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 10,
  },
  description: {
    color: "#514361",
    fontSize: 18,
    lineHeight: 27,
    textAlign: "center",
    padding: 12,
    maxWidth: 800,
  },
});
