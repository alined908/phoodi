from meetup.models import User, Friendship, ChatRoom, ChatRoomMember, ChatRoomMessage
from meetup.serializers import ChatRoomSerializer, ChatRoomMemberSerializer, MessageSerializer
from django.test import TestCase
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.test import APIClient
import json

client = APIClient()

class ChatTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user2 = User.objects.create(email="test2@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.user3 = User.objects.create(email="test3@gmail.com", password=make_password("password"), first_name="Daniel", last_name="Lee")
        self.friendship12 = Friendship.objects.create(creator = self.user, friend = self.user2)
        self.room = self.friendship12.chatroom_set.first()
        self.member = self.room.members.first()
        self.valid_payload = {"email": "test3@gmail.com"}
        self.invalid_payload = {"email": "test4@gmail.com"}
        client.force_authenticate(user=self.user)

    def test_GET_chatrooms(self):
        response = client.get("/api/chats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        serializer = ChatRoomSerializer(self.room, context={"user": self.user})
        
    def test_POST_chatrooms(self):
        response = client.post("/api/chats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.rooms.count(), 2)

    def test_PATCH_chatroom_valid(self):
        response = client.patch("/api/chats/" + self.room.uri +"/", data=json.dumps(self.valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.room.members.count(), 3)

    def test_PATCH_chatroom_invalid(self):
        response = client.patch("/api/chats/" + self.room.uri +"/", data=json.dumps(self.invalid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.room.members.count(), 2)

    def test_GET_chatmessages_valid(self):
        ChatRoomMessage.objects.create(room=self.room, message="Hello", sender=self.user)
        response = client.get("/api/chats/" + self.room.uri + "/messages/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_GET_chatmessages_invalid(self):
        ChatRoomMessage.objects.create(room=self.room, message="Hello", sender=self.user)
        response = client.get("/api/chats/dadadw/messages/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_POST_chatmessages(self):
        valid_payload = {"message": "hello"}
        response = client.post("/api/chats/"+ self.room.uri + "/messages/", data=json.dumps(valid_payload, default=str), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.room.messages.count(), 1)