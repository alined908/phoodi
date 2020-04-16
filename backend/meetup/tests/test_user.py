from meetup.models import User, UserSettings, Category, Friendship,  Preference
from meetup.serializers import UserSerializer, UserSettingsSerializer, UserSerializerWithToken, PreferenceSerializer, FriendshipSerializer
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.hashers import make_password
from django.test import TestCase
import json, jwt

client = APIClient()

class AuthTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", last_name="Lee", password=make_password("password"), first_name="Daniel")
        self.payload = {"email": "test@gmail.com", "password": "password"}

    def test_generate_token(self):
        response = client.post("/api/token/", self.payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        obj = json.loads(json.dumps(response.data))
        decoded = jwt.decode(obj["access"], verify=False)
        self.assertEqual(self.user.email, decoded['user']['email'])
        return obj

    def test_refresh_token(self):
        tokens = self.test_generate_token()
        refresh = tokens['refresh']
        response = client.post("/api/token/refresh/", {"refresh": refresh})
        obj = json.loads(json.dumps(response.data))
        decoded = jwt.decode(obj["access"], verify=False)
        self.assertEqual(self.user.email, decoded['user']['email'])

class UserTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user2 = User.objects.create(email="test2@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Kim")
        self.user3 = User.objects.create(email="test3@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Park")
        self.friendship12 = Friendship.objects.create(creator=self.user1, friend=self.user2)
        self.friendship13 = Friendship.objects.create(creator=self.user1, friend=self.user3)
        self.valid_payload = {"email": "test4@gmail.com", "first_name":"Daniel", "last_name": "Lee", "password": "password"}
        self.invalid_payload = {"email": "test5@gmail.com", "first_name":"", "last_name": "Lee", "password": "password"}
        self.valid_payload_patch = {"email": "test@gmail.com", "first_name":"Dan", "last_name": "Lee"}
        self.invalid_payload_patch = {"email": "test@gmail.com", "first_name":"", "last_name": "Lee"}

    def test_UserListView_GET(self):
        response = client.get("/api/users/")
        serializer = UserSerializer(User.objects.all(), many=True, context={'plain': True})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_UserView_GET_valid_pk(self):
        response = client.get("/api/users/" + str(self.user1.id) +"/")
        serializer = UserSerializer(self.user1, context={'plain':True})
        self.assertEqual(serializer.data, response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_UserView_GET_invalid_pk(self):
        response = client.get("/api/users/10000/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_UserView_POST_valid_payload(self):
        response = client.post("/api/users/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_UserView_POST_invalid_payload(self):
        response = client.post("/api/users/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        response = client.post("/api/users/")
        self.assertEqual(response.data, {"error": 'No data found'})
    
    def test_UserView_POST_same_email(self):
        response = client.post("/api/users/", data={"email": "test3@gmail.com", "first_name":"Daniel", "last_name": "Lee", "password": "password"})
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(response.data, {'error': 'Email already exists'})

    def test_UserView_PATCH_valid_payload(self):
        response = client.patch("/api/users/" + str(self.user1.id) +"/", data=json.dumps(self.valid_payload_patch, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_UserView_PATCH_invalid_payload(self):
        response = client.patch("/api/users/" + str(self.user1.id) +"/", data=json.dumps(self.invalid_payload_patch, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_manager_create_user(self):
        user = User.objects.create_user(email="test4@gmail.com", first_name="daniel", last_name="Lee", avatar=None, password=make_password("password"))
        self.assertEqual(user.email, "test4@gmail.com")

    def test_get_full_name(self):
        user1_full = self.user1.get_full_name()
        user2_full = self.user2.get_full_name()
        self.assertEqual(user1_full, "Daniel Lee")
        self.assertEqual(user2_full, "Daniel Kim")

    def test_is_friend(self):
        self.assertEqual(self.user1.is_friend(self.user2), True)
        self.assertEqual(self.user1.is_friend(self.user3), True)
        self.assertEqual(self.user2.is_friend(self.user3), False)

    def test_get_friends(self):
        friends1 = self.user1.get_friends()
        friends2 = self.user2.get_friends()
        self.assertEqual(len(friends1), 2)
        self.assertEqual([obj.friend.pk for obj in friends1], [self.user2.pk, self.user3.pk])
        self.assertEqual([obj for obj in friends1], [self.friendship12, self.friendship13])
        self.assertEqual(len(friends2), 1)

    def test_get_or_create_friends(self):
        friend12 = self.user1.get_or_create_friend(self.user2)
        self.assertEqual(self.friendship12, friend12)
        isfriend23 = self.user2.is_friend(self.user3)
        self.assertEqual(isfriend23, False)
        self.user2.get_or_create_friend(self.user3)
        isfriend23 = self.user2.is_friend(self.user3)
        self.assertEqual(isfriend23, True)

class UserFriendsTest(TestCase):
    fixtures=('2_categories.json',)

    def setUp(self):
        info = {"password": make_password("password"), "first_name": "Daniel", "last_name": "Lee"}
        dessert = {"name": "Dessert", "ranking": "1"}
        self.user = User.objects.create(email="test@gmail.com", **info)
        self.user2 = User.objects.create(email="test2@gmail.com", **info)
        self.user3 = User.objects.create(email="test3@gmail.com", **info)
        self.dessert = Category.objects.get(api_label="desserts")
        Preference.objects.create(user=self.user, category=self.dessert, **dessert)
        Preference.objects.create(user=self.user2, category=self.dessert, **dessert)
        self.friendship12 = Friendship.objects.create(creator=self.user, friend=self.user2)
        self.friendship13 = Friendship.objects.create(creator=self.user, friend=self.user3)
        client.force_authenticate(user=self.user)

    def test_UserFriendsView_GET(self):
        response = client.get("/api/users/" + str(self.user.id) + "/friends/")
        serializer = FriendshipSerializer(self.user.get_friends(), many=True, context={'user': self.user})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_UserFriendsView_GET_with_category(self):
        response = client.get("/api/users/" + str(self.user.id) +"/friends/", {"category": "desserts"})
        serializer = FriendshipSerializer(self.user.get_friends_by_category(self.dessert), many=True, context={'user': self.user})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_UserFriendsView_POST_valid(self):
        valid_payload = {"email": "test3@gmail.com"}
        client.force_authenticate(user=self.user2)
        response = client.post("/api/users/" + str(self.user2.id) + "/friends/", data=json.dumps(valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_UserFriendsView_POST_invalid(self):
        invalid_payload = {"email": "test4@gmail.com"}
        client.force_authenticate(user=self.user2)
        response = client.post("/api/users/" + str(self.user2.id) + "/friends/", data=json.dumps(invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_UserFriendsView_DELETE_valid(self):
        payload = {"id": self.friendship13.id}
        response = client.delete("/api/users/" + str(self.user.id) + "/friends/", data=json.dumps(payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Friendship.objects.filter(creator=self.user, friend=self.user3).count(), 0)

    def test_get_friends_by_category(self):
        friends_by_category = self.user.get_friends_by_category(self.dessert)
        self.assertEqual(list(friends_by_category), [self.friendship12])

class UserSettingsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.valid_payload = {"radius": 25, "location": "Berkeley", "latitude": 37.871853, "longitude": -122.258423}
        self.settings = UserSettings.objects.create(user=self.user, **self.valid_payload)
        client.force_authenticate(user=self.user)

    def test_UserSettingsView_GET(self):
        response = client.get("/api/users/settings/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, UserSettingsSerializer(self.settings).data)

    def test_UserSettingsView_POST_valid_payload(self):
        response = client.post("/api/users/settings/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, UserSerializerWithToken(self.user, context={"plain": True}).data)

class UserPreferencesTest(TestCase):
    fixtures=('2_categories.json',)

    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.dessert = Category.objects.get(api_label="desserts")
        self.bento = Category.objects.get(api_label="bento")
        self.italian = Category.objects.get(api_label="italian")
        self.preference1 = Preference.objects.create(user=self.user, category=self.dessert, name="dessert", ranking=1)
        self.preference2 = Preference.objects.create(user=self.user, category=self.bento, name="bento", ranking=2)
        client.force_authenticate(user=self.user)

    def test_UserPreferenceListView_GET(self):
        response = client.get("/api/users/" + str(self.user.id) + "/preferences/")
        serializer = PreferenceSerializer(self.user.preferences, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_UserPreferenceListView_POST_valid(self):
        response = client.post("/api/users/" + str(self.user.id) + "/preferences/", data={"category_id": self.italian.id})
        preference = Preference.objects.get(user=self.user, category=self.italian)
        serializer = PreferenceSerializer(preference)
        self.assertEqual(preference.ranking, 3)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_UserPreferenceListView_POST_invalid(self):
        response = client.post("/api/users/" + str(self.user.id) + "/preferences/", data={"category_id": self.dessert.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"error": "Already a preference"})

    def test_UserPreferenceListView_PATCH_valid(self):
        response = client.patch("/api/users/" + str(self.user.id) + "/preferences/", data={"oldRanking": 1, "newRanking": 2})
        self.preference1.refresh_from_db()
        self.preference2.refresh_from_db()
        preferences = Preference.objects.filter(user=self.user).order_by('ranking')
        serializer = PreferenceSerializer(preferences, many=True)
        self.assertEqual(self.preference1.ranking, 2)
        self.assertEqual(self.preference2.ranking, 1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_UserPreferenceListView_PATCH_invalid(self):
        response = client.patch("/api/users/" + str(self.user.id) + "/preferences/", data={"oldRanking": 1, "newRanking": -1})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_UserPreferenceView_PATCH_valid(self):
        response = client.patch("/api/users/" + str(self.user.id) + "/preferences/" + str(self.dessert.id) + "/", {"name": "Best"})
        self.preference1.refresh_from_db()
        serializer = PreferenceSerializer(self.preference1)
        self.assertEqual(self.preference1.name, "Best")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_UserPreferenceView_PATCH_invalid(self):
        response = client.patch("/api/users/" + str(self.user.id) + "/preferences/" + str(self.italian.id) + "/", {"name": "Best"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_UserPreferenceView_DELETE_valid(self):
        response = client.delete("/api/users/" + str(self.user.id) + "/preferences/" + str(self.dessert.id) + "/")
        self.preference2.refresh_from_db()
        serializer = PreferenceSerializer(self.user.preferences, many=True)
        self.assertEqual(self.preference2.ranking, 1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_UserPreferenceView_DELETE_invalid(self):
        response = client.delete("/api/users/" + str(self.user.id) + "/preferences/" + str(self.italian.id) + "/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_reorder_preferences(self):
        preference3 = Preference.objects.create(user=self.user, category=self.italian, name="italian", ranking=3)
        self.preference1.reorder_preferences(3)
        self.preference1.refresh_from_db()
        self.preference2.refresh_from_db()
        preference3.refresh_from_db()
        self.assertEqual(self.preference1.ranking, 3)
        self.assertEqual(self.preference2.ranking, 1)
        self.assertEqual(preference3.ranking, 2)
        self.preference2.reorder_preferences(2)
        self.preference2.refresh_from_db()
        preference3.refresh_from_db()
        self.assertEqual(self.preference2.ranking, 2)
        self.assertEqual(preference3.ranking, 1)

    def test_reorder_preferences_delete(self):
        preference3 = Preference.objects.create(user=self.user, category=self.italian, name="italian", ranking=3)
        self.preference1.reorder_preferences_delete()
        preference3.refresh_from_db()
        self.preference2.refresh_from_db()
        self.assertEqual(preference3.ranking, 2)
        self.assertEqual(self.preference2.ranking, 1)

class NotificationViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user2 = User.objects.create(email="test2@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.friendship12 = Friendship.objects.create(creator=self.user, friend=self.user2)
        client.force_authenticate(user=self.user2)
    
    def test_DELETE_notifications(self):
        notifs = self.user2.notifications.filter(description="friend").unread().count()
        self.assertEqual(notifs, 1)
        valid_payload = {"type": "friend"}
        response = client.delete("/api/notifs/", data=json.dumps(valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user2.notifications.filter(description="friend").unread().count(), 0)