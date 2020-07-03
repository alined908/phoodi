from social.models import Follow, Activity, Notification
from meetup.models import User
from social.serializers import FollowSerializer
from django.test import TestCase
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.test import APIClient
import json

client = APIClient()

class FollowTest(TestCase):
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

        self.follow = Follow.objects.create(
            follower = self.user,
            followee = self.user2
        )

        client.force_authenticate(user=self.user)

    def test_FollowListView_GET(self):
        response = client.get("/api/follows/")
        follows = self.user.follows.all()
        serializer = FollowSerializer(follows, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_FollowListView_POST(self):
        client.force_authenticate(user=self.user2)
        payload = {
            'user': self.user.id,
        }

        response = client.post(
            '/api/follows/',
            data=json.dumps(payload, default=str),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_FollowView_DELETE(self):
        follow = Follow.objects.last()
        response = client.delete(
            '/api/follows/%s/' % follow.id
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_Follow_creates_activity(self):
        follow = Follow.objects.last()
        activity = Activity.objects.last()
        self.assertEqual(follow.follower, activity.actor)
        self.assertEqual(follow.followee, activity.action_object)

    def test_Follow_creates_notification(self):
        follow = Follow.objects.last()
        notification = Notification.objects.last()
        self.assertEqual(self.user2, notification.recipient)
        self.assertEqual(self.user, notification.actor)