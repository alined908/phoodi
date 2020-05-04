import json

with open("meetup/yelp/categories.json") as json_file:
    data = json.loads(json_file.read())
new_categories = []
pk = 1
for entry in data:
    if not "food" in entry["parents"] and not "restaurants" in entry["parents"]:
        continue
    new_categories.append(
        {
            "model": "meetup.category",
            "pk": pk,
            "fields": {"label": entry["title"], "api_label": entry["alias"]},
        }
    )
    pk += 1

with open("meetup/fixtures/categories.json", "w", encoding="utf-8") as feed:
    json.dump(new_categories, feed, indent=4, ensure_ascii=False)
