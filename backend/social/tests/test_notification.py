from social.models import Notification, Follow
from meetup.models import User
from social.serializers import NotificationSerializer
from django.test import TestCase
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.test import APIClient

client = APIClient()

class NotificationTest(TestCase):
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

        self.notification = Notification.objects.last()

        client.force_authenticate(user=self.user)

    def test_NotificationListView(self):
        response = client.get("/api/notifications/")
        notifications = self.user.notifications.all()
        serializer = NotificationSerializer(notifications, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_mark_all_as_read(self):
        client.force_authenticate(user=self.user2)
        response = client.get("/api/notifications/mark-all-as-read/")
        self.notification.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.notification.is_unread, False)

    def test_mark_as_read(self):
        client.force_authenticate(user=self.user2)
        response = client.get("/api/notifications/mark-as-read/%s/" % self.notification.id)
        self.notification.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.notification.is_unread, False)

    