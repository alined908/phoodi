from rest_framework import status
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import (Meetup, User, UserSettings, ChatRoom, ChatRoomMember, ChatRoomMessage, MeetupInvite, Category, FriendInvite, 
MeetupMember, Friendship, MeetupEvent, MeetupEventOption, MeetupEventOptionVote, Preference)
from django.utils.timezone import now  
from .serializers import (UserSettingsSerializer, UserSerializerWithToken, PreferenceSerializer, ChatRoomSerializer, ChatRoomMemberSerializer, MessageSerializer, MeetupSerializer, CategorySerializer, 
FriendshipSerializer, FriendInviteSerializer, MeetupInviteSerializer, MeetupEventSerializer, UserSerializer, MeetupMemberSerializer)
from .views import MeetupListView
from django.contrib.auth.hashers import make_password
import datetime, json, jwt
from django.core import mail

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
        pass

    def test_reorder_preferences_delete(self):
        pass

class MeetupTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.meetup1 = Meetup.objects.create(name="meetup-1", date=datetime.date.today(), location="Berkeley", longitude=-118.2351192, latitude=34.228754, public=False)
        self.member = MeetupMember.objects.create(meetup=self.meetup1, user=self.user)
        self.valid_payload = {"name": "Meetup", "location": "Berkeley", "date": datetime.date.today(), "longitude": -118.2351192, "latitude": 34.228754, "public":False}
        self.invalid_payload = {"name": "", "location": "Berkeley", "date": datetime.date.today()}
        client.force_authenticate(user=self.user)

    def test_GET_meetups(self):
        response = client.get("/api/meetups/", {"type": "private", "categories": ""})
        meetups = self.user.meetups
        meetups_json = {}

        for meetup in meetups.all():
            serializer = MeetupSerializer(meetup.meetup)
            meetups_json[meetup.meetup.uri] = serializer.data
        self.assertEqual(response.data['meetups'], meetups_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_POST_meetups_valid_payload(self):
        response = client.post("/api/meetups/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_POST_meetups_invalid_payload(self):
        response = client.post("/api/meetups/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_GET_meetup(self):
        response = client.get("/api/meetups/"  + self.meetup1.uri + "/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        serializer = MeetupSerializer(self.meetup1, context={"user": self.user})
        self.assertEqual(response.data, serializer.data)

    def test_PATCH_meetup_valid_payload(self):
        response = client.patch("/api/meetups/"  + self.meetup1.uri + "/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_PATCH_meetup_invalid_payload(self):
        response = client.patch("/api/meetups/"  + self.meetup1.uri + "/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_DELETE_meetup_valid_pk(self):
        response = client.delete("/api/meetups/"  + self.meetup1.uri + "/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_DELETE_meetup_invalid_pk(self):
        response = client.delete("/api/meetups/"  + "wdwadawdaw" + "/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
    def test_email(self):
        self.meetup1.send_email()
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, '%s has been finalized.' % (self.meetup1.name,))

class MeetupEventTest(TestCase):
    fixtures=('2_categories.json',)

    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user2 = User.objects.create(email="test2@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.meetup = Meetup.objects.create(name="meetup-1", date=datetime.date.today(), location="Berkeley", longitude=-118.2351192, latitude=34.228754, public=True)
        self.member = MeetupMember.objects.create(meetup=self.meetup, user=self.user)
        self.member2 = MeetupMember.objects.create(meetup=self.meetup, user=self.user2)
        self.entries = {"chinese": 1, "italian": 2}
        self.event = MeetupEvent.objects.create(creator=self.member, meetup=self.meetup, title="Event", distance=20000, price="1, 2", start=now().replace(hour=14), entries=self.entries, random=True)
        self.option = self.event.options.first()
        self.valid_payload = {"start": now() , "end": now(), "title": "Hello", "distance": 20000, "prices": "1, 2", "entries": self.entries, "random": True}
        self.invalid_payload = {"start": now() , "end": now(), "title": "", "distance": 20000, "prices": "1, 2", "entries": self.entries}
        client.force_authenticate(user=self.user)

    def test_GET_meetupevents_valid(self):
        response = client.get("/api/meetups/" + self.meetup.uri +"/events/")
        serializer = MeetupEventSerializer(self.meetup.events.all(), many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), len(serializer.data))

    def test_GET_meetupevents_invalid(self):
        response = client.get("/api/meetups/dwadaw/events/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_POST_meetupevent_valid_payload(self):
        response = client.post("/api/meetups/" + self.meetup.uri +"/events/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_POST_meetupevent_invalid_payload(self):
        response = client.post("/api/meetups/" + self.meetup.uri +"/events/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_PATCH_meetupevent_valid_payload(self):
        response = client.patch("/api/meetups/" + self.meetup.uri +"/events/" + str(self.event.id) +"/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_PATCH_meetupevent_invalid_payload(self):
        response = client.patch("/api/meetups/" + self.meetup.uri +"/events/" + str(self.event.id) +"/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_DELETE_meetupevent_valid_payload(self):
        response = client.delete("/api/meetups/" + self.meetup.uri +"/events/" + str(self.event.id) +"/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_DELETE_meetupevent_invalid_payload(self):
        response = client.delete("/api/meetups/" + self.meetup.uri +"/events/" + str(100) +"/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_convert_entries_to_string(self):
        categories = self.event.convert_entries_to_string()
        self.assertEqual(categories, "chinese,italian")

    def test_start_after_end(self):
        pass

    def test_generate_options(self):
        self.assertEqual(self.event.options.count(), 4)

    def test_vote_changes_score(self):
        self.option.handle_vote(member = self.member, status = 1)
        self.assertEqual(self.option.score, 1)
        self.option.handle_vote(member = self.member, status = 2)
        self.assertEqual(self.option.score, -1)
        self.option.handle_vote(member = self.member, status= 3)
        self.assertEqual(self.option.score, 0)

    def test_vote_same_option(self):
        self.option.handle_vote(member = self.member, status = 1)
        self.assertEqual(self.option.score, 1)
        self.option.handle_vote(member = self.member, status = 1)
        self.assertEqual(self.option.score, 0)

    def test_vote_bans_option(self):
        self.option.handle_vote(member = self.member, status = 3)
        self.assertEqual(self.option.banned, True)

    def test_cant_vote_banned_option(self):
        self.option.handle_vote(member = self.member, status = 3)
        self.assertEqual(self.option.banned, True)
        self.option.handle_vote(member = self.member2, status = 1)
        self.assertEqual(self.option.score, 0)

    def test_used_ban_vote_then_ban(self):
        self.option.handle_vote(member = self.member, status = 3)
        self.assertEqual(self.option.banned, True) 
        self.assertEqual(self.member.ban, True)
        event2 = MeetupEvent.objects.create(creator=self.member, meetup=self.meetup, title="Event", distance=20000, price="1, 2", start=now(), entries=self.entries, random=True)
        option2 = event2.options.first()
        option2.handle_vote(member = self.member, status = 1)
        self.assertEqual(option2.score, 1)
        option2.handle_vote(member = self.member, status = 3)
        self.assertEqual(option2.score, 1)
        self.assertEqual(option2.banned, False)

    def test_unban_self_banned_option(self):
        self.option.handle_vote(member = self.member, status = 3)
        self.assertEqual(self.option.banned, True) 
        self.assertEqual(self.member.ban, True)
        self.option.handle_vote(member = self.member, status = 3)
        self.assertEqual(self.option.banned, False) 
        self.assertEqual(self.member.ban, False)

    def test_self_banned_option_different_vote(self):
        self.option.handle_vote(member = self.member, status = 3)
        self.assertEqual(self.option.banned, True) 
        self.assertEqual(self.member.ban, True)
        self.option.handle_vote(member = self.member, status = 1)
        self.assertEqual(self.option.score, 1)
        self.assertEqual(self.option.banned, False) 
        self.assertEqual(self.member.ban, False)

    def test_handle_decide(self):
        self.option.handle_vote(member = self.member, status = 1)
        self.event.handle_decide(False)
        self.assertEqual(self.event.chosen, self.option.id)

    def test_handle_decide_with_ban(self):
        self.option.handle_vote(member = self.member, status = 3)
        self.event.options.all()[1].handle_vote(member=self.member, status = 2)
        self.event.options.all()[2].handle_vote(member=self.member, status = 2)
        self.event.options.all()[3].handle_vote(member=self.member, status = 2)
        self.event.handle_decide(False)
        self.assertNotEqual(self.event.chosen, self.option.id)

    # def test_handle_decide_all_banned(self):
    #     pass

class MeetupMemberTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user2 = User.objects.create(email="test2@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user3 = User.objects.create(email="test3@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.meetup = Meetup.objects.create(name="meetup-1", date=datetime.date.today(), location="Berkeley", longitude=-118.2351192, latitude=34.228754, public=True)
        self.member = MeetupMember.objects.create(meetup=self.meetup, user=self.user)
        self.member = MeetupMember.objects.create(meetup=self.meetup, user=self.user3)
        self.valid_payload = {"email": "test3@gmail.com"}
        self.invalid_payload = {"email": "test4@gmail.com"}
        client.force_authenticate(user=self.user)

    def test_GET_meetupmembers(self):
        response = client.get("/api/meetups/"+self.meetup.uri+"/members/")
        serializer = MeetupMemberSerializer(self.meetup.members.all(), many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_POST_meetupmember_valid_payload(self):
        response = client.post("/api/meetups/" + self.meetup.uri + "/members/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_POST_meetupmember_invalid_payload(self):
        response = client.post("/api/meetups/" + self.meetup.uri + "/members/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_DELETE_meetupmember_valid_payload(self):
        response = client.delete("/api/meetups/" + self.meetup.uri + "/members/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_DELETE_meetupmember_invalid_payload(self):
        response = client.delete("/api/meetups/" + self.meetup.uri + "/members/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class MeetupEmailViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.meetup = Meetup.objects.create(name="meetup-1", date=datetime.date.today(), location="Berkeley", longitude=-118.2351192, latitude=34.228754, public=True)
        self.member = MeetupMember.objects.create(meetup=self.meetup, user=self.user)
        client.force_authenticate(user=self.user)

    def test_POST_meetupemail(self):
        response = client.post("/api/meetups/" + self.meetup.uri + "/email/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, '%s has been finalized.' % (self.meetup.name,))
    
class InviteTest(TestCase):

    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user2 = User.objects.create(email="test2@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.meetup = Meetup.objects.create(name="meetup-1", date=datetime.date.today(), location="Berkeley", longitude=-118.2351192, latitude=34.228754, public=True)
        self.member = MeetupMember.objects.create(meetup=self.meetup, user=self.user)
        self.meetup_invite = MeetupInvite.objects.create(sender = self.user, receiver=self.user2, meetup=self.meetup)
        self.friend_invite = FriendInvite.objects.create(sender=self.user, receiver=self.user2)
        self.valid_payload = {"email": "test2@gmail.com"}
        self.invalid_payload = {"email": "test3@gmail.com"}
        client.force_authenticate(user=self.user)

    def test_GET_meetupinvite_user(self):
        client.force_authenticate(user=self.user2)
        response = client.get("/api/meetups/invite/")
        serializer = MeetupInviteSerializer(self.user2.received_meetupinvites.all(), many=True)
        self.assertEqual(response.data, serializer.data)

    def test_GET_meetupinvite_all_valid(self):
        client.force_authenticate(user=self.user2)
        response = client.get("/api/meetups/" + self.meetup.uri + "/invite/")
        serializer = MeetupInviteSerializer(self.meetup.invs.filter(receiver = self.user2), many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_GET_meetupinvite_all_invalid(self):
        response = client.get("/api/meetups/231321/invite/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_POST_meetupinvite_valid(self):
        response = client.post("/api/meetups/" + self.meetup.uri + "/invite/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_POST_meetupinvite_invalid(self):
        response = client.post("/api/meetups/" + self.meetup.uri + "/invite/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_PATCH_meetupinvite_valid_accept(self):
        client.force_authenticate(user=self.user2)
        valid_patch_payload = {"status": "2"}
        response = client.patch("/api/meetups/" + self.meetup.uri + "/invite/" + self.meetup_invite.uri + "/", data=json.dumps(valid_patch_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['message'], "Successfully accepted meetup invite.")

    def test_PATCH_meetupinvite_valid_reject(self):
        client.force_authenticate(user=self.user2)
        valid_patch_payload = {"status": "3"}
        response = client.patch("/api/meetups/" + self.meetup.uri + "/invite/" + self.meetup_invite.uri + "/", data=json.dumps(valid_patch_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['message'], "Rejected meetup invite.")

    def test_PATCH_meetupinvite_invalid_not_receiver(self):
        invalid_patch_payload = {"status": "2"}
        response = client.patch("/api/meetups/" + self.meetup.uri + "/invite/" + self.meetup_invite.uri + "/", data=json.dumps(invalid_patch_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()['error'], "Not your invite")
        
    def test_GET_friendinvite_valid(self):
        client.force_authenticate(user=self.user2)
        response = client.get("/api/friends/invite/")
        serializer = FriendInviteSerializer(self.user2.received_friendinvites.all(), many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_POST_friendinvite_valid(self):
        response = client.post("/api/friends/invite/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_POST_friendinvite_invalid(self):
        response = client.post("/api/friends/invite/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_PATCH_friendinvite_valid_accept(self):
        client.force_authenticate(user=self.user2)
        valid_patch_payload = {"status": "2"}
        response = client.patch("/api/friends/invite/" + self.friend_invite.uri + "/", data=json.dumps(valid_patch_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['message'], "Successfully accepted friend invite.")

    def test_PATCH_friendinvite_valid_reject(self):
        client.force_authenticate(user=self.user2)
        valid_patch_payload = {"status": "3"}
        response = client.patch("/api/friends/invite/" + self.friend_invite.uri + "/", data=json.dumps(valid_patch_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['message'], "Rejected friend invite.")

    def test_PATCH_friendinvite_invalid_not_receiver(self):
        invalid_patch_payload = {"status": "2"}
        response = client.patch("/api/friends/invite/" + self.friend_invite.uri + "/", data=json.dumps(invalid_patch_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()['error'], "Not your invite")

    # def test_unable_to_inv_self(self):
    #     pass

    def test_on_accept_meetup_inv_create_meetupmember(self):
        invite = self.meetup_invite
        self.assertEqual(invite.status, 1)
        invite.status = 2
        invite.save()
        num_member = MeetupMember.objects.filter(meetup=self.meetup, user=self.user2).count()
        self.assertEqual(num_member, 1)

    def test_on_change_friend_inv_status_create_friendship(self):
        invite = self.friend_invite
        self.assertEqual(invite.status, 1)
        invite.status = 2
        invite.save()
        num_friendship = Friendship.objects.filter(creator = self.user, friend= self.user2).count()
        self.assertEqual(num_friendship, 1)


class CategoryViewTest(TestCase):
    def test_GET_category(self):
        response = client.get("/api/categories/")
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        self.assertEqual(response.json()['categories'], serializer.data)

class ChatTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user2 = User.objects.create(email="test2@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user3 = User.objects.create(email="test3@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.friendship12 = Friendship.objects.create(creator = self.user, friend = self.user2)
        self.room = self.friendship12.chatroom_set.first()
        self.member = self.room.members.first()
        self.valid_payload = {"email": "test3@gmail.com"}
        self.invalid_payload = {"email": "test4@gmail.com"}
        client.force_authenticate(user=self.user)

    def test_GET_chatrooms(self):
        response = client.get("/api/chats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        serializer = ChatRoomSerializer(self.room, context={"user": self.user})
        
    def test_POST_chatrooms(self):
        response = client.post("/api/chats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.rooms.count(), 2)

    def test_PATCH_chatroom_valid(self):
        response = client.patch("/api/chats/" + self.room.uri +"/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.room.members.count(), 3)

    def test_PATCH_chatroom_invalid(self):
        response = client.patch("/api/chats/" + self.room.uri +"/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.room.members.count(), 2)

    def test_GET_chatmessages_valid(self):
        ChatRoomMessage.objects.create(room=self.room, message="Hello", sender=self.user)
        response = client.get("/api/chats/" + self.room.uri + "/messages/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_GET_chatmessages_invalid(self):
        ChatRoomMessage.objects.create(room=self.room, message="Hello", sender=self.user)
        response = client.get("/api/chats/dadadw/messages/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_POST_chatmessages(self):
        valid_payload = {"message": "hello"}
        response = client.post("/api/chats/"+ self.room.uri + "/messages/", data=json.dumps(valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.room.messages.count(), 1)

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

