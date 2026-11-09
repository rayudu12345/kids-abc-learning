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

- All eight menu routes and current-activity markers.
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
