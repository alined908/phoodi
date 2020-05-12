from django.db import models
from .user import User
from .review import Comment, Review

class BaseVote(models.Model):
    class Vote(models.IntegerChoices):
        DOWN = -1
        UNVOTE = 0
        UP = 1

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vote = models.IntegerField(choices=Vote.choices)

    class Meta:
        abstract = True

class CommentVote(BaseVote):
    comment = models.ForeignKey(
        Comment, related_name="c_votes", on_delete=models.CASCADE
    )

class ReviewVote(BaseVote):
    review = models.ForeignKey(Review, related_name="r_votes", on_delete=models.CASCADE)
