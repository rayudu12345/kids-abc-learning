import { MAX_BACKUP_BYTES } from "./backupLogic";
export async function chooseBackupFile(): Promise<{ name: string; text: string } | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.hidden = true;
    input.dataset.testid = "backup-file-input";
    document.body.appendChild(input);
    const remove = () => input.remove();
    input.oncancel = () => {
      remove();
      resolve(null);
    };
    input.onchange = async () => {
      const file = input.files?.[0];
      remove();
      if (!file) {
        resolve(null);
        return;
      }
      if (file.size > MAX_BACKUP_BYTES) {
        reject(new Error("Backup is too large."));
        return;
      }
      try {
        resolve({ name: file.name, text: await file.text() });
      } catch {
        reject(new Error("Could not read this backup file."));
      }
    };
    input.click();
  });
}
export async function exportBackupFile(text: string): Promise<void> {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `kids-abc-backup-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
