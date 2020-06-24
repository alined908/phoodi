from django.db import models
from django.conf import settings
from meetup.helpers import generate_unique_uri
from django.utils import timezone
from django.db.models.signals import post_save, pre_save, pre_delete
from django.dispatch import receiver
from .friend import Friendship
from .meetup import Meetup
from .user import User
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

channel_layer = get_channel_layer()

class ChatRoom(models.Model):
    friendship = models.ForeignKey(
        Friendship, null=True, blank=True, on_delete=models.CASCADE
    )
    meetup = models.ForeignKey(Meetup, null=True, blank=True, on_delete=models.SET_NULL)
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


@receiver(post_save, sender=ChatRoom)
def post_save_chat_room(sender, instance, created, **kwargs):
    from ..serializers import ChatRoomSerializer

    for member in instance.members.all():
        serializer = ChatRoomSerializer(instance, context={"user": member.user})

        content = {
            "command": "update_room",
            "message": {
                "room": {
                    instance.uri: serializer.data
                }, 
                "uri": instance.uri
            }
        }

        async_to_sync(channel_layer.group_send)(
            "chat_contacts_for_user_%d" % member.user.id,
            {
                "type": "chat_rooms", 
                "message": content
            }
        )


@receiver(post_save, sender=ChatRoomMessage)
def create_notif_chat_message(sender, instance, created, **kwargs):
    from social.models import Notification
    from social.serializers import NotificationSerializer

    if created:
        room = instance.room
        room.last_updated = timezone.now()
        room.save()

        for member in instance.room.members.all():
            if member.user != instance.sender:
                notification = Notification.objects.create(
                    recipient=member.user,
                    actor=instance.sender,
                    action_object=instance.room,
                    description="chat_message",
                    verb="%s sent chat message to %s"
                    % (instance.sender.email, member.user.email),
                )
        
                content = {
                    "command": "create_notif",
                    "message": NotificationSerializer(notification).data
                }

                async_to_sync(channel_layer.group_send)(
                    "notif_room_for_user_%d" % member.user.id,
                    {
                        "type": "notifications", 
                        "message": content
                    }
                )