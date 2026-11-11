# Code guide

Start with `App.tsx`. It now only assembles the error boundary, progress provider, navigation, header, and side menu.

## Reusable pieces

| Location                                  | Responsibility                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `navigation/ActivityRouter.tsx`           | Chooses the activity component for a screen identifier.                |
| `components/ui/ActionButton.tsx`          | Shared accessible button with soft and primary variants.               |
| `components/ui/ActivityToolbar.tsx`       | Shared back and sound controls for activities.                         |
| `components/ui/AppHeader.tsx`             | Persistent menu button and activity title.                             |
| `components/ui/LetterChoice.tsx`          | Large uppercase/lowercase answer button.                               |
| `components/ui/StarProgress.tsx`          | Reusable earned-star display.                                          |
| `components/ui/FeedbackMessage.tsx`       | Screen-reader-friendly activity feedback.                              |
| `components/ui/SceneModal.tsx`            | Full-screen illustration wrapper used by basic and advanced letters.   |
| `components/home/`                        | Alphabet home, shortcuts, card grid, and selected-letter scene.        |
| `components/matching/DraggableAnimal.tsx` | Animal tile with its own responder and return animation.               |
| `components/tracing/TraceCanvas.tsx`      | Scaled tracing paths, starting point, moving guide, and touch surface. |
| `components/tracing/TracingPicker.tsx`    | Letter/animal selection cards and completed markers.                   |
| `components/ErrorBoundary.tsx`            | Recoverable fallback for rendering failures.                           |
| `hooks/useAlphabetPlayback.ts`            | Alphabet selection, speech, and entrance/bounce animation.             |
| `hooks/useAutoAdvance.ts`                 | Delayed progression with cancellation on exit.                         |

Activity screens remain at the repository root: `FindLetter.tsx`, `MatchAnimals.tsx`, `LetterPairs.tsx`, `TraceLetters.tsx`, `AdvancedLetters.tsx`, and `StickerBook.tsx`. They own their game state and compose the smaller pieces above.

## Content and business rules

| File                                        | Contents                                                      |
| ------------------------------------------- | ------------------------------------------------------------- |
| `LetterScene.tsx`                           | Basic A–Z words and animation scenes.                         |
| `AnimalArt.tsx`                             | Cropping and gentle movement of the bundled animal artwork.   |
| `quizLogic.ts`                              | Animal questions, shuffling, and lesson choices.              |
| `matchLogic.ts`                             | Window-coordinate drop-target detection.                      |
| `traceCatalog.ts`                           | A–Z and 24 animal outlines in a 300 × 300 coordinate system.  |
| `tracingLogic.ts`                           | In-order tracing recognition and touch tolerance.             |
| `advancedAlphabet.ts`                       | Advanced vocabulary and explanations.                         |
| `AdvancedScene.tsx` / `advancedGeometry.ts` | Illustrated advanced scenes and dodecahedron geometry.        |
| `progressLogic.ts`                          | Saved-data validation, migration, and reward calculations.    |
| `progressPersistence.ts`                    | Storage adapter and ordered writes.                           |
| `ProgressStore.tsx`                         | React context, hydration, retry controls, and reward actions. |

## Make changes

- **Add an activity:** add the screen entry to `SideMenu.tsx`, add its route to `ActivityRouter.tsx`, and optionally add a home shortcut.
- **Add an animal outline:** add a unique catalogue entry in `traceCatalog.ts`. Picker cards, saved-data validation, menu counts, and totals use that catalogue. Optional animal-sticker mappings are in `addTracingReward`.
- **Change advanced vocabulary:** update `advancedAlphabet.ts` and its illustration in `AdvancedScene.tsx`.
- **Change an activity's controls:** use the shared components instead of duplicating buttons or toolbar markup.
- **Change storage:** preserve the key and old fields, update validation/migration, and add round-trip and old-save tests.

Run `npm run format` after edits, then `npm run check`. Run `npm run test:integration` after navigation, interaction, shared-component, or persistence changes. See [Testing](docs/TESTING.md) for details.

## New learning features

- `audio/`: playback controller, speech fallback facade, and static recording map.
- `screens/AudioLibrary.tsx`, `Phonics.tsx`, `Counting.tsx`, `ColorsShapes.tsx`: the new activities.
- `screens/ProgressBackup.tsx`: adult export/import preview and confirmation.
- `backupLogic.ts`, `backupFiles.ts`, `backupFiles.web.ts`: validation and platform-specific file operations.
- `data/learningCatalog.ts`: phonics/counting/color/shape targets and validation.
- `data/animalMotion.ts`: four-frame pose row metadata.
- `assets/audio/attribution.json`: recording authors, sources, and licenses; preserve it in releases.

See [audio and assets](docs/AUDIO_AND_ASSETS.md) and [backup and restore](docs/BACKUP_AND_RESTORE.md) before changing these modules.
