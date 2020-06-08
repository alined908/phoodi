from dotenv import load_dotenv
load_dotenv()
import os, django
django.setup()
from django.utils.dateformat import format
from django.conf import settings
from meetup.models import Restaurant, RestaurantCategory, Category
import json, requests
from django.utils.timezone import now
from django.core import serializers

headers = {"Authorization": "Bearer " + settings.YELP_API_KEY}
url = "https://api.yelp.com/v3/businesses/search"

def create_restaurant(option, latitude, longitude):
        identifier = option["id"]
        try:
            restaurant = Restaurant.objects.get(identifier=identifier)
        except Restaurant.DoesNotExist:
            if not option['coordinates'].get('latitude') or not option.get('image_url') or not option.get('display_phone'):
                return

            info = {
                "identifier": identifier,
                "name": option["name"],
                "yelp_image": option["image_url"],
                "yelp_url": option["url"],
                "rating": (option["rating"] * 2) - 1,
                "latitude": option["coordinates"]['latitude'],
                "longitude": option["coordinates"]['longitude'],
                "price": Restaurant.SERIALIZED_PRICE_CHOICES[option.get("price", "$$")],
                "phone": option.get('display_phone'),
                "location": " ".join(option["location"]["display_address"]),
                "categories": json.dumps(option["categories"]),
                "city": option["location"]["city"],
                "country": option["location"]["country"],
                "state": option["location"]["state"],
                "zipcode": option["location"]["zip_code"],
                "address1": option["location"]["address1"],
            }

            restaurant = Restaurant.objects.create(**info)
            print(option)
            for category in option["categories"]:
                try:
                    category = Category.objects.get(api_label=category["alias"])
                    RestaurantCategory.objects.create(
                        category=category, restaurant=restaurant
                    )
                except Category.DoesNotExist:
                    pass
            
def run(command):

    if command == 'obtain':
        with open("meetup/yelp/cities.json") as json_file:
            data = json.loads(json_file.read())
            locations = []

            for index, city in enumerate(data):
                if index % 10 == 0:
                    print('On city #%s' % index)
                # For each city call yelp api
                
                if city['state'] != "California":
                    continue

                params = {
                    "latitude": city['latitude'],
                    "longitude": city['longitude'],
                    "limit": 50,
                    "radius": 25,
                    'categories': 'pizza',
                    "open_at": int(format(now().replace(hour=20), "U"))
                }
                response = requests.get(url=url, params=params, headers=headers)

                # Save as Restaurant Entity
                options = []
                if "businesses" in response.json():
                    options = response.json()["businesses"]

                for option in options:
                    create_restaurant(option, city['latitude'], city['longitude'])
    elif command == "dump":
        data = serializers.serialize("json", Restaurant.objects.all())
        with open('restaurants.json', 'w') as outfile:
            json.dump(data, outfile, indent=4)

if __name__ == '__main__':
    run("dump")