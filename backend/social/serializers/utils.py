from rest_framework import serializers
from meetup.serializers import *
from .post import PostSerializer
from meetup.models import User, Meetup, Friendship, Review, Restaurant, MeetupEvent, MeetupMember, ChatRoom
from social.models import Post

class GenericActivityRelatedField(serializers.RelatedField):
    def to_representation(self, value):
        if isinstance(value, User):
            serializer = UserSerializer(value, context={"plain": True})
        elif isinstance(value, Post):
            serializer = PostSerializer(value)
        elif isinstance(value, Meetup):
            serializer = MeetupSimpleSerializer(value)
        elif isinstance(value, MeetupEvent):
            serializer = MeetupEventSerializer(value)
        elif isinstance(value, MeetupMember):
            serializer = MeetupMemberSerializer(value, context={"plain": True})
        elif isinstance(value, Friendship):
            serializer = FriendshipSerializer(value)
        elif isinstance(value, Review):
            serializer = ReviewSerializer(value, context={'restaurant': True})
        elif isinstance(value, ChatRoom):
            serializer = ChatRoomSerializer(value)
        elif isinstance(value, Restaurant):
            serializer = RestaurantSerializer(value)
        else:
            return None

        return serializer.data