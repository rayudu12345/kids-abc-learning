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

- Open all 22 menu destinations; close the menu using its close button, backdrop, and Android back.
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

85 voice and animal recordings are bundled. Longer prompts and unavailable examples use the device's English text-to-speech voice. See [Audio and assets](AUDIO_AND_ASSETS.md) for exact gaps. Download an offline English voice in Android's text-to-speech settings; exact menu names vary by Samsung/Android version. Test an installed APK by turning on airplane mode, closing it completely, and reopening it. Check pronunciation and activities. Expo Go's development connection is not the offline production experience.

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

- Play recorded letter/word clips, cat/dog/elephant/lion/parrot and garden-bird sounds, and fallback guidance with Wi-Fi disabled. Confirm readable Recording/Device voice labels and appropriate volume.
- Switch activities rapidly and background the app while audio plays. No old speech or clip should continue over the next activity.
- Practice the six initial sounds, keeping letter names separate. Have an early-literacy adult review pronunciation; isolated phoneme recordings are not bundled.
- Trace lowercase letters with ascenders/descenders and single-storey handwriting a/g. Confirm uppercase rewards remain unchanged.
- Count animals once each for several totals, including 10. Wrong choices must not deduct rewards or grant duplicate stars.
- Match colors and shapes by dragging and tapping; names/symbols must remain usable without relying on color alone.
- Export to Files, verify the file, preview/cancel a restore, and restore on another installed build. Reject invalid/oversized files. Test a write failure where practical.
- Check that four-pose animal motion pauses in the background and that the new PNG/MP3 assets are present in the installed APK.

## Current product limits

Parental controls remain deferred. Phonics currently uses full-word recordings to demonstrate initial sounds; dedicated isolated phoneme clips are not bundled. Some words and longer guidance still need an offline English device voice. See [audio scope and attribution](AUDIO_AND_ASSETS.md). Eight animals have realistic-style four-pose 2D animation, not live footage or full 3D simulation. Other illustrations use emojis or simplified shapes. The app remains portrait-oriented and English-only. Backup is a manual local-file operation, not automatic cloud synchronization.

## Balloon and kite release checks

The side menu includes Balloons and kites. Both original synthesized effects are bundled under `assets/effects`; no network or TTS is needed for this activity. Check pop/chime volume on the target tablet, moving target taps, pause/resume, rotation, rapid taps, app backgrounding and navigation. Session counters intentionally reset on exit and do not alter stars or backups. Rebuild the APK to include new bundled assets.

Sky play now defaults to gentle flight; Playful restores the original pace. Start again clears only balloon/kite session counts and pending effects, retaining current controls. Check Android accessibility Remove animations (wording varies) before launch and while playing: targets remain still and confetti does not move, while taps and sounds still work. Disable the setting to resume motion; explicit Pause remains respected.

Check all eight enlarged alphabet animal scenes in portrait, landscape, and full screen. Confirm paws/tails/trunks/wings/legs change naturally, fish bubbles and elephant droplets stay inside the scene, and animations stop on backgrounding. Test reduced motion and rapid letter changes. Assets reuse the existing bundled illustrated sprite atlas; no new remote images, videos, or downloads are required. These remain four-pose illustrations; assess frame transitions and tablet rendering quality before release.

## Animal sound match

Open Animal sound match from the side menu. Four questions are drawn without repeats from five licensed calls: cat, dog, elephant, lion and parrot. Each uses the human `listen` recording and two large animated choices. All question audio is recorded and offline; no TTS is required for the game. Replay does not overlap prior clips. Mute reveals named sound clues; retries have no penalties. Correct answers save one star and the corresponding animal sticker; completing four adds one matching adventure. Backgrounding stops audio and pauses pending advancement; leaving cancels the session timer. Verify comfortable volume, replay/mute, touch targets, airplane-mode startup and background/resume in an installed APK. More animals require correctly identified, licensed recordings before they can be added.

## Memory, surprise eggs, and coloring

Memory starts with two pairs and offers three/four-pair boards, previews, unlimited peeks, no penalties, and one saved star per pair. A completed board adds one matching adventure. Surprise eggs reveal eight animal letters after three taps each; all letter/name recordings are bundled, one star is saved per reveal, and the eighth adds a letter adventure. Next actions and taps lock immediately to avoid duplicate rewards or skipped eggs.

Coloring offers 24 existing outlines, five recorded color names, a white eraser, three brushes, undo and reversible clear. Paint is freehand and can extend outside the outline. Per-picture drafts remain only while the activity is mounted; leaving/relaunching discards them, and progress backups do not contain artwork. Use a tablet screenshot to keep a picture. The 1,000-dot page cap bounds native rendering work; Undo/Clear make more room. This creative activity awards no graded rewards. Test large-finger painting and scrolling on the physical tablet.

Surprise eggs and coloring remain offline; memory now downloads online photos. The activities respect shared audio cleanup, and add no accounts, advertisements, purchases, analytics or cloud storage. Parental controls remain deferred.

