from django.db import models
from django.conf import settings
from django.utils.timezone import now
from django.db.models.signals import post_save, pre_save, pre_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

channel_layer = get_channel_layer()

class Friendship(models.Model):
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="friend_creators", on_delete=models.CASCADE,)
    friend = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="friends", on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=now, editable=False)

    objects = models.Manager()

@receiver(post_save, sender=Friendship)
def create_chat_room_for_friendship(sender, instance, created, **kwargs):
    from .chat import ChatRoom, ChatRoomMember
    from social.models import Notification, Activity, Rank
    from social.serializers import NotificationSerializer

    if created:
        room = ChatRoom.objects.create(friendship=instance)
        ChatRoomMember.objects.create(room=room, user=instance.creator)
        ChatRoomMember.objects.create(room=room, user=instance.friend)

        params_friend = {
            "actor": instance.friend,
            "action_object": instance.creator,
            "verb": "became friends with",
        }

        params_creator = {
            "actor": instance.creator,
            "action_object": instance.friend,
            "verb": "became friends with",
        }

        friend_notification = Notification.objects.create(
            recipient=instance.friend,
            description="friendship", 
            **params_friend
        )
        creator_notification = Notification.objects.create(
            recipient=instance.creator,
            description="friendship", 
            **params_creator
        )

        Activity.objects.create(
            description="friendship", 
            edge_rank= Rank.HIGH.value,
            **params_friend
        )

        Activity.objects.create(
            description="friendship", 
            edge_rank= Rank.HIGH.value,
            **params_creator
        )

        content = {
            "command": "create_notif",
            "message": NotificationSerializer(creator_notification).data
        }
        async_to_sync(channel_layer.group_send)(
            "notif_room_for_user_%d" % instance.creator.id,
            {
                "type": "notifications", 
                "message": content
            }
        )

        content = {
            "command": "create_notif",
            "message": NotificationSerializer(friend_notification).data
        }

        async_to_sync(channel_layer.group_send)(
            "notif_room_for_user_%d" % instance.friend.id,
            {
                "type": "notifications", 
                "message": content
            }
        )