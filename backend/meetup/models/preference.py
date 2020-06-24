from django.db import models
from .user import User
from .restaurant import Restaurant
from .category import Category
from .utils import Timestamps
from django.db.models import F

class Preference(Timestamps):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)ss")
    name = models.CharField(max_length=255)
    ranking = models.PositiveSmallIntegerField()

    def reorder_preferences(self, new_rank):
        ParentPreference = type(self)

        old_rank = self.ranking

        if old_rank == new_rank:
            pass
        elif old_rank < new_rank:
            ParentPreference.objects.filter(
                user=self.user, ranking__lte=new_rank, ranking__gte=old_rank
            ).update(ranking=F("ranking") - 1)
        else:
            ParentPreference.objects.filter(
                user=self.user, ranking__lte=old_rank, ranking__gte=new_rank
            ).update(ranking=F("ranking") + 1)

        self.ranking = new_rank
        self.save()

    def reorder_preferences_delete(self):
        ParentPreference = type(self)
      
        ParentPreference.objects.filter(
            user=self.user, 
            ranking__gt=self.ranking
        ).update(
            ranking=F("ranking") - 1
        )

    class Meta:
        abstract = True
        
class RestaurantPreference(Preference):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="preferences")
    objects = models.Manager()

class CategoryPreference(Preference):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="preferences")
    objects = models.Manager()