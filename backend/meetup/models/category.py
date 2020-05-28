from django.db import models
from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db.models.expressions import RawSQL
import sys

class Category(models.Model):
    label = models.CharField(max_length=255)
    api_label = models.CharField(max_length=255)
    image = models.ImageField(blank=True, null=True, upload_to="category")
    objects = models.Manager()

    def save(self, *args, **kwargs):
        if self.image:
            image = Image.open(BytesIO(self.image.read()))
            image.thumbnail((100, 100), Image.ANTIALIAS)
            output = BytesIO()
            image.save(output, format="PNG", quality=100)
            output.seek(0)
            self.image = InMemoryUploadedFile(
                output,
                "ImageField",
                "%s.png" % self.image.name,
                "image/png",
                sys.getsizeof(output),
                None,
            )
        self.full_clean()
        super(Category, self).save(*args, **kwargs)

    @staticmethod
    def get_popular():
        categories = Category.objects.filter(
            id__in=RawSQL(
                "SELECT p.id FROM (SELECT pref.category_id as id, COUNT(*) as num\
                FROM meetup_categorypreference as pref \
                GROUP BY pref.category_id \
                ORDER BY COUNT(*) DESC) as p\
                LIMIT 11",
                params=(),
            )
        )
        return categories

    @staticmethod
    def get_random_many():
        categories = Category.objects.filter(
            id__in=RawSQL(
                "SELECT id \
                FROM meetup_category \
                ORDER BY random() \
                LIMIT 26",
                params=(),
            )
        )
        return categories
