"""Fetch explicitly licensed Commons audio, retain attribution, and create lightweight MP3s."""
import concurrent.futures, html, json, re, subprocess, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'assets/audio'; OUT.mkdir(parents=True,exist_ok=True); (ROOT/'audio').mkdir(exist_ok=True)
HEADERS={'User-Agent':'KidsABCLearning/1.0 (educational offline app; https://github.com/rayudu12345/kids-abc-learning)'}
def get(url):
 for attempt in range(4):
  try:
   with urllib.request.urlopen(urllib.request.Request(url,headers=HEADERS),timeout=30) as response:return response.read()
  except urllib.error.HTTPError as error:
   if error.code!=429 or attempt==3:raise
   delay=max(5,int(error.headers.get('Retry-After','5')))*(attempt+1)
   print('Rate limit: waiting',delay,'seconds',flush=True);time.sleep(delay)

def api(params):return json.loads(get('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({'format':'json',**params})))
words=['monkey','snake','newt','vulture','apple','ball','cat','dog','elephant','fish','grapes','hat','ice cream','jelly','kite','lion','mango','nest','orange','parrot','queen','rabbit','sun','train','umbrella','van','watch','x-ray','yo-yo','zebra','moon','one','two','three','four','five','six','seven','eight','nine','ten','red','blue','yellow','green','orange','purple','pink','circle','square','triangle','rectangle','star','oval','listen','find','match','trace','count','again']
requests={**{f'letter-{letter}':f'File:En-us-{letter.lower()}.ogg' for letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'},**{word.replace(' ','-'):f'File:En-us-{word}.ogg' for word in words}}
requests.update({'sound-cat':'File:Meow of a Siamese cat - freemaster2.wav','sound-dog':'File:Barking of a dog 2.ogg','sound-birds':'File:Birds chirping in a garden.ogg'})
metadata={}
for i in range(0,len(requests),40):
 titles=list(requests.values())[i:i+40]
 response=api({'action':'query','titles':'|'.join(titles),'prop':'imageinfo','iiprop':'url|extmetadata'})
 for page in response['query']['pages'].values():
  if 'imageinfo' in page:metadata[page['title'].lower().replace('_',' ')]=page['imageinfo'][0]
allowed={'CC0','Public domain','CC BY 4.0','CC BY 3.0','CC BY-SA 4.0','CC BY-SA 3.0','CC BY-SA 2.5','CC BY-SA 2.0','CC BY 2.0','CC BY 2.5'}
def clean(value):return html.unescape(re.sub('<[^>]+>','',str(value)))
def download(pair):
 key,title=pair; info=metadata.get(title.lower().replace('_',' '))
 if not info:return None
 meta=info.get('extmetadata',{}); license=clean(meta.get('LicenseShortName',{}).get('value',''))
 if license not in allowed:return None
 temp=OUT/(key+'.source.ogg'); target=OUT/(key+'.mp3')
 try:
  if not target.exists():
   time.sleep(1.5)
   temp.write_bytes(get(info['url'].split('?')[0]))
  if not target.exists():subprocess.run(['ffmpeg','-v','error','-y','-i',str(temp),'-ac','1','-ar','22050','-af','loudnorm=I=-20:TP=-2:LRA=7'+(',volume=0.5' if key.startswith('sound-') else ''),*(['-t','2.5'] if key.startswith('sound-') else []),'-b:a','48k',str(target)],check=True)
  return {'id':key,'file':target.name,'source':info['descriptionurl'],'url':info['url'].split('?')[0],'artist':clean(meta.get('Artist',{}).get('value','Unknown; see source page')),'license':license,'licenseUrl':meta.get('LicenseUrl',{}).get('value',''),'changes':('Converted to mono 22050 Hz MP3, normalized to -20 LUFS, excerpt limited to 2.5 seconds and reduced in volume.' if key.startswith('sound-') else 'Converted to mono 22050 Hz MP3, normalized to -20 LUFS. No change in speaking speed.')}
 except Exception as error:
  print('Unavailable',key,str(error));return None
 finally:temp.unlink(missing_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:results=[entry for entry in pool.map(download,requests.items()) if entry]
(OUT/'attribution.json').write_text(json.dumps(results,indent=2)+'\n')
missing=[key for key in requests if key not in {entry['id'] for entry in results}]
(ROOT/'audio/recordings.ts').write_text('// Bundled, licensed human recordings. See assets/audio/attribution.json.\nexport const recordings: Record<string, number> = {\n'+''.join(f'  "{entry["id"]}": require("../assets/audio/{entry["file"]}"),\n' for entry in results)+'};\n')
print(json.dumps({'recordings':len(results),'missing':missing}))
