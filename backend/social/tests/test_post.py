from social.models import Post, Activity
from meetup.models import User
from social.serializers import PostSerializer, ActivitySerializer
from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.test import APIClient
import json

client = APIClient()

class PostTest(TestCase):
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

        client.force_authenticate(user=self.user)

    def test_PostListView_GET(self):
        response = client.get("/api/posts/")
        posts = self.user.posts.all()
        serializer = PostSerializer(posts, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_PostListView_POST(self):
        payload = {
            'content': 'Hello',
        }

        response = client.post(
            '/api/posts/',
            data=json.dumps(payload, default=str),
            content_type="application/json"
        )
        post = Post.objects.last()
        self.assertEqual(post.content, payload['content'])
        activity = Activity.objects.get(action_object_object_id=post.id, action_object_content_type=ContentType.objects.get_for_model(post))
        serializer = ActivitySerializer(activity)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(serializer.data, response.data)
    
    def test_PostView_DELETE(self):
        post = Post.objects.last()
        response = client.delete(
            '/api/posts/%s/' % post.id
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_Post_creates_activity(self):
       
        last_post = Post.objects.last()
        last_activity = Activity.objects.last()
        self.assertEqual(last_post.poster, last_activity.actor)
        self.assertEqual(last_post, last_activity.action_object)