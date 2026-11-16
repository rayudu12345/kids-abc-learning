"""Resolve curated Wikipedia lead photos and Commons credits. Review before committing."""
import time
import urllib.error
import html
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

# Fixed topics only; the children's app does not perform web searches.
ANIMALS = [
 ('cat','Cat','🐱','farm','Cat','C'),('dog','Dog','🐶','farm','Golden retriever','D'),
 ('rabbit','Rabbit','🐇','farm','Domestic rabbit','R'),('horse','Horse','🐴','farm','Arabian horse',None),
 ('cow','Cow','🐄','farm','Cattle',None),('sheep','Sheep','🐑','farm','Sheep',None),
 ('goat','Goat','🐐','farm','Goat',None),('pig','Pig','🐷','farm','Domestic pig',None),
 ('donkey','Donkey','🫏','farm','Donkey',None),('duck','Duck','🦆','farm','Mallard',None),
 ('chicken','Chicken','🐔','farm','Chicken',None),
 ('elephant','Elephant','🐘','wild','African bush elephant','E'),('lion','Lion','🦁','wild','Lion','L'),
 ('tiger','Tiger','🐯','wild','Tiger',None),('zebra','Zebra','🦓','wild','Plains zebra','Z'),
 ('giraffe','Giraffe','🦒','wild','Reticulated giraffe',None),('panda','Panda','🐼','wild','Giant panda',None),
 ('koala','Koala','🐨','wild','Koala',None),('kangaroo','Kangaroo','🦘','wild','Eastern grey kangaroo',None),
 ('fox','Fox','🦊','wild','Red fox',None),('bear','Bear','🐻','wild','Brown bear',None),
 ('dolphin','Dolphin','🐬','water','Common bottlenose dolphin',None),('whale','Whale','🐋','water','Blue whale',None),
 ('turtle','Turtle','🐢','water','Green sea turtle',None),('octopus','Octopus','🐙','water','Common octopus',None),
 ('fish','Fish','🐠','water','Ocellaris clownfish','F'),('penguin','Penguin','🐧','water','Emperor penguin',None),
 ('otter','Otter','🦦','water','Sea otter',None),
 ('parrot','Parrot','🦜','birds','Scarlet macaw','P'),('owl','Owl','🦉','birds','Barn owl',None),
 ('eagle','Eagle','🦅','birds','Bald eagle',None),('flamingo','Flamingo','🦩','birds','Greater flamingo',None),
]
def fetch(url):
    for attempt in range(4):
        time.sleep(.6)
        req=urllib.request.Request(url,headers={'User-Agent':'KidsABCLearning/1.0 educational photo catalogue (Commons attribution)'})
        try:
            return json.load(urllib.request.urlopen(req,timeout=25))
        except urllib.error.HTTPError as error:
            if error.code != 429: raise
            delay=float(error.headers.get('Retry-After','10'))
            print('Rate limited; waiting',delay,'seconds',flush=True)
            time.sleep(max(delay,1))
    raise RuntimeError('Rate limit persisted; try the catalogue build later')
def plain(value):
    return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',value))).strip()
def clean(url):
    return url.split('?')[0].replace('http://','https://',1)
def resolve(entry):
    ident,word,emoji,group,topic,sticker=entry
    summary=fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+urllib.parse.quote(topic.replace(' ','_')))
    original=clean(summary['originalimage']['source'])
    if '/wikipedia/commons/' not in original: raise ValueError('Not a Commons photo: '+word)
    filename=urllib.parse.unquote(original.rsplit('/',2)[-2] if '/thumb/' in original else original.rsplit('/',1)[-1])
    query=urllib.parse.urlencode({'action':'query','format':'json','titles':'File:'+filename,'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':400,'redirects':1})
    pages=fetch('https://commons.wikimedia.org/w/api.php?'+query)['query']['pages']
    page=next(iter(pages.values()))
    if 'imageinfo' not in page: raise ValueError(word+' missing Commons file '+filename)
    info=page['imageinfo'][0]; meta=info['extmetadata']
    license=plain(meta.get('LicenseShortName',{}).get('value',''))
    if not (license.startswith('CC BY') or license in ['Public domain','CC0']): raise ValueError(word+' license '+license)
    creator=plain(meta.get('Artist',{}).get('value',''))
    if not creator: raise ValueError('Missing creator: '+word)
    photo={'uri':clean(info['thumburl']),'creator':creator,'license':license,'licenseUrl':clean(meta.get('LicenseUrl',{}).get('value','https://commons.wikimedia.org/wiki/Commons:Copyright_tags#Public_domain')),'sourceUrl':clean(info['descriptionurl'])}
    result={'id':ident,'word':word,'emoji':emoji,'group':group,'photo':photo}
    if sticker: result['stickerLetter']=sticker
    return result
if __name__=='__main__':
    destination=Path('data/memoryPhotos.json')
    # Cached reviewed entries make interrupted metadata fetches inexpensive to resume.
    cached={item['id']:item for item in json.loads(destination.read_text())} if destination.exists() else {}
    cache_path=Path('/tmp/kids-abc-memory-catalog.json')
    if cache_path.exists(): cached.update({item['id']:item for item in json.loads(cache_path.read_text())})
    result=[]; errors=[]
    for entry in ANIMALS:
        try:
            item=cached.get(entry[0]) or resolve(entry)
            for key in ['uri','sourceUrl','licenseUrl']: item['photo'][key]=clean(item['photo'][key])
            result.append(item)
            cached[item['id']]=item
            cache_path.write_text(json.dumps(list(cached.values()),ensure_ascii=False))
            print(item['id'],item['photo']['license'],flush=True)
        except Exception as error:
            errors.append(str(error)); print('ERROR',str(error),flush=True)
    if errors: raise RuntimeError('Catalogue incomplete; prior file unchanged: '+'; '.join(errors))
    destination.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
