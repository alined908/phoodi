from django.db import models
from django.core.validators import MinLengthValidator
from django.utils import timezone
from .user import User
from .restaurant import Restaurant
from .utils import Votable, Timestamps, Commentable
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from enum import Enum

channel_layer= get_channel_layer()

REVIEW_CHOICES = [(i, i) for i in range(1, 11)]

class Review(Votable):
    restaurant = models.ForeignKey(Restaurant, related_name="reviews", on_delete=models.CASCADE)
    rating = models.IntegerField(choices=REVIEW_CHOICES)
    text = models.CharField(max_length=1000, validators=[MinLengthValidator(10, "Review length must be more than 10 characters.")])

    def save(self, *args, **kwargs):
        if self.pk is None:
            self.restaurant.rating = (self.restaurant.rating * self.restaurant.review_count + float(self.rating)) / (self.restaurant.review_count + 1)
            self.restaurant.review_count += 1
            self.restaurant.save()

        self.full_clean()

        super().save(*args, **kwargs)

    @property
    def review_url(self):
        return '/restaurants/%s/reviews/%s' % (self.restaurant.url, self.id)

class ReviewComment(Commentable):
    review = models.ForeignKey(Review, related_name="review_comments", on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        if self.pk is None:
            if isinstance(self.parent, ReviewComment):
                self.parent.comment_count += 1

            self.review.comment_count += 1
            self.review.save()
            self.review.restaurant.comment_count += 1
            self.review.restaurant.save()

        self.full_clean()

        super().save(*args, **kwargs)

class VoteChoice(Enum):
    DOWN = -1
    NOVOTE = 0
    UP = 1

    @classmethod
    def choices(cls):
        choices = []

        for item in cls:
            choices.append((item.value, item.name))

        return choices

class Vote(Timestamps):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    value = models.IntegerField(choices=VoteChoice.choices())
    updated_at = models.DateTimeField(auto_now=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def save(self, *args, **kwargs):
        if self.pk is None:
            if isinstance(self.content_object, Review):
                self.content_object.user.profile.review_karma += self.value
            elif isinstance(self.content_object, ReviewComment):
                self.content_object.user.profile.comment_karma += self.value

            self.content_object.vote_score += self.value

            if self.is_upvote():
                self.content_object.ups += 1
            elif self.is_downvote:
                self.content_object.downs += 1

            self.content_object.save()
            self.content_object.user.profile.save()

        self.full_clean()

        super().save(*args, **kwargs)

    def is_upvote(self, value = None):
        if value == None:
            value = self.value

        return value == VoteChoice.UP.value
    
    def is_downvote(self, value = None):
        if value == None:
            value = self.value

        return value == VoteChoice.DOWN.value

    def handle_vote(self, new_value):
        if self.is_upvote() and self.is_upvote(new_value):  #cancel upvote
            new_value = 0
            karma = -1
            self.content_object.ups -= 1
            self.content_object.vote_score -= 1
        elif self.is_downvote() and self.is_downvote(new_value): #cancel downvote
            new_value = 0
            karma = 1
            self.content_object.downs -= 1
            self.content_object.vote_score += 1
        elif self.is_downvote() and self.is_upvote(new_value): #down to up
            karma = 2
            self.content_object.ups += 1
            self.content_object.downs -= 1
            self.content_object.vote_score += 2
        elif self.is_upvote() and self.is_downvote(new_value): #up to down
            karma = -2
            self.content_object.ups -=1
            self.content_object.downs += 1
            self.content_object.vote_score -=2
        elif self.value == 0 and self.is_upvote(new_value): #none to up
            karma = 1
            self.content_object.ups += 1
            self.content_object.vote_score += 1
        elif self.value == 0 and self.is_downvote(new_value): #none to down
            karma = -1
            self.content_object.downs += 1
            self.content_object.vote_score -= 1
        else:
            return None

        if isinstance(self.content_object, Review):
            self.content_object.user.profile.review_karma += karma
        elif isinstance(self.content_object, ReviewComment):
            self.content_object.user.profile.comment_karma += karma

        self.value = new_value
        self.content_object.save()
        self.content_object.user.profile.save()
        self.save()

@receiver(post_save, sender=Review)
def post_save_review(sender, instance, created, **kwargs):
    from social.models import Activity

    if created:
        Activity.objects.create(
            actor = instance.user,
            action_object=instance,
            target=instance.restaurant,
            description="review",
            verb="created"
        )

@receiver(post_save, sender=ReviewComment)
def post_save_review_comment(sender, instance, created, **kwargs):
    from social.models import Notification
    from social.serializers import NotificationSerializer

    if created:
        if not instance.parent:
            notification = Notification.objects.create(
                recipient=instance.review.user,
                actor=instance.user,
                verb="commented on",
                action_object=instance.review,
                target= instance.review.restaurant,
                description="review"
            )

            content = {
                "command": "create_notif", 
                "message": NotificationSerializer(notification).data
            }

            async_to_sync(channel_layer.group_send)(
                "notif_room_for_user_%d" % instance.review.user.id,
                {
                    "type": "notifications", 
                    "message": content
                }
            )
