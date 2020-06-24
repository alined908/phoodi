from meetup.models import User, Followable, ContentTypeAware, Timestamps
from django.db import models

class Group(Followable, ContentTypeAware):
    name = models.CharField(max_length=255)

class GroupMember(Timestamps):
    user = models.ForeignKey(User, related_name="groups", on_delete=models.CASCADE)
    group = models.ForeignKey(Group, related_name="members", on_delete=models.CASCADE)