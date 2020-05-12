from django.db import models
from django.conf import settings
from django.utils.timezone import now

class Friendship(models.Model):
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="friend_creators",
        on_delete=models.CASCADE,
    )
    friend = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="friends", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(default=now, editable=False)
    objects = models.Manager()