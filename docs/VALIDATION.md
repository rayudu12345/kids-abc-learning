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

## Local results for version 1.1.0 — 26 November 2026

| Check                         | Result                                      |
| ----------------------------- | ------------------------------------------- |
| Clean `npm ci`                | Passed                                      |
| Formatting and TypeScript     | Passed                                      |
| Unit tests                    | 112 passed                                  |
| Chromium integration tests    | 66 passed across phone and tablet viewports |
| Expo dependency compatibility | Passed                                      |
| Android Hermes bundle export  | Passed                                      |

The unit suite covers the pure business rules and storage adapter. The integration suite renders the real web app in Chromium at 390 × 844 and 800 × 1100, including pointer gestures and persistence failures. See [Testing](TESTING.md) for the assertions and limits.

Physical Samsung tablet, native Android gesture/audio behavior, APK installation, and an airplane-mode cold launch still require device verification. No store publication or signed release build is implied by these automated checks.

The 1.1.0 expansion adds licensed offline audio, initial-sound practice, lowercase tracing, counting, colors/shapes, validated backup/restore, and four-pose animal sprites. Audio gaps and native-device verification requirements are detailed in [Audio and assets](AUDIO_AND_ASSETS.md) and [Backup and restore](BACKUP_AND_RESTORE.md).

The latest checks include the Play and learn introductions, alphabet-only home with all activities in the side menu and two/four-piece animal picture puzzles. All 12 new phone/tablet integration cases also passed independently before the full regression run. Existing audio cleanup, storage migration and invalid-backup suites remain passing. No dependency changes or new media assets were required.

## Alphabet home follow-up — 26 November 2026

Removed the home activity shortcuts while preserving every side-menu destination. Formatting, TypeScript, all 112 unit tests, the 18 targeted phone/tablet navigation and app integration cases, and Android Hermes export passed. The full 66-case result above records the preceding feature expansion; CI runs the full suite again for this follow-up. Physical APK checks remain as described above.

## Larger animal puzzles — 26 November 2026

Added optional 6, 9, 12, 16, 25 and 36-piece levels alongside 2/4. All 112 unit tests and 16 targeted phone/tablet puzzle and guide integration cases passed, including complete 36-piece placement, one-star rewards, tray paging/reset, hints and actual dragging with targets at least 48 CSS pixels wide/high. Formatting, TypeScript and Android Hermes export passed. No dependency, asset or progress-schema changes. Verify native finger dragging and landscape layout on the Samsung tablet after rebuilding the APK.

## Natural animal calls and smoother motion — 27 November 2026

Added attributed elephant, lion and parrot calls alongside cat/dog recordings, matching call-only replay, five-species sound matching, short pose blends and subtle breathing. The new audio is about 40 KB; FFprobe confirms source metadata was stripped (only the encoder tag remains). All three clips decode, and measured levels remain reduced. Sources and conversion details are documented in Audio and assets.

After aligning Expo ~58.1.0, expo-file-system ~58.0.15 and expo-sharing ~58.0.24 within SDK 58, a clean `npm ci`, formatting, TypeScript, all 113 unit tests, all 72 phone/tablet integration tests, Expo compatibility and Android Hermes export passed. Browser tests include real-call playback requests, replay/mute, hints, rewards, reduced-motion resting frames, pose changes, storage migration and invalid-backup handling. No progress schema change was needed.

Physical Samsung tablet checks remain: call clarity/comfortable volume, native touch behavior, no audio after background/exit, resting poses with reduced motion, and airplane-mode cold launch. These remain illustrated 2D animals. Verified fish/rabbit/zebra calls and isolated phoneme recordings are still missing; existing names and word-example/TTS behavior remain as documented. Android export is not a signed APK.
