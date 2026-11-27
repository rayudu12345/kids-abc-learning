# Testing

## Install and run

Use Node.js 24 LTS, then:

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:integration
npm run build:android
```

On Linux CI machines, install browser system dependencies with `npx playwright install --with-deps chromium`.

The integration command builds the web app into `dist/`, starts the local-only server at `127.0.0.1:4173`, and runs Chromium at phone and tablet viewport sizes. Stop another process using that port before testing. Locally, Playwright can reuse a running preview on that port; restart it if it serves an old export.

For a system Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path. For normal development, use the browser installed by Playwright. Use `npm run test:integration:ui` to inspect tests interactively.

## Unit suite

`npm run test:unit` uses Node's test runner with `tsx`; tests are in `tests/unit/`.

- Quiz permutations, lesson uniqueness, and exactly one correct answer.
- All 26 letter and 24 animal tracing paths: bounds, reachability, order, off-path rejection, and lift/resume behavior.
- Drop targets, gaps, and empty layouts.
- Advanced A–Z completeness and dodecahedron geometry.
- Saved-data validation, old-save compatibility, sticker deduplication, and tracing rewards.
- Ordered storage writes, failed-read handling, and retry after a failed write.

Randomized content is tested by its invariants, not by expecting a particular random order.

## Integration suite

`tests/integration/` interacts with the real rendered application. Browser tests verify:

- Core menu routes and current-activity markers, with expansion activities covered by dedicated suites.
- Sound toggles and full-screen basic/advanced scenes.
- Wrong/correct letter answers, answer locking, five-question completion, and automatic advancement.
- Uppercase/lowercase matching.
- Tap matching and an actual pointer drag into a matching target.
- Multi-stroke letter tracing, animal tracing, automatic advancement, and saved rewards after reload.
- Failed initial reads, preservation of old rewards, failed writes, and manual save retry.
- Absence of unhandled browser runtime errors.

The integration tests use isolated browser contexts and derive answers from visible prompts; they do not depend on a fixed random seed. Failed runs produce screenshots, traces, and an HTML report in `test-results/` and `playwright-report/`.

## What automation does not establish

Browser tests do not verify Android's native gesture implementation, hardware-back button, actual text-to-speech sound, Expo Go compatibility, battery usage, or installed-APK offline behavior. Android bundling verifies asset inclusion and Hermes compilation, not installation or device playback. The error boundary catches rendering errors, not arbitrary asynchronous errors.

Before release, use a physical Android phone and the target Samsung tablet. Test dragging and tracing with fingers, speech with the downloaded English voice, rotation/portrait layout, background/resume, Android back, and an airplane-mode cold launch of the installed APK. See the [production guide](PRODUCTION.md).

## CI

`.github/workflows/ci.yml` runs install-from-lockfile, formatting, TypeScript, unit tests, Expo dependency compatibility, browser integration tests, and Android bundling. Browser artifacts are uploaded when the job fails. Passing locally does not imply the remote workflow has completed; inspect the Actions run for the release commit.

## Six-feature expansion

Additional unit suites cover audio cancellation/races, asset licenses, lowercase geometry/rewards, counting deduplication/choices, color/shape matching, and strict backup validation/migration. Additional browser tests cover actual recording play requests, changing sprite frames, phonics progression, lowercase persistence, counting gates, drag/tap color and shape matching, backup downloads, invalid files, preview/cancel, failed restore, and successful reload after restoration.

Physical-device tests remain necessary for sound quality, offline TTS voices, native file picker/share destinations, installed-APK cold launches, and native gesture behavior. An exported backup is durable only after the user saves it outside the app.

## Balloon and kite checks

Unit tests cover responsive target lanes, alphabet cycling, and bundled effect presence. Browser integration covers popping, kite taps, effect playback, mute, pause/resume, navigation, and session reset on phone/tablet layouts. On a physical Samsung tablet, verify comfortable pop/chime volume, finger targets while moving/paused, background cleanup, and airplane-mode playback in the installed APK.

Sky-play coverage also verifies speed controls, resetting both counters while retaining play settings, and initial/live device reduced-motion changes. Unit tests check gentle/playful timing. Test Android’s Remove animations setting on the physical tablet; confirm still targets, static celebrations, and resumed flight when disabled.

Alphabet animal tests cover all eight large scenes, changing poses, proportional sizing, full-screen display, switching back to Apple, and static/restored motion under device preference changes. Unit tests validate every pose index, loop boundary, movement bound, and species timing. Physical-device checks remain necessary for atlas frame clarity and performance on the Samsung tablet.

## CI dependency and runner maintenance

CI uses Ubuntu 24.04 and Node 24 (from `.nvmrc`), with Node 24-based v6 checkout/setup/upload actions. Named steps identify the failing check. Browser failure reports upload only when report files exist; an earlier dependency failure will not produce a misleading missing-artifact warning.

If `npx expo install --check` fails, read the expected package versions, run `npx expo install --fix`, and commit **both** `package.json` and `package-lock.json`. Reinstall using `npm ci`, then run the compatibility check, app checks, browser suite, and Android export before committing. Do not disable the compatibility check to get a green workflow. SDK 58 patch updates do not change the project's SDK major version.

Animal-sound tests verify four unique questions, valid bundled clips, answer locks/retries, and compatible rewards. Browser coverage includes actual species-matched play requests, replay, muted text clues, wrong answers, double taps, automatic advancement, completion, restart, navigation cleanup and persisted stars/stickers. Check real sound volume and app background/resume on the Samsung tablet.

The three reference-inspired activities add deck invariants/guarded flips, bounded egg reveals with bundled audio, and paint-coordinate/interpolation limits to the unit suite. Browser tests cover memory mismatch/recovery, levels, preview resets, saved rewards, automatic egg progression, all-eight completion with rapid next presses, painting/eraser, brush controls, reversible clear, undo and switching animal drafts. Test finger painting, erasing, scrolling, performance, background/resume, and comfortable audio on the Samsung tablet.

Online-memory unit coverage checks 32 species, group sizes, fixed HTTPS photo sources, credit/license metadata, same-initial species separation, and new-species rewards without changing backup format. Browser tests mock only Wikimedia image responses, so CI does not depend on an external CDN. They cover successful photos, group filters, credits, failed images, retry and preserved matching progress. Actual photo URLs were loaded and visually reviewed separately; this does not replace native Samsung tablet network tests.

## Paint Studio validation

Unit coverage includes input/version/coordinate validation, mark and point limits, shape geometry and tap alternatives, fill behavior, undo/redo branches and bounds, SVG export, eraser/page-color consistency, serialized writes, failed reads, failed saves and reopening during an in-flight save. Browser tests cover shapes/fill, erasing, undo/redo/clear, navigation and reload autosave, the coloring-to-studio link, learning-progress preservation, read/write retries, PNG signatures, SVG downloads and export failures. A real 1200 × 1200 PNG is produced by the web test.

Physical Samsung tablet checks remain necessary: finger drawing, fine pencil, shape taps/drags, fill selection, scrolling, rapid navigation during saving, background/resume, native PNG capture and sharing to Files/Photos, and reopening the saved image. Verify PNG and SVG match the visible drawing, including erased areas and page colors. Browser downloads do not establish native share-target behavior.

## Discovery and picture puzzles

`activity-guide.test.ts` verifies exhaustive introduction coverage and safe nonrepeating suggestions. `puzzle.test.ts` checks unique pieces, exact image coverage, forgiving retries, invalid input and duplicate-placement rejection. Browser suites `activity-guide.spec.ts` and `puzzles.spec.ts` cover every introduction, replay/mute, launching, alphabet-only home and complete side-menu access, 2–36 pieces and tray pagination, hints, actual pointer dragging, saved rewards, automatic progression, reload persistence and leaving during celebrations. They run at phone and tablet sizes.

On the Samsung tablet, check finger dragging and tap placement in both orientations, TalkBack labels, Android Back from introductions, offline English voice availability and audio stopping when backgrounding/leaving. Browser speech is stubbed to verify complete narration requests; it cannot verify native voice quality.

Animal-call expansion tests verify all five sound assets have permitted attribution, alphabet clip selection never substitutes garden birds, four-question lessons have unique targets and two choices, and rewards retain backup compatibility. Browser tests cover new elephant/lion/parrot calls, explicit replay, mute, matching hints and pose changes/rest under reduced motion. Audible quality and native-device audio/animation cleanup still require tablet checks.