## Online memory photos

The user-authorized memory expansion contains 32 animals in All animals, Pets and farm, Wild animals, Water animals, and Birds groups. Boards stay at 2–4 pairs. Pictures require internet; other activities keep their existing bundled assets. Memory waits for photo readiness before starting its preview, shows a readable fallback and Retry photos on errors, and preserves matches/stars when retrying. Slow loads time out after ten seconds. Both cards use the same species identity and photo. Matched new species earn stars; the original eight-animal sticker collection remains unchanged.

Known animal names use bundled recordings; new names use the tablet's English TTS voice and respect mute. Test Wi-Fi/mobile data, slow connections, image failures, retry, group changes during loading, background/resume, photo readability, voice output, and saved rewards on the Samsung tablet. Remote photo availability and native network behavior need physical-device checks. Wikimedia receives normal image requests (including IP address and standard request headers); progress is not sent to it. There are no accounts, ads or added analytics.

Credits and source/license URLs are visible under Photo credits. The committed catalogue is the runtime source of truth. `python scripts/build-memory-catalog.py` resolves fixed reference topics for maintenance, respects API rate-limit waits, and retains prior catalogue output on an incomplete fetch. Its temporary metadata cache is `/tmp/kids-abc-memory-catalog.json`; review all new photos and credits before committing updates. Do not run metadata discovery inside the children's app.

## Paint Studio release checks

Open the new Paint Studio button in the activity menu or animal coloring. This is a standalone blank-canvas activity; animal coloring keeps its existing behavior. Tools include brush, pencil, eraser, line, rectangle, oval and fill, ten named colors, three brush sizes, filled/outlined shapes, page color, undo/redo and clear. The pencil is always fine. Fill applies to geometric shapes or the page; it is not pixel flood-fill for freehand regions. Drawings are bounded to 200 marks and 1,800 points; Undo/Clear makes room. Tapping creates dots or small shapes.

The latest picture autosaves locally after completed actions. Undo/redo covers the last 30 actions while the activity stays open. Read errors preserve the saved picture and offer Retry opening picture; save errors preserve the visible drawing and offer Retry saving picture. Paint data has its own key and is not part of the learning-progress JSON backup. Export PNG/SVG copies separately and save them outside the app to survive uninstalling or clearing app data. PNG is 1200 × 1200; SVG remains editable vector geometry. The app keeps one latest painting rather than an in-app picture gallery. Text, photo import/cropping and selection tools are outside this first paint release.

`react-native-svg` is aligned with Expo SDK 58. Rebuild the APK to include the dependency and updated Expo patch packages; keep Expo Go on SDK 58. Native PNG capture/sharing requires a physical-device check. Exports use the system share sheet and do not automatically publish artwork. File writes complete before sharing, including progress backup export. No accounts, ads, purchases, analytics or cloud artwork storage were added.

## Play discovery and animal puzzles

The menu now contains 22 destinations including Play and learn and Animal picture puzzles. Home shows the alphabet without activity shortcuts; use the side menu to open any activity. The guide introduces all 21 other options; With a grown-up labels backup tools but is not a parental gate. All introductions are available as text. Spoken introductions require an installed English TTS voice; download a voice before testing airplane mode. No new recordings are bundled.

Puzzle lessons contain three of eight bundled animal pictures, default two pieces and optional 4, 6, 9, 12, 16, 25 or 36. Larger levels use a paged tray of six pieces, labeled rows/columns, and a board that expands to keep touch targets usable on the supported phone/tablet layouts. Changing difficulty starts a fresh lesson without clearing earned rewards. Hints and retries have no penalty. Each picture earns one existing matching star; the third marks a completed matching adventure. Progress/backup format remains version 1. Puzzles and guide assets work offline; the existing online-photo memory game still requires internet.

Before APK release, rebuild the Android package and check actual tablet touch dragging, smaller-screen tap alternatives, native audio cancellation, voice installation, Android modal Back and landscape layout. Android JS/Hermes export is a bundling check, not a signed APK.

## Natural calls and smoother poses

Check the five real calls both after alphabet letter/word playback and with the separate Hear the animal control. Mute must disable call replay, rapid selections must cancel old clips, and leaving/backgrounding must stop audio. Sound matching keeps four questions with two large choices each, selected from five animals without target repetition. Confirm all five recordings in Listen and explore and review their credits. The new three clips add about 40 KB, not a runtime network dependency.

Verify blended pose transitions and subtle breathing at portrait/landscape sizes. Reduced motion should show the resting pose without blending or breathing. Test native app background/resume, gentle speaker volume and airplane-mode cold launch. Fish/rabbit/zebra call recordings remain unavailable; do not advertise all animals as having real calls.

The 27 November compatibility check aligns Expo to ~58.1.0, expo-file-system to ~58.0.15 and expo-sharing to ~58.0.24, retaining Expo SDK 58 and the current React Native version. Use the committed lockfile with `npm ci`, and rebuild the APK after updating.
