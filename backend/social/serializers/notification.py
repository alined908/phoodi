from rest_framework import serializers
from meetup.serializers import UserSerializer
from social.models import Notification
from .utils import GenericActivityRelatedField

class NotificationSerializer(serializers.ModelSerializer):
    actor = GenericActivityRelatedField(read_only=True)
    target = GenericActivityRelatedField(read_only=True)
    action_object = GenericActivityRelatedField(read_only=True)

    class Meta:
        model = Notification
        fields = ('id', 'actor', 'action_object', 'target', 'description', 'verb', 'is_unread', 'is_global', 'created_at')