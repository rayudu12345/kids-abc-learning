# Validation record

The 1.1.0 feature expansion is validated locally using the commands below. The authoritative current result is the CI run for the exact commit being released.

```sh
npm ci
npm run check
npx expo install --check
npx playwright install chromium
npm run test:integration
npm run build:android
```

## Local results for version 1.1.0

| Check                         | Result                                      |
| ----------------------------- | ------------------------------------------- |
| Clean `npm ci`                | Passed                                      |
| Formatting and TypeScript     | Passed                                      |
| Unit tests                    | 83 passed                                   |
| Chromium integration tests    | 24 passed across phone and tablet viewports |
| Expo dependency compatibility | Passed                                      |
| Android Hermes bundle export  | Passed                                      |

The unit suite covers the pure business rules and storage adapter. The integration suite renders the real web app in Chromium at 390 × 844 and 800 × 1100, including pointer gestures and persistence failures. See [Testing](TESTING.md) for the assertions and limits.

Physical Samsung tablet, native Android gesture/audio behavior, APK installation, and an airplane-mode cold launch still require device verification. No store publication or signed release build is implied by these automated checks.

The 1.1.0 expansion adds licensed offline audio, initial-sound practice, lowercase tracing, counting, colors/shapes, validated backup/restore, and four-pose animal sprites. Audio gaps and native-device verification requirements are detailed in [Audio and assets](AUDIO_AND_ASSETS.md) and [Backup and restore](BACKUP_AND_RESTORE.md).
