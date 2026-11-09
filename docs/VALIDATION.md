# Validation record

The component refactor is validated locally using the commands below. The authoritative current result is the CI run for the exact commit being released.

```sh
npm ci
npm run check
npx expo install --check
npx playwright install chromium
npm run test:integration
npm run build:android
```

## Local results for this refactor

| Check                         | Result                                      |
| ----------------------------- | ------------------------------------------- |
| Clean `npm ci`                | Passed                                      |
| Formatting and TypeScript     | Passed                                      |
| Unit tests                    | 64 passed                                   |
| Chromium integration tests    | 12 passed across phone and tablet viewports |
| Expo dependency compatibility | Passed                                      |
| Android Hermes bundle export  | Passed                                      |

The unit suite covers the pure business rules and storage adapter. The integration suite renders the real web app in Chromium at 390 × 844 and 800 × 1100, including pointer gestures and persistence failures. See [Testing](TESTING.md) for the assertions and limits.

Physical Samsung tablet, native Android gesture/audio behavior, APK installation, and an airplane-mode cold launch still require device verification. No store publication or signed release build is implied by these automated checks.
