from rest_framework import status
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import Meetup, User, MeetupMember
from django.utils.timezone import now  
from .serializers import MeetupSerializer
from .views import MeetupListView
from django.contrib.auth.hashers import make_password
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
        
class MeetupTest(TestCase):

    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel")
        meetup1 = Meetup.objects.create(name="meetup-1", datetime=now(), location="Berkeley")
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