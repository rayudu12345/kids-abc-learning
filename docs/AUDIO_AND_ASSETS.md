# Offline audio and animal motion

## Recorded audio

The app bundles 82 human recordings in `assets/audio/` (about 0.75 MB total): all 26 US English letter names, many basic words, numbers 1–10, short instruction words, colors/shapes where available, and three real animal/nature sounds. These are downloaded and converted assets, not device-generated speech saved as recordings.

Every recording has its author, original source URL, license, and conversion notes in `assets/audio/attribution.json`. `assets/audio/LICENSE.md` explains the applicable attribution/share-alike terms. Audio files retain their individual licenses. The cat, dog, and garden-bird sounds are short, quieter excerpts. Garden birds are not labeled as parrots.

The audio library shows **Recording** or **Device voice** for each basic word/name and offers visible credits. Additional guidance and unavailable clips still use device speech. Download an offline English voice for complete spoken guidance without connectivity.

Current unavailable examples: **grapes, orange, X-ray, newt, pink, oval**. Not every item is currently used in a lesson (pink is not a target in the six-color game). These use device speech when requested. Longer instruction sentences also use device speech; short instruction words such as listen, count, match, find, and trace have recordings.

## Phonics scope

The starter activity introduces six common **continuous initial sounds** (M, S, F, N, L, V) in pairs. It displays mouth-position guidance and plays a familiar animal word so the child can listen for its initial sound. Letter-name replay is a separate control. The app does not add an artificial “uh” to consonants or present a letter-name recording as a phoneme.

Dedicated recordings of isolated phonemes are **not bundled**. Word examples are clearly labeled as examples; newt currently uses device voice. Before expanding to stop consonants or vowel variations, obtain and review appropriate isolated-sound recordings with an early-literacy educator. English letters can have multiple sounds; the screen states that these are starter examples.

## Playback lifecycle

`audio/AudioController.ts` owns one active recording sequence. New requests stop the old clip and device speech, invalidate stale asynchronous requests, and release listeners/player resources. Navigation, mute, screen cleanup, and backgrounding stop playback. Clips have a timeout and a safe device-speech fallback. The audio plugin is configured for playback only, without microphone recording permission.

Automated tests check cancellation, stale request races, fallback handling, asset/license manifests, browser playback requests, and cleanup during navigation. They cannot establish the audible quality, volume, voice availability, or pronunciation on a physical Samsung tablet.

## Animal animations

`assets/animal-motion.png` is a project-generated sprite sheet with four poses for each of eight illustrated animals: cat, dog, elephant, fish, lion, parrot, rabbit, and zebra. `data/animalMotion.ts` defines row indices and frame looping. `AnimatedAnimal` changes poses and applies gentle motion; intervals and animation loops stop on unmount/background.

These are realistic-style illustrated characters animated in 2D, not live animal footage, skeletal 3D models, or physically simulated motion. The 24 animal drawing outlines remain simplified tracing artwork. Not all 24 outlines have realistic motion sprites.

## Regenerating audio

Run `python scripts/fetch-audio.py` with FFmpeg available. The script preserves cached clips, accepts explicit licenses, retains attribution, and backs off on HTTP 429 responses. Review every new source and recording, update missing-asset notes, format `audio/recordings.ts`, and run the asset tests. The app never fetches these URLs at runtime.
