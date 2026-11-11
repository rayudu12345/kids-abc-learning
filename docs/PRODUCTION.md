# Production and release guide

This document covers building and releasing the current Expo SDK 58 app. No APK/AAB is created or published merely by committing this repository.

## Supported setup

- Use Node.js 24 LTS (`.nvmrc`) and npm with the committed `package-lock.json`.
- The native app uses React Native 0.88.1 and React 19.3.0, aligned with Expo SDK 58.
- Expo Go must support SDK 58. Production users install the app itself and do not need Expo Go.
- Android application ID: `com.rayudu12345.kidsabclearning`.
- iOS bundle ID: `com.rayudu12345.kidsabclearning`. iOS signing/builds are not covered by the Android validation performed here.

## Prepare a release

```sh
git pull
npm ci
npm run check
npx expo install --check
npx playwright install chromium
npm run test:integration
npm run build:android
```

`build:android` exports an Android JavaScript/Hermes bundle to `build/android`; it is not an installable APK. Check the GitHub Actions result for the exact commit being released. Review the current artwork, vocabulary, and release changes before sending a build to children or publishing it.

Update the user-visible `expo.version` in `app.json` when making a new release. EAS production builds use remote Android build numbers and `autoIncrement` so each production AAB receives a new version code.

## Configure EAS once

Create or recover an Expo account and verify its email, then run:

```sh
npx eas-cli@latest login
npx eas-cli@latest init
```

Link or create the correct Expo project. EAS will add a real project ID to the app configuration. Commit that non-secret configuration change. Do not invent a project ID or copy one from another app.

If prompted for Android signing on the first build, let EAS create/manage the keystore or use the application's existing keystore. Subsequent updates must retain the same signing identity and application ID. Keep signing credentials out of Git; maintain access through the authorized Expo account.

## Build an installable APK

`eas.json` contains an internal `preview` profile:

```sh
npx eas-cli@latest build --platform android --profile preview
```

When EAS confirms success, download the APK from that build's URL. Install it on the Samsung tablet, allowing installation from the browser/file manager when Android asks. Test that exact APK, including an update over the previous signed version so saved progress is preserved.

## Build for Google Play

```sh
npx eas-cli@latest build --platform android --profile production
```

This produces an Android App Bundle (AAB) for store distribution, not a directly installable APK. Upload the artifact through the authorized Play Console account. Complete the store's required listing, audience, content-rating, privacy/data disclosures, and testing steps based on the actual released build. Submission and publication are separate actions and are not automated by this repository.

## Physical-device release checks

On the target Samsung tablet and an Android phone:

- Open all 14 menu destinations; close the menu using its close button, backdrop, and Android back.
- Use Android back from an activity to return to the alphabet screen.
- Complete a five-question letter adventure and try a wrong answer. Rewards must be granted once per correct response.
- Try both drag-and-drop and tap matching. Check targets after scrolling.
- Trace straight, curved, and multi-stroke letters; lift/resume; trace several animal outlines.
- Open the sticker book, close the app, and relaunch. Confirm stars and tracing completion remain.
- Background/resume the app and check that speech, touch controls, and navigation recover normally.
- Confirm large scenes and buttons are readable on the 10-inch tablet without clipped content.

Record the tested device model, Android version, app version, build identifier, and result alongside the release. Do not claim physical-device validation from browser or bundle checks alone.

## Offline operation

Pictures, outline coordinates, vocabulary, and game logic are bundled. Progress uses local device storage and does not require an account or network.

82 human recordings are bundled. Longer prompts and unavailable examples use the device's English text-to-speech voice. See [Audio and assets](AUDIO_AND_ASSETS.md) for exact gaps. Download an offline English voice in Android's text-to-speech settings; exact menu names vary by Samsung/Android version. Test an installed APK by turning on airplane mode, closing it completely, and reopening it. Check pronunciation and activities. Expo Go's development connection is not the offline production experience.

## Data protection and recovery

Storage key: `@kids-abc/progress/v1`. The app keeps stars, unique animal stickers, completed-adventure counts, and unique tracing IDs. Existing older saves receive missing fields through validation/migration.

A read failure blocks gameplay writes and offers a retry, preventing unread old rewards from being replaced. If opening keeps failing, preserve/export device data through an authorized diagnostic process before clearing anything. A newer unsupported format or corrupt data requires investigation; the app does not silently reset it.

A write failure keeps the latest rewards in memory and offers **Try saving again** in the sticker book. Retry before force-closing if possible. Local JSON backup/restore is available through **Progress backup**; see [Backup and restore](BACKUP_AND_RESTORE.md). There is no automatic cloud backup or synchronization. Uninstalling or clearing app data removes progress; do not recommend either as a routine update step.

## Troubleshooting

| Symptom                              | Action                                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Expo Go reports SDK mismatch         | Use SDK 58-compatible Expo Go, or upgrade Expo and all required packages together; then restart with `npx expo start --clear`.                                      |
| Old screens appear after updating    | Pull the intended commit, run `npm ci`, stop old Metro servers, and restart with `npx expo start --clear`. For installed apps, build/install a new APK.             |
| Speech is silent offline             | Verify media volume, sound toggle, and a downloaded English TTS voice. Test the installed build.                                                                    |
| Save warning appears                 | Open the sticker book and retry saving; investigate device storage availability.                                                                                    |
| Build fails after dependency changes | Run `npx expo install --check` and resolve compatibility. Commit the updated lockfile with intentional dependency changes.                                          |
| Regression in a release              | Revert the faulty code, build a new signed artifact with a higher version code, and test the update path. Avoid downgrading in a way that loses current local data. |

## New-feature release checks

- Play recorded letter/word clips, cat/dog/bird sounds, and fallback guidance with Wi-Fi disabled. Confirm readable Recording/Device voice labels and appropriate volume.
- Switch activities rapidly and background the app while audio plays. No old speech or clip should continue over the next activity.
- Practice the six initial sounds, keeping letter names separate. Have an early-literacy adult review pronunciation; isolated phoneme recordings are not bundled.
- Trace lowercase letters with ascenders/descenders and single-storey handwriting a/g. Confirm uppercase rewards remain unchanged.
- Count animals once each for several totals, including 10. Wrong choices must not deduct rewards or grant duplicate stars.
- Match colors and shapes by dragging and tapping; names/symbols must remain usable without relying on color alone.
- Export to Files, verify the file, preview/cancel a restore, and restore on another installed build. Reject invalid/oversized files. Test a write failure where practical.
- Check that four-pose animal motion pauses in the background and that the new PNG/MP3 assets are present in the installed APK.

## Current product limits

Parental controls remain deferred. Phonics currently uses full-word recordings to demonstrate initial sounds; dedicated isolated phoneme clips are not bundled. Some words and longer guidance still need an offline English device voice. See [audio scope and attribution](AUDIO_AND_ASSETS.md). Eight animals have realistic-style four-pose 2D animation, not live footage or full 3D simulation. Other illustrations use emojis or simplified shapes. The app remains portrait-oriented and English-only. Backup is a manual local-file operation, not automatic cloud synchronization.
