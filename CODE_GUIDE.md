# Code guide

This is a React Native app built with Expo and TypeScript. Start with `App.tsx` to see how the screens fit together.

## Where to find each feature

| File                  | Responsibility                                                  |
| --------------------- | --------------------------------------------------------------- |
| `App.tsx`             | App entry point, alphabet home screen, and activity navigation. |
| `SideMenu.tsx`        | List of activities and the side menu.                           |
| `LetterScene.tsx`     | Basic A–Z words and their animated learning scenes.             |
| `AnimalArt.tsx`       | Displays animals from the bundled artwork atlas.                |
| `FindLetter.tsx`      | Spoken animal-letter questions and rewards.                     |
| `MatchAnimals.tsx`    | Drag-and-drop animal matching and the tap alternative.          |
| `matchLogic.ts`       | Finds which target is under the child's finger.                 |
| `LetterPairs.tsx`     | Uppercase-to-lowercase letter matching.                         |
| `quizLogic.ts`        | Animal choices, shuffling, and five-question lessons.           |
| `TraceLetters.tsx`    | Finger tracing, stroke guidance, and tracing selection.         |
| `traceCatalog.ts`     | Outline coordinates for A–Z and 24 animals.                     |
| `tracingLogic.ts`     | Checks that tracing follows points in order.                    |
| `AdvancedLetters.tsx` | Advanced vocabulary activity screen.                            |
| `advancedAlphabet.ts` | The advanced A–Z words, definitions, and motion choices.        |
| `AdvancedScene.tsx`   | Animated diagrams for the advanced vocabulary.                  |
| `advancedGeometry.ts` | Dodecahedron wireframe calculations.                            |
| `ProgressStore.tsx`   | Loads and saves local progress and shares it across screens.    |
| `progressLogic.ts`    | Validates saved data and calculates rewards.                    |
| `StickerBook.tsx`     | Shows saved stars, animal stickers, and tracing progress.       |

## How the app works

1. `App` wraps the app in `ProgressProvider`, which loads saved rewards before activities appear.
2. The home screen and side menu select a screen using one `Screen` identifier.
3. Activities handle their own interaction and stop speech or pending timers when they close.
4. Successful answers and tracings call the progress store. Writes run in order so older rewards cannot overwrite newer ones.

Tracing paths use a **300 × 300 coordinate system**. The screen scales the paths and finger positions together. Each path is one stroke; the child lifts their finger before starting the next one. `sampledStrokes` fills in points between the outline coordinates, and `advanceTrace` accepts nearby points in order.

Animal artwork is bundled in `assets/animal-atlas.png`. Its cell order and dimensions are described by `AnimalArt.tsx`. Keep those values in sync if replacing the image.

## Make common changes

- **Change an advanced word:** edit its entry in `advancedAlphabet.ts`. Update its illustration in `AdvancedScene.tsx` if needed.
- **Add an animal outline:** add a unique entry to `animalTraces` in `traceCatalog.ts`. Tracing selection, saved animal validation, progress totals, and the menu count use that catalogue automatically. Optional animal-sticker mappings are in `addTracingReward`.
- **Add an activity:** add its menu entry and screen identifier in `SideMenu.tsx`, then add its component to the navigation switch in `App.tsx`.
- **Change colors or spacing:** edit the `styles` object near the end of each screen. Advanced Letters also has a theme palette near the top of its screen file.

## Formatting and checking

```sh
npm install
npm run format
npm run format:check
npm run typecheck
npx expo start --clear
```

Prettier provides consistent indentation, quotes, line breaks, and JSX layout. Generated files and artwork are excluded from formatting. Before releasing an APK, also check the activities on the target tablet, including touch gestures and offline speech.
