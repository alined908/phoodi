from social.models import Post, Activity, ActivityLike, ActivityComment
from meetup.models import User, Friendship
from social.serializers import ActivitySerializer, ActivityCommentSerializer
from django.test import TestCase
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.test import APIClient
import json

client = APIClient()

class ActivityTest(TestCase):
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

        self.post = Post.objects.create(
            content="hello",
            poster_user=self.user
        )

        self.post2 = Post.objects.create(
            content="bye",
            poster_user=self.user2
        )

        self.friendship = Friendship.objects.create(
            creator=self.user, friend=self.user2
        )

        client.force_authenticate(user=self.user)

    def create_activitycomment(self):
        activity = Activity.objects.last()
        payload = {
            'text': 'Hello',
            'parent': None
        }

        response = client.post(
            '/api/activities/%s/comments/' % activity.id,
            data=json.dumps(payload, default=str),
            content_type="application/json"
        )

        return activity, response

    def test_ActivityFeedView_GET(self):
        response = client.get("/api/activities/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_ActivityCommentView_POST(self):
        activity, response = self.create_activitycomment()
        comment = activity.comments.last()
        serializer = ActivityCommentSerializer(comment)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(serializer.data, response.data)
    
    def test_ActivityCommentView_DELETE(self):
        activity = Activity.objects.last()
        response = client.delete(
            '/api/activities/%s/comments/' % activity.id
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_activitycomment_creates_notification(self):
        self.create_activitycomment()
        notifications = self.user.notifications.filter(verb='commented on', description='activity')
        self.assertEqual(notifications.count(), 1)

    def test_ActivityLikeView_POST(self):
        activity = Activity.objects.last()

        payload = {
            'value': 1,
            'comment_id': None
        }

        response = client.post(
            '/api/activities/%s/likes/' % activity.id,
            data=json.dumps(payload, default=str),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        like = ActivityLike.objects.last()
        self.assertEqual(like.user, self.user)
        self.assertEqual(activity, like.activity)