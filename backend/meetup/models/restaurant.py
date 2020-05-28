from django.db import models
from .category import Category
from ..helpers import nearby_public_entities
from django.db.models.expressions import RawSQL
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models import Q
from django.utils.text import slugify

class Restaurant(models.Model):

    PRICE_CHOICES = [
        (1, '$'),
        (2, '$$'),
        (3, '$$$'),
        (4, '$$$$')
    ]

    SERIALIZED_PRICE_CHOICES = {
        '$': 1,
        '$$': 2,
        '$$$': 3,
        '$$$$': 4
    }

    DESERIALIZED_PRICE_CHOICES = {
        v:k for k,v in SERIALIZED_PRICE_CHOICES.items()
    }

    identifier = models.CharField(max_length=100)
    name = models.TextField()
    yelp_image = models.TextField()
    yelp_url = models.TextField()
    url = models.SlugField(max_length = 255, unique=True)
    rating = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(10)])
    latitude = models.FloatField()
    longitude = models.FloatField()
    price = models.IntegerField(choices=PRICE_CHOICES)
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

        self.full_clean()

        super(Restaurant, self).save(*args, **kwargs)

    @property
    def price_label(self):
        return DESERIALIZED_PRICE_CHOICES[self.price]

    def get_absolute_url(self):
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
        
        distance_query, category_ids = nearby_public_entities(coords, request, categories, num_results, 'restaurant')

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