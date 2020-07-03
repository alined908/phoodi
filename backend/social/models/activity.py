from meetup.models import Timestamps, Commentable, User
from .utils import BaseActivity
from enum import Enum
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

channel_layer = get_channel_layer()

"""
Activity Format:
<actor*> <verb*> <action object> <target> <timestamp>

Use Cases:
1. <daniel> <reviewed> <restaurant> <2 hours ago>
2. <restaurant> <posted announcement> <10 minutes ago>
3. <daniel> <joined> <public meetup> <3 days ago>
4. <daniel> <added> <event> to <public meetup> <3 days ago>
4. <bob> <created> <a post> <3 days ago> 
5. <bob> <liked> <a post> <5 mins ago>
6. <daniel> <reached level 5> <3 hours ago>
"""

class Activity(BaseActivity):
    """
    Activity Spec:
    1. <description: meetup> <verb:created> - You made a meetup!
    2. <description: meetup> <verb:created> - 
    3. <description: review> <verb:created> - You made
    """
    edge_rank = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)], default=0.5)
    public = models.BooleanField(default=True, db_index=True)
    comment_count = models.IntegerField(default=0)
    likes_count = models.IntegerField(default=0)

    objects = models.Manager()

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        ctx = {
            'actor': self.actor,
            'verb': self.verb,
            'action_object': self.action_object,
            'target': self.target,
            'timesince': self.timesince()
        }
        if self.target:
            if self.action_object:
                return u'%(actor)s %(verb)s %(action_object)s on %(target)s %(timesince)s ago' % ctx
            return u'%(actor)s %(verb)s %(target)s %(timesince)s ago' % ctx
        if self.action_object:
            return u'%(actor)s %(verb)s %(action_object)s %(timesince)s ago' % ctx
        return u'%(actor)s %(verb)s %(timesince)s ago' % ctx

class ActivityComment(Commentable):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name="comments")

    def save(self, *args, **kwargs):
        if self.pk is None:
            if isinstance(self.parent, ActivityComment):
                self.parent.comment_count += 1

            self.activity.comment_count += 1
            self.activity.save()

        self.full_clean()

        super().save(*args, **kwargs)


class ActivityLike(Timestamps):
    class ActivityLikeChoices(models.IntegerChoices):
        UNLIKE = 0
        LIKE = 1

    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name="activity_likes")
    comment = models.ForeignKey(ActivityComment, on_delete=models.CASCADE, related_name='comment_likes', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_activities')
    status = models.IntegerField(default = ActivityLikeChoices.LIKE.value, choices=ActivityLikeChoices.choices)

    def __init__(self, *args, **kwargs):
        super(ActivityLike, self).__init__(*args, **kwargs)
        self._original_status = self.status

    def save(self, *args, **kwargs):
        if self.pk is None:
            if self.comment is None:
                self.activity.likes_count += 1
            else:
                self.comment.vote_score += 1
        else:
            if self._original_status != self.status:
                if self.comment is None:
                    if self.status == self.ActivityLikeChoices.UNLIKE.value:
                        self.activity.likes_count -= 1
                    else:
                        self.activity.likes_count += 1
                else:
                    if self.status == self.ActivityLikeChoices.UNLIKE.value:
                        self.comment.vote_score -= 1
                    else:
                        self.comment.vote_score += 1

        if self.comment:               
            self.comment.save()
        self.activity.save()
        self.full_clean()

        super().save(*args, **kwargs)
        self._original_status = self.status
        

@receiver(post_save, sender=ActivityComment)
def post_save_review_comment(sender, instance, created, **kwargs):
    from social.models import Notification
    from social.serializers import NotificationSerializer

    if created:
        if not instance.parent:
            notification = Notification.objects.create(
                recipient=instance.activity.actor,
                actor=instance.user,
                verb="commented on",
                action_object=instance.activity,
                description="activity"
            )

            content = {
                "command": "create_notif", 
                "message": NotificationSerializer(notification).data
            }

            async_to_sync(channel_layer.group_send)(
                "notif_room_for_user_%d" % instance.activity.actor.id,
                {
                    "type": "notifications", 
                    "message": content
                }
            )
