from rest_framework import serializers
from meetup.models import *
from django.forms.models import model_to_dict
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from notifications.models import Notification


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)
        serializer = UserSerializerWithToken(user, context={"plain": True})
        token["user"] = serializer.data
        return token


class UserSerializer(serializers.ModelSerializer):
    def to_representation(self, data):
        res = super(UserSerializer, self).to_representation(data)
        if self.context.get("plain"):
            return res
        else:
            return {res["id"]: res}

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "avatar", "created_at")


class UserSerializerWithActivity(serializers.ModelSerializer):
    activity = serializers.SerializerMethodField("_get_activity")

    def _get_activity(self, obj):
        notifications = Notification.objects.filter(
            actor_object_id=obj.id, description="user_activity"
        )
        serializer = NotificationSerializer(notifications, many=True)
        return serializer.data

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "avatar", "created_at", "activity")


class UserSerializerWithToken(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True)
    settings = serializers.SerializerMethodField("_get_settings")

    def to_representation(self, data):
        res = super(UserSerializerWithToken, self).to_representation(data)
        if self.context.get("plain"):
            return res
        else:
            return {res["id"]: res}

    def create(self, validated_data):
        if "avatar" not in validated_data:
            avatar = None
        else:
            avatar = validated_data["avatar"]
        user = User.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            avatar=avatar,
            password=validated_data["password"],
        )
        return user

    def _get_settings(self, obj):
        try:
            settings = UserSettings.objects.get(user=obj)
            serializer = UserSettingsSerializer(settings)
            settings_json = serializer.data
        except ObjectDoesNotExist:
            settings_json = {
                "radius": 25,
                "location": None,
                "latitude": None,
                "longitude": None,
            }
        return settings_json

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "password",
            "avatar",
            "created_at",
            "settings",
        )


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ("radius", "location", "latitude", "longitude")


class CategoryPreferenceSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField("_get_user")
    category = serializers.SerializerMethodField("_get_category")

    def _get_user(self, obj):
        serializer = UserSerializer(obj.user, context={"plain": True})
        return serializer.data

    def _get_category(self, obj):
        serializer = CategorySerializer(obj.category)
        return serializer.data

    class Meta:
        model = CategoryPreference
        fields = ("id", "user", "category", "name", "ranking", "created_at")


class FriendshipSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField("_get_friend")
    chat_room = serializers.SerializerMethodField("_get_chat_room")

    def _get_friend(self, obj):
        user = self.context.get("user")

        if obj.creator == user:
            return UserSerializer(obj.friend, context={"plain": True}).data
        else:
            return UserSerializer(obj.creator, context={"plain": True}).data

    def _get_chat_room(self, obj):
        try:
            room = ChatRoom.objects.get(friendship=obj)
        except ObjectDoesNotExist:
            return None

        return room.uri

    class Meta:
        model = Friendship
        fields = ("id", "user", "created_at", "chat_room")


class MeetupSerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField("_get_creator")
    members = serializers.SerializerMethodField("_get_members")
    notifs = serializers.SerializerMethodField("_get_notifs")
    categories = serializers.SerializerMethodField("_get_categories")

    def _get_creator(self, obj):
        user = obj.creator
        serializer = UserSerializer(user, context={"plain": True})
        return serializer.data

    def _get_members(self, obj):
        mapping = {}
        for member in obj.members.all():
            mapping.update(MeetupMemberSerializer(member).data)
        return mapping

    def _get_notifs(self, obj):
        if "user" not in self.context:
            return 0
        user = self.context["user"]
        notifs = user.notifications.filter(
            target_object_id=obj.id, description="meetup"
        ).unread()
        return notifs.count()

    def _get_categories(self, obj):
        meetup_categories = obj.meetup_categories.all()
        categories = list(
            set([meetup_category.category for meetup_category in meetup_categories])
        )
        serializer = CategorySerializer(categories, many=True)
        return serializer.data

    class Meta:
        model = Meetup
        fields = (
            "id",
            "name",
            "uri",
            "creator",
            "location",
            "date",
            "members",
            "notifs",
            "public",
            "categories",
            "latitude",
            "longitude",
        )


class MeetupSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meetup
        fields = ("id", "name", "uri", "public")


class RestaurantCategorySerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField("_get_category")

    def _get_category(self, obj):
        serializer = CategorySerializer(obj.category)
        return serializer.data

    class Meta:
        model = RestaurantCategory
        fields = ("category",)


class RestaurantSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField("_get_categories")

    def _get_categories(self, obj):
        serializer = RestaurantCategorySerializer(obj.r_categories, many=True)
        return serializer.data

    class Meta:
        model = Restaurant
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField("_get_children")
    user = serializers.SerializerMethodField("_get_user")

    def _get_user(self, obj):
        user = obj.user
        serializer = UserSerializer(user, context={"plain": True})
        return serializer.data

    def _get_children(self, obj):
        serializer = CommentSerializer(obj.children, many=True)
        return serializer.data

    class Meta:
        model = Comment
        fields = "__all__"


class ReviewSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField("_get_children")
    user = serializers.SerializerMethodField("_get_user")

    def _get_user(self, obj):
        user = obj.user
        serializer = UserSerializer(user, context={"plain": True})
        return serializer.data

    def _get_children(self, obj):
        top = Comment.objects.filter(review=obj, parent=None)
        serializer = CommentSerializer(top, many=True)
        return serializer.data

    class Meta:
        model = Review
        fields = "__all__"


class MeetupEventOptionVoteSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField("_get_user")

    def to_representation(self, data):
        res = super(MeetupEventOptionVoteSerializer, self).to_representation(data)
        return {res["user"]["id"]: res}

    def _get_user(self, obj):
        user = obj.member.user
        serializer = UserSerializer(user, context={"plain": True})
        return serializer.data

    class Meta:
        model = MeetupEventOptionVote
        fields = ("id", "status", "user")


class MeetupEventOptionSerializer(serializers.ModelSerializer):
    votes = serializers.SerializerMethodField("_get_votes")
    restaurant = serializers.SerializerMethodField("_get_restaurant")

    def to_representation(self, data):
        res = super(MeetupEventOptionSerializer, self).to_representation(data)
        return {res["id"]: res}

    def _get_votes(self, obj):
        mapping = {}
        for vote in obj.event_votes.all():
            mapping.update(MeetupEventOptionVoteSerializer(vote).data)
        return mapping

    def _get_restaurant(self, obj):
        serializer = RestaurantSerializer(obj.restaurant)
        return serializer.data

    class Meta:
        model = MeetupEventOption
        fields = ("id", "score", "option", "restaurant", "votes", "banned")


class MeetupEventSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField("_get_options")
    categories = serializers.SerializerMethodField("_get_categories")
    creator = serializers.SerializerMethodField("_get_creator")

    def _get_categories(self, obj):
        ids = obj.entries.values()
        categories = Category.objects.filter(id__in=ids)
        serializer = CategorySerializer(categories, many=True)
        return serializer.data

    def _get_options(self, obj):
        mapping = {}
        for option in obj.options.all():
            mapping.update(MeetupEventOptionSerializer(option).data)
        return mapping

    def _get_creator(self, obj):
        creator = obj.creator
        user = creator.user
        serializer = UserSerializer(user, context={"plain": True})
        return serializer.data

    class Meta:
        model = MeetupEvent
        fields = "__all__"

class MeetupMemberSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField("_get_user")

    def to_representation(self, data):
        res = super(MeetupMemberSerializer, self).to_representation(data)
        if self.context.get("plain"):
            return res
        else:
            return {res["user"]["id"]: res}

    def _get_user(self, obj):
        serializer = UserSerializer(obj.user, context={"plain": True})
        return serializer.data

    class Meta:
        model = MeetupMember
        fields = ["id", "user", "ban", "admin"]


class MeetupInviteSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField("_get_sender")
    receiver = serializers.SerializerMethodField("_get_receiver")
    meetup = serializers.SerializerMethodField("_get_meetup")

    def _get_sender(self, obj):
        serializer = UserSerializer(obj.sender, context={"plain": True})
        return serializer.data

    def _get_receiver(self, obj):
        serializer = UserSerializer(obj.receiver, context={"plain": True})
        return serializer.data

    def _get_meetup(self, obj):
        serializer = MeetupSerializer(obj.meetup)
        return serializer.data

    class Meta:
        model = MeetupInvite
        fields = ("id", "timestamp", "status", "uri", "sender", "receiver", "meetup")


class FriendInviteSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField("_get_sender")
    receiver = serializers.SerializerMethodField("_get_receiver")

    def _get_sender(self, obj):
        serializer = UserSerializer(obj.sender, context={"plain": True})
        return serializer.data

    def _get_receiver(self, obj):
        serializer = UserSerializer(obj.receiver, context={"plain": True})
        return serializer.data

    class Meta:
        model = FriendInvite
        fields = ("id", "timestamp", "status", "uri", "sender", "receiver")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "label", "api_label", "image")


class CategoryVerboseSerializer(CategorySerializer):
    preference = serializers.SerializerMethodField("_get_preference")
    num_liked = serializers.SerializerMethodField("_get_numliked")

    def _get_preference(self, obj):
        user = self.context.get("user")
        preference = CategoryPreference.objects.filter(user=user, category=obj)
        if preference.exists():
            return CategoryPreferenceSerializer(preference[0]).data
        else:
            return None

    def _get_numliked(self, obj):
        count = CategoryPreference.objects.filter(category=obj).count()
        return count

    class Meta(CategorySerializer.Meta):
        model = Category
        fields = ("id", "label", "api_label", "image", "num_liked", "preference")


class ChatRoomSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField("_get_members")
    notifs = serializers.SerializerMethodField("_get_notifs")

    def _get_members(self, obj):
        mapping = {}
        for member in obj.members.all():
            user = member.user
            mapping.update(UserSerializer(user).data)
        return mapping

    def _get_notifs(self, obj):
        user = self.context["user"]
        notifs = user.notifications.filter(
            action_object_object_id=obj.id, description="chat_message"
        ).unread()
        return notifs.count()

    class Meta:
        model = ChatRoom
        fields = "__all__"


class ChatRoomMemberSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField("_get_member")

    def _get_member(self, obj):
        serializer = UserSerializer(obj.user)
        return serializer.data

    class Meta:
        model = ChatRoomMember
        fields = ["user"]


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField("_get_sender")

    def _get_sender(self, obj):
        serializer = UserSerializer(obj.sender, context={"plain": True})
        return serializer.data

    class Meta:
        model = ChatRoomMessage
        fields = ("id", "message", "timestamp", "is_read", "is_notif", "sender")


class GenericNotificationRelatedField(serializers.RelatedField):
    def to_representation(self, value):

        if isinstance(value, User):
            serializer = UserSerializer(value, context={"plain": True})
        elif isinstance(value, Meetup):
            serializer = MeetupSimpleSerializer(value)
        elif isinstance(value, MeetupEvent):
            serializer = MeetupEventSerializer(value)
        elif isinstance(value, MeetupMember):
            serializer = MeetupMemberSerializer(value, context={"plain": True})
        elif isinstance(value, Friendship):
            serializer = FriendshipSerializer(value)
        elif isinstance(value, Preference):
            serializer = CategoryPreferenceSerializer(value)
        elif isinstance(value, Review):
            serializer = ReviewSerializer(value)
        elif isinstance(value, Restaurant):
            serializer = RestaurantSerializer(value)
        else:
            return None

        return serializer.data


class NotificationSerializer(serializers.ModelSerializer):
    actor = GenericNotificationRelatedField(read_only=True)
    target = GenericNotificationRelatedField(read_only=True)
    action_object = GenericNotificationRelatedField(read_only=True)

    class Meta:
        model = Notification
        fields = (
            "id",
            "actor",
            "verb",
            "action_object",
            "target",
            "description",
            "timestamp",
        )
