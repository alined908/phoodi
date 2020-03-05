from rest_framework import status
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import Meetup, User, MeetupMember, Friendship, MeetupEvent, MeetupEventOption, MeetupEventOptionVote
from django.utils.timezone import now  
from .serializers import MeetupSerializer
from .views import MeetupListView
from django.contrib.auth.hashers import make_password
import datetime
import json

client = APIClient()

class AuthTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel")

    def test_generate_token(self):
        response = client.post("/api/token-auth/", {"email": "test@gmail.com", "password": "password"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        obj = json.loads(json.dumps(response.data))
        self.assertEqual(self.user.email, obj["user"]["1"]["email"])   

class UserTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user2 = User.objects.create(email="test2@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Kim")
        self.user3 = User.objects.create(email="test3@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Park")
        self.friendship12 = Friendship.objects.create(creator=self.user1, friend=self.user2)
        self.friendship13 = Friendship.objects.create(creator=self.user1, friend=self.user3)

    def test_duplicate_email_not_allowed(self):
        pass

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

class MeetupTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel")
        meetup1 = Meetup.objects.create(name="meetup-1", date=datetime.date.today(), location="Berkeley")
        MeetupMember.objects.create(meetup=meetup1, user=self.user)

    def test_get_all_meetups(self):
        client.force_authenticate(user=self.user)
        response = client.get("/api/meetups/")
        meetups = self.user.meetups
        meetups_json = {}
    
        for meetup in meetups.all():
            serializer = MeetupSerializer(meetup.meetup)
            meetups_json[meetup.meetup.uri] = serializer.data
        self.assertEqual(response.data['meetups'], meetups_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class MeetupEventTest(TestCase):
    fixtures=('categories.json',)

    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel")
        self.user2 = User.objects.create(email="test2@gmail.com", password=make_password("password"), first_name="Daniel")
        self.meetup = Meetup.objects.create(name="Meetup", date=datetime.date.today(), location="Berkeley")
        self.member = MeetupMember.objects.create(meetup=self.meetup, user=self.user)
        self.member2 = MeetupMember.objects.create(meetup=self.meetup, user=self.user2)
        self.entries = {"chinese": 1, "italian": 2}
        self.event = MeetupEvent.objects.create(creator=self.member, meetup=self.meetup, title="Event", distance=20000, price="1, 2", start=now(), entries=self.entries)
        self.option = self.event.options.first()

    def test_convert_entries_to_string(self):
        categories = self.event.convert_entries_to_string()
        self.assertEqual(categories, "chinese, italian")

    def test_generate_options(self):
        self.assertEqual(self.event.options.count(), 4)

    def test_vote_changes_score(self):
        self.option.handle_vote(user = self.user, status = 1)
        self.assertEqual(self.option.score, 1)
        self.option.handle_vote(user = self.user, status = 2)
        self.assertEqual(self.option.score, -1)

    def test_vote_same_option(self):
        self.option.handle_vote(user = self.user, status = 1)
        self.assertEqual(self.option.score, 1)
        self.option.handle_vote(user = self.user, status = 1)
        self.assertEqual(self.option.score, 0)

    def test_vote_bans_option(self):
        self.option.handle_vote(user = self.user, status = 3)
        self.assertEqual(self.option.banned, True)

    def test_cant_vote_banned_option(self):
        self.option.handle_vote(user = self.user, status = 3)
        self.assertEqual(self.option.banned, True)
        self.option.handle_vote(user = self.user2, status = 1)
        self.assertEqual(self.option.score, 0)

class InviteTest(TestCase):
    
    def test_unable_to_inv_self(self):
        pass
    def test_change_meetup_inv_status(self):
        pass
    def test_change_friend_inv_status(self):
        pass
class ChatTest(TestCase):
    pass

