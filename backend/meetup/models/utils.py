from meetup.models import User
from django.contrib.contenttypes.models import ContentType
from django.utils.timezone import now
from django.db import models

class Base(models.Model):
    created_at = models.DateTimeField(default=now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class ContentTypeAware(Base):
    def get_content_type(self):
        return ContentType.objects.get_for_model(self)

    def get_content_type_id(self):
        return self.get_content_type().pk

    class Meta:
        abstract = True

class Votable(ContentTypeAware):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    comment_count = models.IntegerField(default=0)
    vote_score = models.IntegerField(default=0)
    ups = models.IntegerField(default=0)
    downs = models.IntegerField(default=0)
    
    class Meta:
        abstract = True
