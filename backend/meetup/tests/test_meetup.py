from meetup.models import User, Category, Meetup, MeetupMember, MeetupEvent, MeetupEventOption, MeetupEventOptionVote
from meetup.serializers import UserSerializer, MeetupSerializer, MeetupEventSerializer,  MeetupMemberSerializer
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.hashers import make_password
from django.core import mail
from django.test import TestCase
from django.utils.timezone import now
import datetime, json, jwt

client = APIClient()

class MeetupTest(TestCase):
    fixtures=('2_categories.json',)

    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        meetup_info = {"name": "meetup-1", "date": datetime.date.today(), "location": "La Crescenta", "longitude": -118.2351192, "latitude": 34.228754, "creator": self.user}
        self.private = Meetup.objects.create(public=False, **meetup_info)
        self.public = Meetup.objects.create(public=True, **meetup_info)
        self.valid_payload = {"public": False, **meetup_info}
        self.member = MeetupMember.objects.create(meetup=self.private, user=self.user)
        self.invalid_payload = {"name": "", "location": "Berkeley", "date": datetime.date.today()}
        client.force_authenticate(user=self.user)

    def test_MeetupListView_GET_private_meetups(self):
        response = client.get("/api/meetups/", {"type": "private"})
        meetups = self.user.meetups
        meetups_json = {}

        for meetup in meetups.all():
            serializer = MeetupSerializer(meetup.meetup)
            meetups_json[meetup.meetup.uri] = serializer.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['meetups'], meetups_json)

    def test_MeetupListView_GET_private_meetups_with_categories(self):
        dessert = Category.objects.get(api_label="desserts")
        bento = Category.objects.get(api_label="bento")
        self.event = MeetupEvent.objects.create(creator=self.member, meetup=self.private, title="Event", distance=20000, price="1, 2", start=now().replace(hour=14), entries={"desserts": True}, random=True)
        response = client.get("/api/meetups/", {"type": "private", "categories": str(dessert.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['meetups']), 1)
        response = client.get("/api/meetups/", {"type": "private", "categories": str(bento.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['meetups']), 0)

    def test_MeetupListView_GET_public_meetups(self):
        response = client.get("/api/meetups/", {"type": "public", 'latitude': 34.228754, "longitude": -118.2351192})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['meetups']), 1)
        response = client.get("/api/meetups/", {"type": "public", 'latitude': 37.871853, "longitude": -122.258423})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['meetups']), 0)

    def test_MeetupListView_GET_public_meetups_with_categories(self):
        dessert = Category.objects.get(api_label="desserts")
        bento = Category.objects.get(api_label="bento")
        self.event = MeetupEvent.objects.create(creator=self.member, meetup=self.public, title="Event", distance=20000, price="1, 2", start=now().replace(hour=14), entries={"desserts": True}, random=True)
        response = client.get("/api/meetups/", {"type": "public", 'categories': str(dessert.id), 'latitude': 34.228754, "longitude": -118.2351192})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['meetups']), 1)
        response = client.get("/api/meetups/", {"type": "public", 'categories': str(bento.id), 'latitude': 34.228754, "longitude": -118.2351192})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['meetups']), 0)

    def test_MeetupListView_GET_public_meetups_with_api_label(self):
        dessert = Category.objects.get(api_label="desserts")
        bento = Category.objects.get(api_label="bento")
        self.event = MeetupEvent.objects.create(creator=self.member, meetup=self.public, title="Event", distance=20000, price="1, 2", start=now().replace(hour=14), entries={"desserts": True}, random=True)
        response = client.get("/api/meetups/", {"type": "public", 'categories': "desserts", 'latitude': 34.228754, "longitude": -118.2351192})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['meetups']), 1)
        response = client.get("/api/meetups/", {"type": "public", 'categories': "bento", 'latitude': 34.228754, "longitude": -118.2351192})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['meetups']), 0)

    def test_MeetupListView_GET_invalid(self):
        response = client.get("/api/meetups/", {"type": "other"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_MeetupListView_POST_valid(self):
        response = client.post("/api/meetups/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_MeetupListView_POST_invalid(self):
        response = client.post("/api/meetups/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_MeetupView_GET_valid(self):
        response = client.get("/api/meetups/"  + self.private.uri + "/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        serializer = MeetupSerializer(self.private, context={"user": self.user})
        self.assertEqual(response.data, serializer.data)

    def test_MeetupView_GET_invalid(self):
        response = client.get("/api/meetups/"  + "gibberish" + "/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_MeetupView_PATCH_valid(self):
        response = client.patch("/api/meetups/"  + self.private.uri + "/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_MeetupView_PATCH_invalid(self):
        response = client.patch("/api/meetups/"  + self.private.uri + "/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_MeetupView_DELETE_valid(self):
        response = client.delete("/api/meetups/"  + self.private.uri + "/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_MeetupView_DELETE_invalid(self):
        response = client.delete("/api/meetups/"  + "wdwadawdaw" + "/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
    def test_email(self):
        self.private.send_email()
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, '%s has been finalized.' % (self.private.name,))

    def test_get_public_meetups_no_categories(self):
        meetups = Meetup.get_public([], [34.228754, -118.2351192, 25], None)
        self.assertEqual(meetups.count(), 1)
        self.assertEqual(meetups.first(), self.public)

    def test_get_private_meetups_no_categories(self):
        meetups = Meetup.get_private(self.user, [])
        self.assertEqual(meetups.count(), 1)
        self.assertEqual(meetups.first(), self.private)

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
        self.valid_payload = {"start": now() , "end": now(), "title": "Hello", "distance": 20000, "price": "1, 2", "entries": self.entries, "random": True}
        self.invalid_payload = {"start": now() , "end": now(), "title": "", "distance": 20000, "price": "1, 2", "entries": self.entries}
        client.force_authenticate(user=self.user)

    def test_MeetupEventsListView_GET_valid(self):
        response = client.get("/api/meetups/" + self.meetup.uri +"/events/")
        serializer = MeetupEventSerializer(self.meetup.events.all(), many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), len(serializer.data))

    def test_MeetupsEventsListView_GET_invalid(self):
        response = client.get("/api/meetups/dwadaw/events/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_MeetupsEventListView_POST_valid(self):
        response = client.post("/api/meetups/" + self.meetup.uri +"/events/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_MeetupsEventListView_POST_invalid(self):
        response = client.post("/api/meetups/" + self.meetup.uri +"/events/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_MeetupEventsView_PATCH_valid(self):
        response = client.patch("/api/meetups/" + self.meetup.uri +"/events/" + str(self.event.id) +"/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_MeetupEventsView_PATCH_invalid(self):
        response = client.patch("/api/meetups/" + self.meetup.uri +"/events/" + str(self.event.id) +"/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_MeetupEventsView_DELETE_valid(self):
        response = client.delete("/api/meetups/" + self.meetup.uri +"/events/" + str(self.event.id) +"/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_MeetupEventsView_DELETE_invalid(self):
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

    def test_handle_decide_all_banned(self):
        pass

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

    def test_MeetupMembersView_GET_valid(self):
        response = client.get("/api/meetups/"+self.meetup.uri+"/members/")
        serializer = MeetupMemberSerializer(self.meetup.members.all(), many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_MeetupMembersView_GET_invalid(self):
        response = client.get("/api/meetups/"+"gibberish"+"/members/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data, {"error": "Meetup does not exist"})

    def test_MeetupMembersView_POST_valid(self):
        response = client.post("/api/meetups/" + self.meetup.uri + "/members/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_MeetupMembersView_POST_invalid_payload(self):
        response = client.post("/api/meetups/" + self.meetup.uri + "/members/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"error": "User does not exist"})

    def test_MeetupMembersView_POST_invalid_meetup(self):
        response = client.post("/api/meetups/"+"gibberish"+"/members/", {"email": "daniel@gmail.com"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"error": "Meetup does not exist"})

    def test_MeetupMembersView_DELETE_valid(self):
        response = client.delete("/api/meetups/" + self.meetup.uri + "/members/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_MeetupMembersView_DELETE_invalid_meetup(self):
        response = client.delete("/api/meetups/"+"gibberish"+"/members/", {"email": "test@gmail.com"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"error": "Meetup does not exist"})
    
    def test_MeetupMembersView_DELETE_invalid_member(self):
        response = client.delete("/api/meetups/"+self.meetup.uri+"/members/", {"email": self.user2.email})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"error": "Member does not exist"})

    def test_MeetupMembersView_DELETE_invalid_user(self):
        response = client.delete("/api/meetups/" + self.meetup.uri + "/members/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"error": "User does not exist"})

class MeetupEmailViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.meetup = Meetup.objects.create(name="meetup-1", date=datetime.date.today(), location="Berkeley", longitude=-118.2351192, latitude=34.228754, public=True)
        self.member = MeetupMember.objects.create(meetup=self.meetup, user=self.user)
        client.force_authenticate(user=self.user)

    def test_MeetupEmailView_POST_valid(self):
        response = client.post("/api/meetups/" + self.meetup.uri + "/email/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, '%s has been finalized.' % (self.meetup.name,))