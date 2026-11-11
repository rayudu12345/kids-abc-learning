# Progress backup and restore

Open **Menu → Progress backup**. This screen is intended for an adult; it is not a parental-control system.

## Export

1. Choose **Export progress backup**.
2. On Android, choose a destination such as Files in the system share dialog. On web, save the downloaded JSON file.
3. Verify the JSON file exists outside the app. The temporary app-cache copy is not a durable backup and does not survive uninstalling/clearing data.

The file contains stars, unique stickers, completed-activity counts, and upper/lowercase, animal, phonics, number, color, and shape progress. It contains no account credentials. No server or cloud service is required; a chosen storage provider may independently require connectivity.

## Restore

1. Choose **Choose backup to restore** and select the JSON file.
2. The app validates size, format, backup version, saved-data version, counters, identifiers, duplicates, and timestamp.
3. Review the preview (date, stars, stickers, and tracing counts).
4. Export current progress first if you want to keep both versions.
5. Choose **Confirm: replace current progress**, or cancel.

Restoration replaces rather than merges progress. The provider writes the validated data successfully before updating in-memory progress. Navigation is blocked during the replacement write. Reading, validation, cancellation, and failed writes do not replace current in-memory progress. Local storage's individual-key write behavior is provided by AsyncStorage/Android; a hardware/storage failure still requires device recovery procedures.

## Format and limits

- Format: `kids-abc-progress-backup`.
- Backup version: `1`.
- Saved progress version: `1`, with additive fields for the new activities.
- Maximum size: 200,000 UTF-8 bytes.
- Unknown future versions, invalid counts, unknown IDs, duplicate IDs, and malformed JSON are rejected.
- Older version-1 progress can omit the newer fields; those fields initialize empty while existing rewards remain intact.

Keep backup files private as learning-progress data. Do not edit them manually unless debugging a copy. Never clear app data or uninstall as a routine update step before exporting and verifying a backup.

Native Android picker/share behavior and restoring across two installed signed APK versions require physical-device verification. Browser integration tests cover export downloads, rejected files, previews, cancellation, failed replacement, successful replacement, and reload.
