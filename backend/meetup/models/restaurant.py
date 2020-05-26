from django.db import models
from .category import Category
from ipware import get_client_ip
from django.db.models.expressions import RawSQL
import geocoder
from django.db.models import Q
from django.utils.text import slugify

class Restaurant(models.Model):
    identifier = models.CharField(max_length=100)
    name = models.TextField()
    yelp_image = models.TextField()
    yelp_url = models.TextField()
    url = models.SlugField()
    rating = models.FloatField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    price = models.CharField(max_length=10)
    location = models.TextField()
    address1 = models.CharField(max_length=255, null=True, blank=True)
    address2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    zipcode = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    categories = models.TextField()
    review_count = models.IntegerField(default=0)
    option_count = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)
    objects = models.Manager()

    def save(self, *args, **kwargs):
        if self.pk is None:
            self.url = "%s-%s" % (
                slugify(self.name), 
                slugify(self.city) 
            )
            num_same = Restaurant.objects.filter(city=self.city, name=self.name).count()

            if num_same > 0:
                self.url += "-%s" % (num_same + 1)

        super(Restaurant, self).save(*args, **kwargs)

    @property
    def full_url(self):
        return "%s/%s" % (self.id, self.url)

    @property
    def location_indexing(self):
        return {
            "lat": self.latitude,
            "lon": self.longitude    
        }

    @property
    def categories_indexing(self):
        categories = [r_category.category.label for r_category in self.r_categories.all()]
        return categories

    @staticmethod
    def get_nearby(coords, request, categories, num_results=16):
        if categories:
            try:
                category_ids = [int(x) for x in categories.split(",")]
            except:
                category = Category.objects.get(api_label=categories)
                category_ids = [category.id]
        else:
            category_ids = []

        if request:
            client_ip, is_routable = get_client_ip(request)

            if client_ip:
                if is_routable:
                    geocode = geocoder.ip(client_ip)
                    location = geocode.latlng
                    lat, lng = location[0], location[1]
                else:
                    lat, lng = None, None

        latitude, longitude, radius = (
            coords[0] or lat,
            coords[1] or lng,
            coords[2] or 25,
        )

        if not latitude or not longitude:
            return []

        distance_query = RawSQL(
            " SELECT id FROM \
                (SELECT *, (3959 * acos(cos(radians(%s)) * cos(radians(latitude)) * \
                                        cos(radians(longitude) - radians(%s)) + \
                                        sin(radians(%s)) * sin(radians(latitude)))) \
                    AS distance \
                    FROM meetup_restaurant) \
                AS distances \
                WHERE distance < %s \
                ORDER BY distance \
                OFFSET 0 \
                LIMIT %s",
            (latitude, longitude, latitude, radius, num_results),
        )

        if not category_ids:
            restaurants = Restaurant.objects.filter(id__in=distance_query).order_by("-rating")
        else:
            restaurants = Restaurant.objects.filter(
                Q(
                    id__in=RawSQL(
                        "SELECT DISTINCT category.restaurant_id \
                        FROM meetup_restaurantcategory as category \
                        WHERE category_id = ANY(%s)",
                        (category_ids,),
                    )
                )
                & Q(id__in=distance_query)
            ).order_by("-rating")
  
        return restaurants

class RestaurantCategory(models.Model):
    restaurant = models.ForeignKey(
        Restaurant, related_name="r_categories", on_delete=models.CASCADE
    )
    category = models.ForeignKey(
        Category, related_name="c_restaurants", on_delete=models.CASCADE
    )
    objects = models.Manager()