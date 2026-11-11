import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useProgress } from "../ProgressStore";
import { createBackup, validateBackup, ProgressBackup as Backup } from "../backupLogic";
import { chooseBackupFile, exportBackupFile } from "../backupFiles";
import ActionButton from "../components/ui/ActionButton";
import FeedbackMessage from "../components/ui/FeedbackMessage";
export default function ProgressBackup({ onExit }: { onExit: () => void }) {
  const { progress, restoreProgress, restoring } = useProgress();
  const [preview, setPreview] = useState<Backup | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [name, setName] = useState("");
  const exportFile = async () => {
    setBusy(true);
    setMessage("");
    try {
      await exportBackupFile(createBackup(progress));
      setMessage(
        "Backup export opened. Save the JSON file in Files or another location outside this app.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Backup export failed.");
    } finally {
      setBusy(false);
    }
  };
  const importFile = async () => {
    setBusy(true);
    setPreview(null);
    setMessage("");
    try {
      const file = await chooseBackupFile();
      if (file) {
        setPreview(validateBackup(file.text));
        setName(file.name);
      }
    } catch (error) {
      setMessage(
        `${error instanceof Error ? error.message : "Cannot read backup."} Current progress has not been changed.`,
      );
    } finally {
      setBusy(false);
    }
  };
  const restore = async () => {
    if (!preview) return;
    setMessage("");
    try {
      await restoreProgress(preview.progress);
      setPreview(null);
      setMessage("Backup restored successfully. Your progress is now saved on this device.");
    } catch {
      setMessage("Restore failed. Current progress has been kept. Please try again.");
    }
  };
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ActionButton onPress={onExit} disabled={restoring}>
        ‹ Alphabet
      </ActionButton>
      <Text style={styles.title}>💾 Progress backup and restore</Text>
      <Text style={styles.note}>
        For an adult: save a backup outside this app so it survives uninstalling or clearing app
        data. Backups contain learning progress, not accounts or passwords.
      </Text>
      <View style={styles.summary}>
        <Text style={styles.subtitle}>Current progress</Text>
        <Text style={styles.note}>
          {progress.stars} stars · {progress.stickers.length} animal stickers
        </Text>
        <Text style={styles.note}>
          {progress.tracedLetters.length} uppercase · {progress.tracedLowercase.length} lowercase ·{" "}
          {progress.tracedAnimals.length} animal tracings
        </Text>
      </View>
      <ActionButton
        variant="primary"
        onPress={() => void exportFile()}
        disabled={busy || restoring}
      >
        Export progress backup
      </ActionButton>
      <ActionButton onPress={() => void importFile()} disabled={busy || restoring}>
        Choose backup to restore
      </ActionButton>
      {preview && (
        <View style={styles.preview}>
          <Text style={styles.subtitle}>Backup preview</Text>
          <Text style={styles.note}>{name}</Text>
          <Text style={styles.note}>Saved {new Date(preview.exportedAt).toLocaleString()}</Text>
          <Text style={styles.note}>
            {preview.progress.stars} stars · {preview.progress.stickers.length} animal stickers
          </Text>
          <Text style={styles.note}>
            {preview.progress.tracedLetters.length} uppercase ·{" "}
            {preview.progress.tracedLowercase.length} lowercase ·{" "}
            {preview.progress.tracedAnimals.length} animal tracings
          </Text>
          <Text style={styles.confirm}>
            Restoring will replace the current progress with this backup. Export your current
            progress first if you want to keep both.
          </Text>
          <ActionButton variant="primary" disabled={restoring} onPress={() => void restore()}>
            {restoring ? "Restoring…" : "Confirm: replace current progress"}
          </ActionButton>
          <ActionButton disabled={restoring} onPress={() => setPreview(null)}>
            Cancel restore
          </ActionButton>
        </View>
      )}
      <FeedbackMessage>{message}</FeedbackMessage>
      <Text style={styles.note}>
        Export alone does not guarantee a backup was saved. On Android, choose a destination in the
        system share dialog. Keep the file outside the app and verify it appears in Files.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F0FBFF" },
  content: { alignItems: "center", padding: 20, paddingBottom: 35 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#57388E",
    textAlign: "center",
    marginVertical: 18,
  },
  subtitle: { fontSize: 22, fontWeight: "800", color: "#267866", textAlign: "center" },
  note: {
    fontSize: 16,
    color: "#615574",
    textAlign: "center",
    lineHeight: 24,
    marginVertical: 10,
    maxWidth: 760,
  },
  summary: {
    width: "100%",
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#FFF0C9",
    marginVertical: 15,
  },
  preview: {
    width: "100%",
    padding: 18,
    borderWidth: 3,
    borderColor: "#9D83C7",
    borderRadius: 24,
    backgroundColor: "#EEE7FA",
    marginVertical: 20,
  },
  confirm: {
    fontSize: 17,
    fontWeight: "800",
    color: "#893A57",
    textAlign: "center",
    lineHeight: 25,
    marginVertical: 15,
  },
});
