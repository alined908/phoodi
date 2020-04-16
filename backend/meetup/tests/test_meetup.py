from meetup.models import User, Meetup, MeetupMember, MeetupEvent, MeetupEventOption, MeetupEventOptionVote
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