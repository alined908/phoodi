from django.db import models
from .user import User
from .restaurant import Restaurant

class BaseComment(models.Model):
    text = models.CharField(max_length=1000)
    vote_score = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class Review(BaseComment):
    CHOICES = [(i, i) for i in range(1, 11)]
    user = models.ForeignKey(
        User, related_name="u_reviews", on_delete=models.SET_NULL, null=True
    )
    restaurant = models.ForeignKey(
        Restaurant, related_name="r_reviews", on_delete=models.CASCADE
    )
    rating = models.IntegerField(choices=CHOICES)

class Comment(BaseComment):
    user = models.ForeignKey(
        User, related_name="u_comments", on_delete=models.SET_NULL, null=True
    )
    restaurant = models.ForeignKey(
        Restaurant, related_name="rst_comments", on_delete=models.CASCADE
    )
    review = models.ForeignKey(
        Review, related_name="review_comments", on_delete=models.CASCADE
    )
    parent_comment = models.ForeignKey(
        "self", related_name="children", on_delete=models.SET_NULL, null=True
    )
