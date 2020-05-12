from django.db import models
from django.conf import settings
from meetup.helpers import generate_unique_uri
from .friend import Friendship
from .meetup import Meetup
from .user import User

class ChatRoom(models.Model):
    friendship = models.ForeignKey(
        Friendship, null=True, blank=True, on_delete=models.CASCADE
    )
    meetup = models.ForeignKey(Meetup, null=True, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, null=True, blank=True)
    uri = models.URLField(default=generate_unique_uri)
    timestamp = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    def __str__(self):
        return self.uri


class ChatRoomMessage(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sent_msgs",
        on_delete=models.SET_NULL,
        null=True,
    )
    room = models.ForeignKey(
        ChatRoom, on_delete=models.CASCADE, related_name="messages"
    )
    is_notif = models.BooleanField(default=False)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    objects = models.Manager()

    def __str__(self):
        return self.message

    class Meta:
        ordering = ("timestamp",)


class ChatRoomMember(models.Model):
    room = models.ForeignKey(ChatRoom, related_name="members", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="rooms", on_delete=models.CASCADE)
    objects = models.Manager()