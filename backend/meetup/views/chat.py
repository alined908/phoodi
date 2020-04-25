from meetup.models import User, ChatRoom, ChatRoomMember, ChatRoomMessage
from meetup.serializers import UserSerializer, MessageSerializer, ChatRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist, ValidationError

class ChatRoomListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get user chat rooms
        """
        user = request.user
        chat_rooms = user.get_chat_rooms()
        rooms = {}
    
        for room in chat_rooms.all():
            serializer = ChatRoomSerializer(room, context={'user': user})
            rooms[room.uri] = serializer.data

        return Response ({"rooms": rooms})

    def post(self, request):
        """
        Create chat room
        """
        user = request.user
        chat_room = ChatRoom.objects.create()
        chat_room.members.create(user=user, room = chat_room)

        return Response({'status': 'Success', 'uri': chat_room.uri, 'message': 'New chat sessions created'})

class ChatRoomView(APIView):

    def patch(self, request, *args, **kwargs):
        """
        Add user to chat room
        """
        uri = kwargs['uri']
        email = request.data['email']
        user = get_object_or_404(User, email=email)
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
        chat_room, more = get_object_or_404(ChatRoom, uri=uri), True

        if request.GET.get('last', False):
            messages = ChatRoomMessage.objects.raw('SELECT * FROM meetup_chatroommessage AS c WHERE c.room_id=%s AND c.id<%s ORDER BY c.id DESC LIMIT 50', [chat_room.id, request.GET.get('last')])
        else:
            messages = ChatRoomMessage.objects.raw('SELECT * FROM meetup_chatroommessage AS c WHERE c.room_id=%s ORDER BY c.id DESC LIMIT 50', [chat_room.id])
     
        if messages:
            first_message = ChatRoomMessage.objects.filter(room=chat_room).first() 
            if len(messages) < 50 or first_message.id == messages[-1].id:
                more = False

        serializer = MessageSerializer(reversed(messages), many=True)
        return Response({"messages":serializer.data, "more": more})

    def post(self, request, *args, **kwargs):
        uri = kwargs['uri']
        content = request.data['message']
        user = request.user
        chat_room = get_object_or_404(ChatRoom, uri=uri)

        message = ChatRoomMessage.objects.create(
            sender = user, room = chat_room, message = content
        )
        return Response({
            'status': 'Success', 'uri': uri, 'message': MessageSerializer(message).data, 'user': UserSerializer(user).data 
        })
