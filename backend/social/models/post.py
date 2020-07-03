from django.db import models
from meetup.models import User, Restaurant
from django.contrib.contenttypes.fields import GenericRelation
from .activity import Activity
from .utils import Rank, Image
from meetup.helpers import path_and_rename_post
from meetup.models import Timestamps
from django.db.models.signals import post_save
from django.dispatch import receiver

class Post(Timestamps):
    poster_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name="posts")
    poster_restaurant = models.ForeignKey(Restaurant, null=True, blank=True, on_delete=models.CASCADE)
    poster_group = models.ForeignKey("social.Group", null=True, blank=True, on_delete=models.CASCADE)
    content = models.TextField()

    @property
    def poster(self):
        if self.poster_user:
            return self.poster_user
        elif self.poster_restaurant:
            return self.poster_restaurant
        elif self.poster_group:
            return self.poster_group
        
        raise AssertionError("Poster not set")

    def create_activity(self):
        """
        <bob> <created> <a post> <3 days ago> 
        """

        activity = Activity.objects.create(
            actor=self.poster,
            verb="created",
            action_object=self,
            edge_rank=Rank.HIGH.value,
            description='post'
        )

class PostImage(Image):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="images")

@receiver(post_save, sender=Post)
def create_activity(sender, instance, created, **kwargs):
    if created:
        instance.create_activity()