from rest_framework import serializers
from rest_framework_jwt.settings import api_settings
from meetup.models import User, ChatRoomMessage, Friendship, ChatRoom, ChatRoomMember, Meetup, MeetupMember

class UserSerializer(serializers.ModelSerializer):
    def to_representation(self, data):
        res = super(UserSerializer, self).to_representation(data)
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
    class Meta:
        model = Friendship
        fields = ('id', 'creator', 'friend', 'created_at')

class FriendsSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField('get_friends')

    def get_friends(self, obj):
        print("DWADAWDAWD")
        friends = obj.get_friends()
        print("HELDLAWODLWA")
        print(friends)
        serializer = UserSerializer(friends, many=True)
        return serializer.data

    class Meta:
        model = Friendship
        fields = ('id', 'friends')

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
        fields = ('id', 'uri', 'location', 'datetime', 'options', 'chosen', 'members')



    

