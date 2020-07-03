from django.contrib.contenttypes.models import ContentType
from django.utils.timezone import now
from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django.core.validators import MinLengthValidator

class Timestamps(models.Model):
    created_at = models.DateTimeField(default=now, editable=False)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        abstract = True

class Followable(models.Model):
    follower_count = models.IntegerField(default=0)

    class Meta:
        abstract = True

class ContentTypeAware(Timestamps):
    def get_content_type(self):
        return ContentType.objects.get_for_model(self)

    def get_content_type_id(self):
        return self.get_content_type().pk

    class Meta:
        abstract = True

class Votable(ContentTypeAware):
    user = models.ForeignKey('meetup.User', on_delete=models.SET_NULL, null=True)
    comment_count = models.IntegerField(default=0)
    vote_score = models.IntegerField(default=0)
    ups = models.IntegerField(default=0)
    downs = models.IntegerField(default=0)
    
    class Meta:
        abstract = True

class Commentable(MPTTModel, Votable):
    parent = TreeForeignKey("self", related_name="children", on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    text = models.CharField(max_length=1000)
    
    class MPTTMeta:
        order_insertion_by = ['-vote_score']
        abstract = True