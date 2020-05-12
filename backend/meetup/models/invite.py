from django.db import models
from django.conf import settings
from meetup.helpers import generate_unique_uri
from .meetup import Meetup, MeetupMember
from .friend import Friendship

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
    meetup = models.ForeignKey(Meetup, related_name="invs", on_delete=models.CASCADE)
    objects = models.Manager()

    def __init__(self, *args, **kwargs):
        super(MeetupInvite, self).__init__(*args, **kwargs)

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
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