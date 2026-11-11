import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { MAX_BACKUP_BYTES } from "./backupLogic";
export async function chooseBackupFile(): Promise<{ name: string; text: string } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if ((asset.size ?? 0) > MAX_BACKUP_BYTES) throw new Error("Backup is too large.");
  const file = new File(asset.uri);
  if (file.size > MAX_BACKUP_BYTES) throw new Error("Backup is too large.");
  return { name: asset.name, text: await file.text() };
}
export async function exportBackupFile(text: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("File sharing is not available on this device.");
  const file = new File(Paths.cache, `kids-abc-backup-${Date.now()}.json`);
  file.create({ overwrite: true });
  file.write(text);
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Save your progress backup outside the app",
  });
  // Leave the small cache file available while the destination app finishes copying it.
}
