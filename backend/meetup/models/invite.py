from django.db import models
from django.conf import settings
from meetup.helpers import generate_unique_uri
from .friend import Friendship
from django.db.models.signals import post_save, pre_save, pre_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

channel_layer = get_channel_layer()

class Invite(models.Model):
    class InviteStatus(models.IntegerChoices):
        OPEN = 1
        ACCEPTED = 2
        REJECTED = 3

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sent_%(class)ss",
        on_delete=models.CASCADE,
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="received_%(class)ss",
        on_delete=models.CASCADE,
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.IntegerField(
        choices=InviteStatus.choices, default=InviteStatus.OPEN
    )
    uri = models.URLField(default=generate_unique_uri)

    class Meta:
        abstract = True

class MeetupInvite(Invite):
    meetup = models.ForeignKey("meetup.Meetup", related_name="invs", on_delete=models.CASCADE)
    objects = models.Manager()

    def __init__(self, *args, **kwargs):
        super(MeetupInvite, self).__init__(*args, **kwargs)

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        from .meetup import MeetupMember

        if self.status != Invite.InviteStatus.OPEN:
            if self.status == Invite.InviteStatus.ACCEPTED:
                MeetupMember.objects.get_or_create(
                    meetup=self.meetup, user=self.receiver
                )
        super(MeetupInvite, self).save(force_insert, force_update, *args, **kwargs)


class FriendInvite(Invite):
    objects = models.Manager()

    def __init__(self, *args, **kwargs):
        super(FriendInvite, self).__init__(*args, **kwargs)

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        if self.status != Invite.InviteStatus.OPEN:
            if self.status == Invite.InviteStatus.ACCEPTED:
                Friendship.objects.get_or_create(
                    creator=self.sender, friend=self.receiver
                )
        super(FriendInvite, self).save(force_insert, force_update, *args, **kwargs)


@receiver(post_save, sender=MeetupInvite)
def create_notif_meetup_inv(sender, instance, created, **kwargs):
    from social.models import Notification
    from social.serializers import NotificationSerializer

    if created:
        notification = Notification.objects.create(
            recipient=instance.receiver,
            actor=instance.sender,
            action_object=instance,
            description="meetup_invite",
            verb="%s sent meetup invite to %s" % (instance.sender.email, instance.receiver.email)
        )

        content = {
            "command": "create_notif", 
            "message": NotificationSerializer(notification).data
        }

        async_to_sync(channel_layer.group_send)(
            "notif_room_for_user_%d" % instance.receiver.id,
            {
                "type": "notifications", 
                "message": content
            }
        )


@receiver(post_save, sender=FriendInvite)
def create_notif_friend_inv(sender, instance, created, **kwargs):
    from social.models import Notification
    from social.serializers import NotificationSerializer

    if created:
        notification = Notification.objects.create(
            recipient=instance.receiver,
            actor=instance.sender,
            action_object=instance,
            description="friend_invite",
            verb="%s sent friend invite to %s" % (instance.sender.email, instance.receiver.email)
        )

        content = {
            "command": "create_notif", 
            "message": NotificationSerializer(notification).data
        }

        async_to_sync(channel_layer.group_send)(
            "notif_room_for_user_%d" % instance.receiver.id,
            {
                "type": "notifications", 
                "message": content
            }
        )