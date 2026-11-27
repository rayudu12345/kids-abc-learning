"""Add reviewed Commons animal calls without replacing existing audio assets/credits.
Requires Python 3 and ffmpeg. These fixed sources are never requested by the app.
"""
import html
import json
import re
import subprocess
import urllib.parse
import urllib.request
import urllib.error
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = {
    'sound-elephant': 'File:Elephant voice - trumpeting.ogg',
    'sound-lion': 'File:Lion raring-sound1TamilNadu178.ogg',
    'sound-parrot': 'File:Vernal hanging parrot flight call recorded in February 2010 at Kulgi, Karnataka.wav',
}
HEADERS = {'User-Agent': 'KidsABCLearning/1.0 (https://github.com/rayudu12345/kids-abc-learning)'}
def fetch(url):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == 3:
                raise
            time.sleep(min(30, max(5, int(error.headers.get('Retry-After', '5')))))
def clean(value):
    return html.unescape(re.sub('<[^>]+>', '', value))

def main():
    params = {'action': 'query', 'format': 'json', 'titles': '|'.join(SOURCES.values()), 'prop': 'imageinfo', 'iiprop': 'url|extmetadata'}
    data = json.loads(fetch('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)))
    pages = {page['title']: page['imageinfo'][0] for page in data['query']['pages'].values()}
    attribution_path = ROOT / 'assets/audio/attribution.json'
    entries = json.loads(attribution_path.read_text())
    for key, title in SOURCES.items():
        info = pages[title]
        meta = info['extmetadata']
        license_name = clean(meta['LicenseShortName']['value'])
        if license_name not in {'CC0', 'Public domain', 'CC BY-SA 4.0'}:
            raise ValueError('Unexpected source license: ' + license_name)
        url = info['url'].split('?')[0]
        source = ROOT / 'assets/audio' / (key + '.source')
        target = source.with_name(key + '.mp3')
        try:
            source.write_bytes(fetch(url))
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(source), '-map_metadata', '-1', '-ac', '1', '-ar', '22050', '-af', 'silenceremove=start_periods=1:start_duration=0.02:start_threshold=-45dB,atrim=duration=2.5,loudnorm=I=-23:TP=-6:LRA=7,afade=t=in:d=0.08,areverse,afade=t=in:d=0.15,areverse', '-t', '2.5', '-b:a', '48k', str(target)], check=True)
        finally:
            source.unlink(missing_ok=True)
        entries = [entry for entry in entries if entry['id'] != key]
        entries.append({'id': key, 'file': target.name, 'source': info['descriptionurl'], 'url': url, 'artist': clean(meta['Artist']['value']), 'license': license_name, 'licenseUrl': meta.get('LicenseUrl', {}).get('value', ''), 'changes': 'Leading silence removed; excerpt up to 2.5 seconds, mono 22050 Hz MP3 at 48 kbps, normalized to -23 LUFS/-6 dBTP, with short fade-in/out. Embedded source metadata stripped; attribution retained separately. Playback uses reduced animal-sound volume.'})
    attribution_path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n')
    registry = '// Bundled, licensed recordings. See assets/audio/attribution.json.\nexport const recordings: Record<string, number> = {\n'
    registry += ''.join(f'  "{entry["id"]}": require("../assets/audio/{entry["file"]}"),\n' for entry in entries)
    (ROOT / 'audio/recordings.ts').write_text(registry + '};\n')
    print('Updated', len(entries), 'licensed recordings')
if __name__ == '__main__':
    main()
