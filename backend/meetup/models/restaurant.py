from django.db import models
from .category import Category
from ..helpers import nearby_public_entities
from django.db.models.expressions import RawSQL
from django.contrib.postgres.fields import JSONField
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
    def hours(self):
        hours = self.hours().all()
        output = {}

        for entry in hours:
            day = RestaurantHours.DESERIALIZED_DAY_CHOICES[entry.day]
            output[day] = {
                'start': entry.open_time,
                'end': entry.close_time
            }

        return output

    @property
    def location_indexing(self):
        return {
            "lat": self.latitude,
            "lon": self.longitude    
        }

    @property
    def categories_indexing(self):
        from meetup.serializers import CategorySerializer
        rst_categories = self.r_categories.all().values_list('category_id', flat=True)
        categories = Category.objects.filter(id__in=rst_categories)
        serializer = CategorySerializer(categories, many=True)
        return serializer.data


class RestaurantHours(models.Model):

    DAY_CHOICES = [
        (1, "Monday"),
        (2, "Tuesday"),
        (3, "Wednesday"),
        (4, "Thursday"),
        (5, "Friday"),
        (6, "Saturday"),
        (7, "Sunday")
    ]

    SERIALIZED_DAY_CHOICES = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 7
    }

    DESERIALIZED_DAY_CHOICES = {
        v:k for k,v in SERIALIZED_DAY_CHOICES.items()
    }

    restaurant = models.ForeignKey(
        Restaurant, related_name='hours', on_delete=models.CASCADE
    )
    day = models.IntegerField(choices=DAY_CHOICES)
    open_time = models.TimeField()
    close_time = models.TimeField()

class RestaurantCategory(models.Model):
    restaurant = models.ForeignKey(
        Restaurant, related_name="r_categories", on_delete=models.CASCADE
    )
    category = models.ForeignKey(
        Category, related_name="c_restaurants", on_delete=models.CASCADE
    )
    objects = models.Manager()