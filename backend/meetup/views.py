from django.shortcuts import render, get_object_or_404
from django.contrib import messages
from meetup.models import User, ChatRoom, ChatRoomMember, ChatRoomMessage
from django.urls import reverse
from django.db import IntegrityError
from rest_framework.decorators import api_view
from django.http import HttpResponse, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from meetup.serializers import UserSerializer, UserSerializerWithToken, MessageSerializer, FriendsSerializer, FriendshipSerializer, ChatRoomSerializer

@api_view(['GET'])
def current_user(request):
    """
    GET information of user with Authentication of JWT token
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class CreateUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self,request):
        """ Handles POST Request for User Signups

        Params: 
            request (JSON): Request object submitted by user

        Returns: 
            Response: JSON containing appropriate status code and message
        """
        user = request.data['user']

        if not user:
            return Response({"error": 'No data found'})
        
        serializer = UserSerializerWithToken(data = user)
        if serializer.is_valid():
            try:
                serializer.save()
            except IntegrityError:
                return Response({"error": 'Email already exists'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        else:
            return Response({"error" : serializer.errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        return Response({"success" : "user created succesfully", "user": serializer.data})

class UserFriendsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        User adds another user as a friend
        """
        user = request.user
        print(user)
        emails = request.data['friends']
        print(emails)

        friends = []
        for email in emails:
            friend = User.objects.get(email=email)
            print(friend)
            print(friend.id)
            entity = user.friends.get_or_create(friend=friend, creator=user)
            print(entity)
            serializer = FriendshipSerializer(entity[0])
            print(serializer.data)
            friends.append(serializer.data)

        print(friends)
        return Response({"success": "friend successfully added", "friends": friends})


    def get(self, request):
        """
        Get users friends
        """
        user = request.user
        serializer = FriendsSerializer(user)

        return Response({"success": "friends list retrieved", "friends": serializer.data})

class ChatRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get user chat rooms
        """
        user = request.user
        chat_rooms = user.rooms
        rooms = {}
    
        for room in chat_rooms.all():
            serializer = ChatRoomSerializer(room.room)
            rooms[room.room.uri] = serializer.data

        return Response ({"rooms": rooms})

    def post(self, request):
        """
        Create chat room
        """
        user = request.user
        chat_room = ChatRoom.objects.create()
        chat_room.members.create(user=user, room = chat_room)

        return Response({'status': 'Success', 'uri': chat_room.uri, 'message': 'New chat sessions created'})

    def patch(self, request, *args, **kwargs):
        """
        Add user to chat room
        """
        uri = kwargs['uri']
        email = request.data['email']
        user = User.objects.get(email=email)
        chat_room = ChatRoom.objects.get(uri=uri)

        chat_room.members.get_or_create(
            user=user, room=chat_room
        )
    
        members = [UserSerializer(member.user).data for member in chat_room.members.all()]

        return Response({
            'status': 'SUCCESS', 'members': members, 'uri': uri,
            'message': '%s joined chat' % user.email
        })

class ChatRoomMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        uri = kwargs['uri']
        chat_room = ChatRoom.objects.get(uri=uri)
        messages = []

        for msg in reversed(chat_room.messages.order_by('-timestamp')[:50]):
            message = MessageSerializer(msg).data
            messages.append({'message': message})

        return Response({
            'id': chat_room.id, 'uri': chat_room.uri,
            'messages': messages
        })

    def post(self, request, *args, **kwargs):
        uri = kwargs['uri']
        content = request.data['message']
        user = request.user
        chat_room = ChatRoom.objects.get(uri=uri)

        message = ChatRoomMessage.objects.create(
            sender = user, room = chat_room, message = content
        )
        return Response({
            'status': 'Success', 'uri': uri, 'message': MessageSerializer(message).data, 'user': UserSerializer(user).data 
        })