from rest_framework import status
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import Meetup, User, MeetupInvite, FriendInvite, MeetupMember, Friendship, MeetupEvent, MeetupEventOption, MeetupEventOptionVote
from django.utils.timezone import now  
from .serializers import MeetupSerializer, UserSerializer
from .views import MeetupListView
from django.contrib.auth.hashers import make_password
import datetime, json
from django.core import mail

client = APIClient()

class AuthTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", last_name="Lee" , password=make_password("password"), first_name="Daniel")
        self.payload = {"email": "test@gmail.com", "password": "password"}

    def test_generate_token(self):
        response = client.post("/api/token-auth/", self.payload)
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
        self.valid_payload = {"email": "test4@gmail.com", "first_name":"Daniel", "last_name": "Lee", "password": "password"}
        self.invalid_payload = {"email": "test5@gmail.com", "first_name":"", "last_name": "Lee", "password": "password"}
        self.valid_payload_patch = {"email": "test@gmail.com", "first_name":"Dan", "last_name": "Lee"}
        self.invalid_payload_patch = {"email": "test@gmail.com", "first_name":"", "last_name": "Lee"}

    def test_GET_user_valid_pk(self):
        response = client.get("/api/users/" + str(self.user1.id) +"/")
        serializer = UserSerializer(self.user1, context={'plain':True})
        self.assertEqual(serializer.data, response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_GET_user_invalid_pk(self):
        response = client.get("/api/users/" + "100" +"/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_PATCH_user_valid_payload(self):
        response = client.patch("/api/users/" + str(self.user1.id) +"/", data=json.dumps(self.valid_payload_patch, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_PATCH_user_invalid_payload(self):
        response = client.patch("/api/users/" + str(self.user1.id) +"/", data=json.dumps(self.invalid_payload_patch, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_POST_user_valid_payload(self):
        response = client.post("/api/users/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_POST_user_invalid_payload(self):
        response = client.post("/api/users/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

    def test_user_manager_create_user(self):
        user = User.objects.create_user(email="test4@gmail.com", first_name="daniel", last_name="Lee", avatar=None, password=make_password("password"))
        self.assertEqual(user.email, "test4@gmail.com")

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
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.meetup1 = Meetup.objects.create(name="meetup-1", date=datetime.date.today(), location="Berkeley")
        self.member = MeetupMember.objects.create(meetup=self.meetup1, user=self.user)
        self.valid_payload = {"name": "Meetup", "location": "Berkeley", "date": datetime.date.today()}
        self.invalid_payload = {"name": "", "location": "Berkeley", "date": datetime.date.today()}
        client.force_authenticate(user=self.user)

    def test_GET_meetups(self):
        response = client.get("/api/meetups/")
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
    fixtures=('categories.json',)

    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user2 = User.objects.create(email="test2@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.meetup = Meetup.objects.create(name="Meetup", date=datetime.date.today(), location="Berkeley")
        self.member = MeetupMember.objects.create(meetup=self.meetup, user=self.user)
        self.member2 = MeetupMember.objects.create(meetup=self.meetup, user=self.user2)
        self.entries = {"chinese": 1, "italian": 2}
        self.event = MeetupEvent.objects.create(creator=self.member, meetup=self.meetup, title="Event", distance=20000, price="1, 2", start=now(), entries=self.entries)
        self.option = self.event.options.first()

    def test_GET_meetupevents(self):
        pass

    def test_POST_meetupevent_valid_payload(self):
        pass

    def test_POST_meetupevent_invalid_payload(self):
        pass

    def test_PATCH_meetupevent_valid_payload(self):
        pass

    def test_PATCH_meetupevent_invalid_payload(self):
        pass

    def test_DELETE_meetupevent_valid_payload(self):
        pass

    def test_DELETE_meetupevent_invalid_payload(self):
        pass

    def test_convert_entries_to_string(self):
        categories = self.event.convert_entries_to_string()
        self.assertEqual(categories, "chinese, italian")

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
        event2 = MeetupEvent.objects.create(creator=self.member, meetup=self.meetup, title="Event", distance=20000, price="1, 2", start=now(), entries=self.entries)
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
        pass

    def test_GET_meetupmembers(self):
        pass

    def test_POST_meetupmember_valid_payload(self):
        pass

    def test_POST_meetupmember_invalid_payload(self):
        pass

    def test_DELETE_meetupmember_valid_payload(self):
        pass

    def test_DELETE_meetupmember_invalid_payload(self):
        pass

class MeetupEmailViewTest(TestCase):
    def setUp(self):
        pass

    def test_POST_meetupemail(self):
        pass

class MeetupInviteViewTest(TestCase):
    def setUp(self):
        pass
    
    def test_GET_meetupinvite(self):
        pass

class FriendInviteViewTest(TestCase):
    def setUp(self):
        pass

    def test_GET_friendinvite(self):
        pass

class CategoryViewTest(TestCase):
    def setUp(self):
        pass

    def test_GET_category(self):
        pass

class FriendsViewTest(TestCase):
    def setUp(self):
        pass

    def test_GET_friends(self):
        pass

    def test_POST_friends(self):
        pass

    def test_DELETE_friends(self):
        pass

class ChatViewTest(TestCase):
    def setUp(self):
        pass

    def test_GET_chatrooms(self):
        pass
    
    def test_POST_chatrooms(self):
        pass

    def test_PATCH_chatroom(self):
        pass

    def test_GET_chatmessages(self):
        pass

    def test_POST_chatmessages(self):
        pass

class NotificationViewTest(TestCase):
    def setUp(self):
        pass



class InviteTest(TestCase):

    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user2 = User.objects.create(email="test2@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.meetup = Meetup.objects.create(name="Meetup", date=datetime.date.today(), location="Berkeley")
        self.member = MeetupMember.objects.create(meetup=self.meetup, user=self.user)

    # def test_unable_to_inv_self(self):
    #     pass

    def test_on_accept_meetup_inv_create_meetupmember(self):
        invite = MeetupInvite.objects.create(sender = self.user, receiver=self.user2, meetup=self.meetup)
        self.assertEqual(invite.status, 1)
        invite.status = 2
        invite.save()
        num_member = MeetupMember.objects.filter(meetup=self.meetup, user=self.user2).count()
        self.assertEqual(num_member, 1)

    def test_on_change_friend_inv_status_create_friendship(self):
        invite = FriendInvite.objects.create(sender=self.user, receiver=self.user2)
        self.assertEqual(invite.status, 1)
        invite.status = 2
        invite.save()
        num_friendship = Friendship.objects.filter(creator = self.user, friend= self.user2).count()
        self.assertEqual(num_friendship, 1)

class ChatTest(TestCase):
    pass

