from meetup.models import (
    Meetup,
    User,
    MeetupInvite,
    FriendInvite,
    MeetupMember,
    Friendship,
)
from notifications.models import Notification
from meetup.serializers import FriendInviteSerializer, MeetupInviteSerializer
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.hashers import make_password
from django.test import TestCase
import datetime, json

client = APIClient()


class InviteTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            email="test@gmail.com",
            password=make_password("password"),
            first_name="Daniel",
            last_name="Lee",
        )
        self.user2 = User.objects.create(
            email="test2@gmail.com",
            password=make_password("password"),
            first_name="Daniel",
            last_name="Lee",
        )
        self.meetup = Meetup.objects.create(
            name="meetup-1",
            date=datetime.date.today(),
            location="Berkeley",
            longitude=-118.2351192,
            latitude=34.228754,
            public=True,
            creator=self.user
        )
        self.member = MeetupMember.objects.create(meetup=self.meetup, user=self.user)
        self.meetup_invite = MeetupInvite.objects.create(
            sender=self.user, receiver=self.user2, meetup=self.meetup
        )
        self.friend_invite = FriendInvite.objects.create(
            sender=self.user, receiver=self.user2
        )
        self.valid_payload = {"email": "test2@gmail.com"}
        self.invalid_payload = {"email": "test3@gmail.com"}
        client.force_authenticate(user=self.user)

    def test_GET_meetupinvite_user(self):
        client.force_authenticate(user=self.user2)
        response = client.get("/api/meetups/invite/")
        serializer = MeetupInviteSerializer(
            self.user2.received_meetupinvites.all(), many=True
        )
        self.assertEqual(response.data, serializer.data)

    def test_GET_meetupinvite_all_valid(self):
        client.force_authenticate(user=self.user2)
        response = client.get("/api/meetups/" + self.meetup.uri + "/invite/")
        serializer = MeetupInviteSerializer(
            self.meetup.invs.filter(receiver=self.user2), many=True
        )
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_GET_meetupinvite_all_invalid(self):
        response = client.get("/api/meetups/231321/invite/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_POST_meetupinvite_valid(self):
        response = client.post(
            "/api/meetups/" + self.meetup.uri + "/invite/",
            data=json.dumps(self.valid_payload, default=str),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_POST_meetupinvite_invalid(self):
        response = client.post(
            "/api/meetups/" + self.meetup.uri + "/invite/",
            data=json.dumps(self.invalid_payload, default=str),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_PATCH_meetupinvite_valid_accept(self):
        client.force_authenticate(user=self.user2)
        valid_patch_payload = {"status": "2"}
        response = client.patch(
            "/api/meetups/"
            + self.meetup.uri
            + "/invite/"
            + self.meetup_invite.uri
            + "/",
            data=json.dumps(valid_patch_payload, default=str),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json()["message"], "Successfully accepted meetup invite."
        )

    def test_PATCH_meetupinvite_valid_reject(self):
        client.force_authenticate(user=self.user2)
        valid_patch_payload = {"status": "3"}
        response = client.patch(
            "/api/meetups/"
            + self.meetup.uri
            + "/invite/"
            + self.meetup_invite.uri
            + "/",
            data=json.dumps(valid_patch_payload, default=str),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["message"], "Rejected meetup invite.")

    def test_PATCH_meetupinvite_invalid_not_receiver(self):
        invalid_patch_payload = {"status": "2"}
        response = client.patch(
            "/api/meetups/"
            + self.meetup.uri
            + "/invite/"
            + self.meetup_invite.uri
            + "/",
            data=json.dumps(invalid_patch_payload, default=str),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()["error"], "Not your invite")

    def test_MeetupInvite_create_push_notification(self):
        client.post(
            "/api/meetups/" + self.meetup.uri + "/invite/",
            data=json.dumps(self.valid_payload, default=str),
            content_type="application/json",
        )
        notifications = self.user2.notifications.filter(description='meetup_inv')
        self.assertEqual(notifications.count(), 1)

    def test_GET_friendinvite_valid(self):
        client.force_authenticate(user=self.user2)
        response = client.get("/api/friends/invite/")
        serializer = FriendInviteSerializer(
            self.user2.received_friendinvites.all(), many=True
        )
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_POST_friendinvite_valid(self):
        response = client.post(
            "/api/friends/invite/",
            data=json.dumps(self.valid_payload, default=str),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_POST_friendinvite_invalid(self):
        response = client.post(
            "/api/friends/invite/",
            data=json.dumps(self.invalid_payload, default=str),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_PATCH_friendinvite_valid_accept(self):
        client.force_authenticate(user=self.user2)
        valid_patch_payload = {"status": "2"}
        response = client.patch(
            "/api/friends/invite/" + self.friend_invite.uri + "/",
            data=json.dumps(valid_patch_payload, default=str),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json()["message"], "Successfully accepted friend invite."
        )

    def test_PATCH_friendinvite_valid_reject(self):
        client.force_authenticate(user=self.user2)
        valid_patch_payload = {"status": "3"}
        response = client.patch(
            "/api/friends/invite/" + self.friend_invite.uri + "/",
            data=json.dumps(valid_patch_payload, default=str),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["message"], "Rejected friend invite.")

    def test_PATCH_friendinvite_invalid_not_receiver(self):
        invalid_patch_payload = {"status": "2"}
        response = client.patch(
            "/api/friends/invite/" + self.friend_invite.uri + "/",
            data=json.dumps(invalid_patch_payload, default=str),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()["error"], "Not your invite")

    def test_FriendInvite_create_push_notification(self):
        client.post(
            "/api/friends/invite/",
            data=json.dumps(self.valid_payload, default=str),
            content_type="application/json",
        )
        notifications = self.user2.notifications.filter(description="friend_inv")
        self.assertEqual(notifications.count(), 1)

    # def test_unable_to_inv_self(self):
    #     pass

    def test_on_accept_meetup_inv_create_meetupmember(self):
        invite = self.meetup_invite
        self.assertEqual(invite.status, 1)
        invite.status = 2
        invite.save()
        num_member = MeetupMember.objects.filter(
            meetup=self.meetup, user=self.user2
        ).count()
        self.assertEqual(num_member, 1)

    def test_on_change_friend_inv_status_create_friendship(self):
        invite = self.friend_invite
        self.assertEqual(invite.status, 1)
        invite.status = 2
        invite.save()
        num_friendship = Friendship.objects.filter(
            creator=self.user, friend=self.user2
        ).count()
        self.assertEqual(num_friendship, 1)
