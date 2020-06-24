from meetup.models import User, Timestamps, ContentTypeAware
from .activity import Activity
from .notification import Notification
from .utils import Rank
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class Follow(Timestamps):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follows")
    
    followee_content_type = models.ForeignKey(
        ContentType, related_name='followee',
        on_delete=models.CASCADE, db_index=True
    )
    followee_object_id = models.CharField(max_length=255, db_index=True)
    followee = GenericForeignKey('followee_content_type', 'followee_object_id')

    objects = models.Manager()

    def create_activity(self):
        """
        Examples:
            <Bob/You> <followed> <User> <x time ago>
            <Bob/You> <followed> <Restaurant> <x time ago>
            <Bob/You> <followed> <Group> <x time ago>
        """
        activity = Activity.objects.create(
            actor=self.follower, 
            verb="followed",
            action_object=self.followee,
            edge_rank=Rank.LOW.value,
            description='follow'
        )

    def create_notification(self):
        """
        Create notification for followed user.
        
        Examples:
            <Bob> <followed> <You(User, Restaurant, Group)> <x time ago>
        """
        if isinstance(self.followee, User):

            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            from social.serializers import NotificationSerializer

            channel_layer = get_channel_layer()

            notification = Notification.objects.create(
                recipient = self.followee,
                actor=self.follower,
                verb="followed",
                action_object=self.followee,
                description="follow"
            )

            serializer = NotificationSerializer(notification)

            content = {
                "command": "create_notif", 
                "message": serializer.data
            }

            async_to_sync(channel_layer.group_send)(
                "notif_room_for_user_%d" % self.followee.id,
                {
                    "type": "notifications", 
                    "message": content
                }
            )

@receiver(post_save, sender=Follow)
def create_activity(sender, instance, created, **kwargs):
    if created:
        instance.create_activity()
        instance.create_notification()