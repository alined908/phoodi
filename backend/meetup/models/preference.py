from django.db import models
from .user import User
from .restaurant import Restaurant
from .category import Category
from django.db.models import F

class RestaurantPreference(models.Model):
    user = models.ForeignKey(
        User, related_name="preferred_restaurants", on_delete=models.CASCADE
    )
    restaurant = models.ForeignKey(
        Restaurant, related_name="likes", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=255)
    ranking = models.PositiveSmallIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    def reorder_preferences(self, new_rank):
        old_rank = self.ranking
        if old_rank == new_rank:
            pass
        elif old_rank < new_rank:
            RestaurantPreference.objects.filter(
                user=self.user, ranking__lte=new_rank, ranking__gte=old_rank
            ).update(ranking=F("ranking") - 1)
        else:
            RestaurantPreference.objects.filter(
                user=self.user, ranking__lte=old_rank, ranking__gte=new_rank
            ).update(ranking=F("ranking") + 1)
        self.ranking = new_rank
        self.save()

    def reorder_preferences_delete(self):
        RestaurantPreference.objects.filter(
            user=self.user, ranking__gt=self.ranking
        ).update(ranking=F("ranking") - 1)


class Preference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="preferences")
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    ranking = models.PositiveSmallIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    def reorder_preferences(self, new_rank):
        old_rank = self.ranking
        if old_rank == new_rank:
            pass
        elif old_rank < new_rank:
            Preference.objects.filter(
                user=self.user, ranking__lte=new_rank, ranking__gte=old_rank
            ).update(ranking=F("ranking") - 1)
        else:
            Preference.objects.filter(
                user=self.user, ranking__lte=old_rank, ranking__gte=new_rank
            ).update(ranking=F("ranking") + 1)
        self.ranking = new_rank
        self.save()

    def reorder_preferences_delete(self):
        Preference.objects.filter(user=self.user, ranking__gt=self.ranking).update(
            ranking=F("ranking") - 1
        )

