# Recorded audio credits and licenses

The MP3 files in this directory are **human recordings**, obtained from Wikimedia Commons. Each file's author, source page, original URL, license, and transformation are listed in `attribution.json`. The source page is the authoritative record. Preserve this file and the attribution manifest when distributing the recordings.

CC BY-SA recordings and their converted versions remain available under the exact Creative Commons Attribution-ShareAlike license identified for that file. Other recordings are CC BY or public domain/CC0 as individually identified. These licenses apply to the audio assets, not automatically to unrelated application code.

Changes: pronunciation clips were converted to mono 22,050 Hz MP3 at 48 kbps and normalized to -20 LUFS. Animal-sound excerpts are limited to 2.5 seconds and reduced in volume. No speaking-speed changes were made. The garden-bird recording is a mixed natural bird recording, not a parrot recording.

Letter-name clips are the `En-us-a.ogg` through `En-us-z.ogg` series referenced by English letter entries on Wiktionary (for example, <https://en.wiktionary.org/wiki/A#English>). They are letter names, not phonemes. Phonics activities label full-word recordings as examples of initial sounds; they do not mislabel letter-name clips as consonant sounds.

Use `python scripts/fetch-audio.py` with Python 3 and FFmpeg to regenerate assets. The script accepts only explicitly supported licenses, preserves attribution, caches downloaded clips, and honors HTTP 429 retry delays. Unavailable clips use visibly identified device speech rather than unlicensed replacement audio.
