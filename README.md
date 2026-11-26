# Kids ABC Learning 🌈

An English alphabet-learning app for children, built with React Native, TypeScript, and Expo SDK 58. Designed for Android phones and tablets, with a browser preview for development and automated tests.

## Activities

- **Paint Studio:** a blank canvas with brush, pencil, eraser, lines, rectangles, ovals, shape/page fill, ten colors, undo/redo, local autosave, and PNG/SVG export.

- **Animal memory pairs:** 32 online animal photos, themed groups, 2–4 pairs, previews, gentle retries, and saved matching rewards.
- **Surprise eggs:** three taps reveal each of eight animal letters with offline pronunciation and saved stars.
- **Coloring animals:** 24 outlines, five named colors, an eraser, three brushes, undo, and reversible clear; pictures stay during the activity session.

- **Animal sound match:** four short cat/dog listening questions, real offline recordings, two large animated choices, replay/mute, clues, and saved rewards.

- **Balloons and kites:** colorful floating letter balloons that pop on tap, flying kites with sparkles, bundled gentle effects, mute, and pause controls.

- **Alphabet A–Z:** spoken letters, example words, and animated scenes.
- **Find the letter:** animal questions, gentle hints, and automatic progression.
- **Match the animals:** drag-and-drop matching, with a tap alternative.
- **Trace letters A–Z and a–z:** uppercase and lowercase handwriting paths, moving guides, and saved tracing rewards.
- **Draw animals:** 24 animal outlines with saved tracing rewards.
- **Big & little letters:** uppercase-to-lowercase matching.
- **Advanced Letters:** 26 additional words with explanations and illustrated scenes.
- **Listen and explore:** bundled human letter/word recordings and real cat, dog, and bird sounds.
- **Letter sounds:** six continuous initial sounds in small groups, with animal-word examples.
- **Numbers and counting:** count animal pictures once each, then choose a total from 1–10.
- **Colors and shapes:** spoken matching with large tiles, symbols/names, dragging, and a tap alternative.
- **Progress backup:** adult-controlled local JSON export, validated preview, and confirmed restore.
- **My sticker book:** stars, animal stickers, and tracing progress saved on the device.

Balloon/kite play starts at a gentle speed, offers a playful pace and Start again, and follows the device’s reduce motion setting with still targets and motion-free celebrations. Counts and these controls apply to the current play session.

Every activity is available from the side menu. Parental controls are deferred.

## Run the app

Use Node.js 24 LTS and npm. The repository includes a dependency lockfile.

```sh
npm ci
npx expo start --clear
```

Open the QR code using **Expo Go for SDK 58**. If Expo Go reports another SDK version, use a compatible Expo Go version or upgrade Expo and its dependencies together with `npx expo install --fix`.

For a browser preview:

```sh
npm run web
```

Animal memory pairs downloads real photos from Wikimedia Commons and needs internet for those pictures. Other bundled activities and pictures remain usable offline. 82 bundled human recordings play offline. Unrecorded prompts/examples use the device's text-to-speech engine and need an installed offline English voice. See the audio guide for remaining recording gaps. Expo Go development still needs access to the computer running Expo.

## Check the code

```sh
npm run check
npx playwright install chromium
npm run test:integration
npm run build:android
```

`npm run check` runs formatting checks, TypeScript, and unit tests. Integration tests build the web app and exercise real screens at phone and tablet sizes. Android bundle checks do not replace testing an APK on a physical tablet.

## Documentation

- [Code guide](CODE_GUIDE.md): where features live and common changes.
- [Architecture](docs/ARCHITECTURE.md): reusable components, navigation, and saved data.
- [Testing](docs/TESTING.md): unit/integration suites, troubleshooting, and coverage limits.
- [Production guide](docs/PRODUCTION.md): APK/AAB builds, offline verification, releases, and recovery.

- [Audio, licenses, and animation scope](docs/AUDIO_AND_ASSETS.md)
- [Backup and restore](docs/BACKUP_AND_RESTORE.md)
- [Feature references and roadmap](docs/FEATURE_ROADMAP.md)

Alphabet animal scenes use larger detailed artwork for cat, dog, elephant, fish, lion, parrot, rabbit, and zebra, with species-specific pose timing and simple habitats. Animations respect reduced motion and stop in the background.

## Play, explore and learn how

Open **Play and learn** from the side menu to browse all activities by Learn, Play games, Create, or With a grown-up. Every activity has a short introduction, a replay button and a direct start button. “Pick a game for me” suggests a child-friendly bundled game and explains it first. Spoken introductions use the tablet’s English text-to-speech voice; they are not new recordings. The home screen focuses on the alphabet; all activities are available in the side menu.

**Animal picture puzzles** adds eight bundled animal illustrations in short three-picture lessons. Start with two pieces, then try four. Tap a piece and its space, or drag it; whole-picture hints and unlimited retries help. Each finished picture saves one star and the third completes a matching adventure. No new internet dependency or storage migration is introduced.
