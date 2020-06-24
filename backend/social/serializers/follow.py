from rest_framework import serializers
from social.models import Follow
from .utils import GenericActivityRelatedField

class FollowSerializer(serializers.ModelSerializer):
    followee = GenericActivityRelatedField(read_only=True)

    class Meta:
        model = Follow
        fields = '__all__'