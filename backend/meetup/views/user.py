from meetup.models import CategoryPreference, UserSettings, Category, User, Meetup, Friendship
from meetup.serializers import (
    CategoryPreferenceSerializer,
    MyTokenObtainPairSerializer,
    UserSettingsSerializer,
    UserSerializer,
    UserSerializerWithToken,
    FriendshipSerializer,
    UserSerializerWithActivity,
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.conf import settings
from django.db.models import Q
from google.oauth2 import id_token
from google.auth.transport import requests

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class GoogleOAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
    
        client_id = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
        token_id = request.data.get('tokenId')
        id_info = id_token.verify_oauth2_token(token_id, requests.Request(), client_id)

        if id_info['aud'] != client_id or id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return Response({"error": "Invalid authentication"}, status=404)

        email = id_info['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            first_name = id_info['given_name']
            last_name = id_info['family_name']
            user = User.objects.create_user(email=email, first_name=first_name, last_name=last_name)
        
        serializer = UserSerializerWithToken(user, context={"plain": True})
        token = RefreshToken.for_user(user)
        token["user"] = serializer.data
        refresh, access = token, token.access_token
        tokens = {"refresh": str(refresh), "access": str(access)}
        return Response(tokens)

class UserListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        users = User.objects.all()

        serializer = UserSerializer(users, many=True, context={"plain": True})
        return Response(serializer.data)

    def post(self, request):
        user = request.data

        if not user:
            return Response({"error": "No data found"})

        serializer = UserSerializerWithToken(data=user, context={"plain": True})
        if serializer.is_valid():
            try:
                user = serializer.save()
            except ValidationError as e:
                return Response(
                    {"error": e.messages},
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )
        else:
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        token = RefreshToken.for_user(user)
        token["user"] = serializer.data
        refresh, access = token, token.access_token
        tokens = {"refresh": str(refresh), "access": str(access)}
        return Response(tokens)


class UserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        user = get_object_or_404(User, pk=pk)
        return user

    def get(self, request, *args, **kwargs):
        user = self.get_object(kwargs["id"])
        serializer = UserSerializerWithActivity(user)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        user = self.get_object(kwargs["id"])
        serializer = UserSerializer(
            user, data=request.data, partial=True, context={"plain": True}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class UserSettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        settings = UserSettings.objects.get(user=user)
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        user = request.user
        radius, location, latitude, longitude = (
            request.data["radius"],
            request.data["location"],
            request.data["latitude"],
            request.data["longitude"],
        )

        if hasattr(user, "usersettings"):
            user.usersettings.delete()

        try:
            settings = UserSettings.objects.create(
                user=user,
                radius=radius,
                location=location,
                latitude=latitude,
                longitude=longitude,
            )
            serializer = UserSerializerWithToken(user, context={"plain": True})
            return Response(serializer.data)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UserFriendsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get users friends
        """

        pk = kwargs["id"]
        user = User.objects.get(pk=pk)

        if request.GET.get("category", False):
            category = Category.objects.get(api_label=request.GET.get("category"))
            serializer = FriendshipSerializer(
                user.get_friends_by_category(category),
                many=True,
                context={"user": user},
            )
        else:
            serializer = FriendshipSerializer(
                user.get_friends(), many=True, context={"user": user}
            )
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """
        User adds another user as a friend
        """
        user = request.user
        email = request.data["email"]

        try:
            friend = User.objects.get(email=email.strip())
        except ObjectDoesNotExist:
            return Response(
                {"error": "Email does not exist"}, status=status.HTTP_404_NOT_FOUND
            )
        entity = user.get_or_create_friend(friend)
        serializer = FriendshipSerializer(entity, context={"user": user})

        return Response({"friend": serializer.data})

    def delete(self, request, *args, **kwargs):
        """
        Delete friend
        """
        pk, user = request.data["id"], request.user
        friendship = get_object_or_404(Friendship, pk=pk)
        friendship.delete()
        serializer = FriendshipSerializer(
            user.get_friends(), many=True, context={"user": user}
        )
        return Response(serializer.data)


class UserPreferenceListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        pk = kwargs["id"]
        user = User.objects.get(pk=pk)
        preferences = CategoryPreference.objects.filter(user=user).order_by("ranking")
        serializer = CategoryPreferenceSerializer(preferences, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        user = request.user
        category_id = request.data["category_id"]
        category = Category.objects.get(pk=category_id)

        if CategoryPreference.objects.filter(user=user, category=category).exists():
            return Response(
                {"error": "Already a preference"}, status=status.HTTP_400_BAD_REQUEST
            )

        pref_count = user.categorypreferences.all().count()
        preference = CategoryPreference.objects.create(
            user=user, category=category, name=category.label, ranking=(pref_count + 1)
        )
        serializer = CategoryPreferenceSerializer(preference)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        user, old_ranking, new_ranking = (
            request.user,
            request.data["oldRanking"],
            request.data["newRanking"],
        )
        try:
            moved_preference = CategoryPreference.objects.filter(
                user=user, ranking=old_ranking
            )[0]
            moved_preference.reorder_preferences(new_ranking)
            preferences = CategoryPreference.objects.filter(user=user).order_by("ranking")
            serializer = CategoryPreferenceSerializer(preferences, many=True)
            return Response(serializer.data)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UserPreferenceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_preference(self, user_id, category_id):
        user = get_object_or_404(User, pk=user_id)
        category = get_object_or_404(Category, pk=category_id)
        preference = get_object_or_404(CategoryPreference, user=user, category=category)
        return preference, user

    def patch(self, request, *args, **kwargs):
        name = request.data["name"]
        preference, user = self.get_preference(kwargs["id"], kwargs["category_id"])
        try:
            preference.name = name
            preference.save()
            serializer = CategoryPreferenceSerializer(preference)
            return Response(serializer.data)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        preference, user = self.get_preference(kwargs["id"], kwargs["category_id"])
        try:
            preference.reorder_preferences_delete()
            preference.delete()
            serializer = CategoryPreferenceSerializer(user.categorypreferences, many=True)
            return Response(serializer.data)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UserNotificationView(APIView):
    permission_classes = []

    def delete(self, request, *args, **kwargs):
        user = request.user
        description = request.data["type"]
        if "id" in request.data:
            object_id = request.data["id"]
            if description == "meetup":
                user.notifications.filter(
                    target_object_id=object_id, description=description
                ).mark_all_as_read()
            else:
                user.notifications.filter(
                    action_object_object_id=object_id, description=description
                ).mark_all_as_read()
        else:
            user.notifications.filter(description=description).mark_all_as_read()
        count = user.notifications.filter(description=description).unread().count()

        return Response({description: count})
