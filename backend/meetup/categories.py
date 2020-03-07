import json 
with open('meetup/categories.json') as json_file:
    data = json.loads(json_file.read())
with open('meetup/data.json') as f:
    obj = json.loads(f.read())
print(len(obj))
pk = 1
for entry in data:
  if not "food" in entry['parents'] and not "restaurants" in entry['parents']:
    continue
  pk += 1
  obj.append({"model": "meetup.category", "pk": pk, "fields": {"label": entry["title"], "api_label": entry["alias"]}})

with open('meetup/data.json', 'w', encoding='utf-8') as feed:
    json.dump(obj, feed, indent = 4, ensure_ascii = False)