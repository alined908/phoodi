from meetup.models import Timestamps
from django.db import models
from meetup.helpers import path_and_rename_general
from enum import Enum
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class BaseActivity(Timestamps):
    actor_content_type = models.ForeignKey(
        ContentType, related_name='%(class)s_actor',
        on_delete=models.CASCADE, db_index=True
    )
    actor_object_id = models.CharField(max_length=255, db_index=True)
    actor = GenericForeignKey('actor_content_type', 'actor_object_id')

    verb = models.CharField(max_length=255, db_index=True)
    description = models.CharField(max_length=255, null=True, blank=True)

    action_object_content_type = models.ForeignKey(
        ContentType, blank=True, null=True,
        related_name='%(class)s_action_object',
        on_delete=models.CASCADE, db_index=True
    )
    action_object_object_id = models.CharField(
        max_length=255, blank=True, null=True, db_index=True
    )
    action_object = GenericForeignKey(
        'action_object_content_type',
        'action_object_object_id'
    )

    target_content_type = models.ForeignKey(
        ContentType, blank=True, null=True,
        related_name='%(class)s_target',
        on_delete=models.CASCADE, db_index=True
    )
    target_object_id = models.CharField(
        max_length=255, blank=True, null=True, db_index=True
    )
    target = GenericForeignKey(
        'target_content_type',
        'target_object_id'
    )

    def timesince(self, now=None):
        """
        Shortcut for the ``django.utils.timesince.timesince`` function of the
        current timestamp.
        """
        from django.utils.timesince import timesince as timesince_
        return timesince_(self.created_at, now)

    class Meta:
        abstract = True

class Rank(Enum):
    HIGH = 0.8
    MEDIUM = 0.5
    LOW = 0.2
    
    def __str__(self):
        return str(self.value)

class Image(Timestamps):
    path = models.ImageField(blank=True, null=True, upload_to=path_and_rename_general)
    description = models.CharField(max_length=255)
    location = models.CharField(max_length=255)

    class Meta:
        abstract = True