import json

with open('frontend/public/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

tracks = []
for t in data['tracks']:
    track_obj = {
        'id': t['id'],
        'label': t['label'],
        'icon': t['icon'],
        'tagline': t.get('tagline', ''),
        'programs': []
    }
    for p in t['programs']:
        prog_obj = {
            'id': p['id'],
            'label': p['label'],
            'description': p['description'],
            'levels': []
        }
        for l in p.get('levels', []):
            prog_obj['levels'].append({
                'id': l['id'],
                'name': l['name'],
                'desc': l.get('desc', ''),
                'weeks': l.get('weeks', 0),
                'lessons': l.get('lessons', 0)
            })
        track_obj['programs'].append(prog_obj)
    tracks.append(track_obj)

js_content = "export const UNIFIED_CURRICULUM = " + json.dumps(tracks, indent=2, ensure_ascii=False) + ";"
with open('frontend/src/pages/curriculumData.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
print("done")
