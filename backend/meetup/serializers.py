from rest_framework import serializers
from rest_framework.fields import CurrentUserDefault
from rest_framework_jwt.settings import api_settings
from meetup.models import User, Category, MeetupEventOption, MeetupEventOptionVote, MeetupEvent, MeetupInvite, ChatRoomMessage, Friendship, ChatRoom, ChatRoomMember, Meetup, MeetupMember, FriendInvite
from django.forms.models import model_to_dict

class UserSerializer(serializers.ModelSerializer):
    def to_representation(self, data):
        res = super(UserSerializer, self).to_representation(data)
        if self.context.get("plain"):
            return res
        else:
            return {res['id']: res}
        
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name')

class UserSerializerWithToken(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        user = User.objects.create_user(email=validated_data['email'], first_name=validated_data['first_name'], password=validated_data['password'])
        return user

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'password')
    
class FriendshipSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField('_get_friend')

    def _get_friend(self, obj):
        user = self.context.get('user')
        
        if obj.creator == user:
            return UserSerializer(obj.friend, context={'plain': True}).data
        else:
            return UserSerializer(obj.creator, context={'plain': True}).data

    class Meta:
        model = Friendship
        fields = ('id', 'user', 'created_at')

class ChatRoomSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField('_get_members')

    def _get_members(self, obj):
        mapping = {}
        for member in obj.members.all():
            user = member.user
            mapping.update(UserSerializer(user).data)
        return mapping

    class Meta:
        model = ChatRoom
        fields = ('id', 'uri', 'name', 'timestamp', 'members')

class ChatRoomMemberSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField('_get_member')

    def _get_member(self, obj):
        serializer = UserSerializer(obj.user)
        return serializer.data

    class Meta:
        model = ChatRoomMember
        fields = ['user']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoomMessage
        fields = ('__all__')

class MeetupSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField('_get_members')

    def _get_members(self, obj):
        mapping = {}
        for member in obj.members.all():
            user = member.user
            mapping.update(UserSerializer(user).data)
        return mapping

    class Meta:
        model = Meetup
        fields = ('id', 'name', 'uri', 'location', 'datetime', 'members')

class MeetupEventOptionVoteSerializer(serializers.ModelSerializer):
    def to_representation(self, data):
        res = super(MeetupEventOptionVoteSerializer, self).to_representation(data)
        return {res['user']: res}

    class Meta:
        model = MeetupEventOption
        fields = ('__all__')

class MeetupEventOptionSerializer(serializers.ModelSerializer):
    votes = serializers.SerializerMethodField("_get_votes")

    def _get_votes(self, obj):
        serializer = MeetupEventOptionVoteSerializer(obj.event_votes.all(), many=True)
        return serializer.data

    class Meta:
        model = MeetupEventOption
        fields = ('id', 'event', 'option', 'votes')

class MeetupEventSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField('_get_options')

    def _get_options(self, obj):
        serializer = MeetupEventOptionSerializer(obj.options.all(), many=True)
        return serializer.data

    class Meta:
        model = MeetupEvent
        fields = ('id', 'meetup', 'title', 'location', 'start', 'end', 'chosen', 'options')

class MeetupMemberSerializer(serializers.ModelSerializer):
    member = serializers.SerializerMethodField('_get_member')

    def _get_member(self, obj):
        serializer = UserSerializer(obj.user)
        return serializer.data

    class Meta:
        model = MeetupMember
        fields = ['member']

class MeetupInviteSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField('_get_sender')
    receiver = serializers.SerializerMethodField('_get_receiver')
    meetup = serializers.SerializerMethodField('_get_meetup')

    def _get_sender(self, obj):
        serializer = UserSerializer(obj.sender, context={'plain': True})
        return serializer.data

    def _get_receiver(self, obj):
        serializer = UserSerializer(obj.receiver, context={'plain': True})
        return serializer.data
    
    def _get_meetup(self, obj):
        serializer = MeetupSerializer(obj.meetup)
        return serializer.data

    class Meta:
        model = MeetupInvite
        fields = ('id', 'timestamp', 'status', 'uri', 'sender', 'receiver','meetup')

class FriendInviteSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField('_get_sender')
    receiver = serializers.SerializerMethodField('_get_receiver')

    def _get_sender(self, obj):
        serializer = UserSerializer(obj.sender, context={'plain': True})
        return serializer.data

    def _get_receiver(self, obj):
        serializer = UserSerializer(obj.receiver, context={'plain': True})
        return serializer.data

    class Meta:
        model = FriendInvite
        fields = ('id', 'timestamp', 'status', 'uri', 'sender', 'receiver')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'label', 'api_label')