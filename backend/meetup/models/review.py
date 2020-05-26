from django.db import models
from django.utils import timezone
from .user import User
from .restaurant import Restaurant
from .utils import Commentable, Base
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from mptt.models import MPTTModel, TreeForeignKey
from enum import Enum

REVIEW_CHOICES = [(i, i) for i in range(1, 11)]

class Review(Commentable):
    restaurant = models.ForeignKey(Restaurant, related_name="reviews", on_delete=models.CASCADE)
    rating = models.IntegerField(choices=REVIEW_CHOICES)

    def save(self, *args, **kwargs):
        if self.pk is None:
            self.restaurant.rating = (self.restaurant.rating * self.restaurant.review_count + float(self.rating)) / (self.restaurant.review_count + 1)
            self.restaurant.review_count += 1
            self.restaurant.save()
            
        super(Review, self).save(*args, **kwargs)

    @property
    def review_url(self):
        return '/restaurants/%s/reviews/%s' % (self.restaurant.url, self.id)

class Comment(MPTTModel, Commentable):
    review = models.ForeignKey(Review, related_name="review_comments", on_delete=models.CASCADE)
    parent = TreeForeignKey("self", related_name="children", on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    
    class MPTTMeta:
        order_insertion_by = ['-vote_score']

    def save(self, *args, **kwargs):
        if self.pk is None:
            if isinstance(self.parent, Comment):
                self.parent.comment_count += 1

            self.review.comment_count += 1
            self.review.save()
            self.review.restaurant.comment_count += 1
            self.review.restaurant.save()
    
        super(Comment, self).save(*args, **kwargs)

class VoteChoice(Enum):
    DOWN = -1
    NOVOTE = 0
    UP = 1

    @classmethod
    def choices(cls):
        choices = []

        for item in cls:
            choices.append((item.name, item.value))

        return tuple(choices)

class Vote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    value = models.IntegerField(default=VoteChoice.NOVOTE, choices=VoteChoice.choices())
    updated_at = models.DateTimeField(auto_now=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def save(self, *args, **kwargs):
        if self.pk is None:
            if isinstance(self.content_object, Review):
                self.content_object.user.review_karma += self.value
            else:
                self.content_object.user.comment_karma += self.value

            self.content_object.vote_score += self.value

            if self.is_upvote():
                self.content_object.ups += 1
            elif self.is_downvote:
                self.content_object.downs += 1

            self.content_object.save()
            self.content_object.user.save()

        super(Vote, self).save(*args, **kwargs)

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
            self.content_object.user.review_karma += karma
        else:
            self.content_object.user.comment_karma += karma

        self.value = new_value
        self.content_object.save()
        self.content_object.user.save()
        self.save()