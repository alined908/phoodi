from django.shortcuts import render, get_object_or_404
from django.contrib import messages
from meetup.models import Preference, MeetupCategory, Category, User, ChatRoom, ChatRoomMember, ChatRoomMessage, Meetup, Friendship, MeetupInvite, MeetupMember, FriendInvite, MeetupEvent
from django.db import IntegrityError
from rest_framework.decorators import api_view
from django.http import HttpResponse, HttpResponseRedirect
from rest_framework.views import APIView
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models.expressions import RawSQL
from django.db.models import Q
from random import shuffle
import collections
from django.forms.models import model_to_dict
from meetup.serializers import PreferenceSerializer, CategorySerializer, UserSerializer, UserSerializerWithToken, MessageSerializer, FriendshipSerializer, ChatRoomSerializer, MeetupSerializer, MeetupMemberSerializer, MeetupInviteSerializer, FriendInviteSerializer, MeetupEventSerializer

@api_view(['GET'])
def current_user(request):
    """
    GET information of user with Authentication of JWT token
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class UserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        users = User.objects.all()
        
        serializer = UserSerializer(users, many=True, context={'plain': True})
        return Response(serializer.data)

    def post(self,request):
        """ Handles POST Request for User Signups

        Params: 
            request (JSON): Request object submitted by user

        Returns: 
            Response: JSON containing appropriate status code and message
        """
        user = request.data

        if not user:
            return Response({"error": 'No data found'})
        
        serializer = UserSerializerWithToken(data = user)
        if serializer.is_valid():
            try:
                user = serializer.save()
            except IntegrityError:
                return Response({"error": 'Email already exists'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        else:
            return Response({"error" : serializer.errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        return Response({"token": user.get_token(), "user": serializer.data})

class UserView(APIView):
    permission_classes = [permissions.AllowAny]

    def get_object(self, pk):
        user = get_object_or_404(User, pk=pk)
        return user

    def get(self, request, *args, **kwargs):
        user = self.get_object(kwargs['id'])
        serializer = UserSerializer(user, context={'plain': True})
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        user = self.get_object(kwargs['id'])
        serializer = UserSerializer(user, data=request.data, partial=True, context={'plain': True})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(status=status.HTTP_400_BAD_REQUEST)

class UserFriendsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get users friends
        """
        pk = kwargs['id']
        user = User.objects.get(pk=pk)
        serializer = FriendshipSerializer(user.get_friends(), many=True, context={'user': user})

        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """
        User adds another user as a friend
        """
        user = request.user
        email = request.data['email']

        try: 
            friend = User.objects.get(email=email.strip())
        except ObjectDoesNotExist:
            return Response({"error": "Email does not exist"},status=status.HTTP_404_NOT_FOUND)
        entity = user.get_or_create_friend(friend)
        serializer = FriendshipSerializer(entity, context={'user': user})
        
        return Response({"friend": serializer.data})

    def delete(self, request, *args, **kwargs):
        """
        Delete friend
        """
        pk = request.data["id"]
        friendship = get_object_or_404(Friendship, pk=pk)
        friendship.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class UserPreferenceListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        pk = kwargs['id']
        user = User.objects.get(pk=pk)
        preferences = Preference.objects.filter(user=user)
        serializer = PreferenceSerializer(preferences, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        user = request.user
        category_id = request.data['category_id']
        category = Category.objects.get(pk=category_id)
        pref_count = user.preferences.all().count()
        preference = Preference.objects.create(user=user, category=category, name=category.label, ranking=(pref_count + 1))
        serializer = PreferenceSerializer(preference)
        return Response(serializer.data)

class UserPreferenceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        pass

    def delete(self, request, *args, **kwargs):
        user = request.user
        pref_pk = kwargs['pref_id']

        preference = Preference.objects.get(pk=pref_pk)
        preference.delete()
        preferences = user.preferences.all()
        serializer = PreferenceSerializer(preferences, many=True)
        return Response(serializer.data)

class MeetupListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def format_meetups(self, user):
        meetups = Meetup.objects.filter(id__in=RawSQL(
            'SELECT member.meetup_id as id FROM meetup_meetupmember as member WHERE user_id = %s' , (user.id,)
        )).order_by("date")

        meetups_json = {}
        
        for meetup in meetups.all():
            serializer = MeetupSerializer(meetup, context={'user': user})
            meetups_json[meetup.uri] = serializer.data

        return meetups_json
        
    def get(self, request, *args, **kwargs):
        user = request.user
        meetups_json = self.format_meetups(user)
        return Response ({"meetups": meetups_json})

    def post(self, request, *args, **kwargs):
        try:
            user, date, name, location = request.user, request.data['date'], request.data['name'], request.data['location']
            meetup = Meetup.objects.create(date=date, location=location, name=name)
            meetup.members.create(user=user, meetup=meetup)
            return Response({'status': 'Success', 'meetup': MeetupSerializer(meetup, context={"user": user}).data, 'message': "new meetup created"})
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class MeetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, uri):
        obj = get_object_or_404(Meetup, uri=uri)
        return obj

    def get(self, request, *args, **kwargs):
        user = request.user
        meetup = self.get_object(kwargs['uri'])
        serializer = MeetupSerializer(meetup, context={"user": user})
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        meetup = self.get_object(kwargs['uri'])
        serializer = MeetupSerializer(meetup, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        meetup = self.get_object(kwargs['uri'])
        meetup.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class MeetupEventsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def format_events(self, events):
        events_json = {}

        for event in events.all():
            serializer = MeetupEventSerializer(event)
            events_json[event.id] = serializer.data
        return events_json

    def get(self, request, *args, **kwargs):
        uri = kwargs['uri']
        meetup = get_object_or_404(Meetup, uri=uri)
        events = meetup.events
        events_json = self.format_events(events)
        
        return Response(events_json)

    def post(self, request, *args, **kwargs):
        user = request.user
        uri = kwargs['uri']
        meetup = get_object_or_404(Meetup, uri=uri)
        creator = get_object_or_404(MeetupMember, meetup=meetup, user=user)
        try:
            start, end, title, distance, price, entries = request.data['start'], request.data['end'], request.data['title'], request.data['distance'], request.data['price'], request.data['entries']
            event = MeetupEvent.objects.create(creator=creator, meetup=meetup, start=start, end=end, title=title, entries=entries, distance=distance, price=price)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        serializer = MeetupEventSerializer(event)
        return Response({'meetup': uri, 'event': {event.id: serializer.data}})

class MeetupEventsView(APIView):
    permissions=[permissions.IsAuthenticated]

    def get_object(self, pk):
        event = get_object_or_404(MeetupEvent, pk=pk)
        return event

    def patch(self, request, *args, **kwargs):
        event = self.get_object(kwargs['id'])
        serializer = MeetupEventSerializer(event, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, *args, **kwargs):
        try:
            event = MeetupEvent.objects.get(pk=kwargs['id'])
            event.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class MeetupMembersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get all members of meetup
        """
        uri = kwargs['uri']

        try: 
            meetup = Meetup.objects.get(uri=uri)
        except ObjectDoesNotExist:
            return Response({"error": "Room does not exist"},status=status.HTTP_400_BAD_REQUEST)

        serializer = MeetupMemberSerializer(meetup.members.all(), many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """
        Add member to meetup
        """
        email = request.data['email']
        uri = kwargs['uri']

        try: 
            meetup = Meetup.objects.get(uri=uri)
        except ObjectDoesNotExist:
            return Response({"error": "Room does not exist"},status=status.HTTP_400_BAD_REQUEST)

        try: 
            member = User.objects.get(email=email)
        except ObjectDoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        meetup.members.get_or_create(meetup=meetup, user= member)

        return Response(MeetupSerializer(meetup).data)

    def delete(self, request, *args, **kwargs):
        uri = kwargs['uri']
        email = request.data['email']

        try: 
            meetup = Meetup.objects.get(uri=uri)
        except ObjectDoesNotExist:
            return Response({"error": "Room does not exist"},status=status.HTTP_400_BAD_REQUEST)

        try: 
            user = User.objects.get(email=email)
        except ObjectDoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        try: 
            member = MeetupMember.objects.get(user=user)
        except ObjectDoesNotExist:
            return Response({"error": "Member does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        member.delete()
        serializer = MeetupMemberSerializer(meetup.members.all(), many=True)
        return Response(serializer.data)

class MeetupEmailView(APIView):
    permissions=[permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user=request.user
        uri = kwargs['uri']
        meetup = get_object_or_404(Meetup, uri=uri)
        meetup.send_email()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MeetupInviteAllView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get all invites for user
        """
        user = request.user
        invites = user.received_meetupinvites.filter(status=1).all()
        return Response(MeetupInviteSerializer(invites, many=True).data)

class MeetupInviteListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get all invites from meetup
        """
        user = request.user
        uri = kwargs['uri']

        try: 
            meetup = Meetup.objects.get(uri=uri)
        except ObjectDoesNotExist:
            return Response({"error": "Room does not exist"},status=status.HTTP_400_BAD_REQUEST)

        invites = meetup.invs.filter(receiver=user)

        return Response(MeetupInviteSerializer(invites, many=True).data)

    def post(self, request, *args, **kwargs):
        """
        Create/Send Invite
        """
        user = request.user
        recepient = request.data['email']
        uri = kwargs['uri']

        try: 
            meetup = Meetup.objects.get(uri=uri)
        except ObjectDoesNotExist:
            return Response({"error": "Room does not exist"},status=status.HTTP_404_NOT_FOUND)

        try: 
            invite = User.objects.get(email=recepient)
        except ObjectDoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)

        invite, created = MeetupInvite.objects.get_or_create(meetup=meetup, sender=user, receiver=invite)

        if created:
            return Response({"message": "Invite for meetup sent to " + recepient})
        else:
            return Response({"message": "Invite already sent out to " + recepient})

class MeetupInviteView(APIView):

    def patch(self, request, *args, **kwargs):
        """
        Change status of invite
        """
        user = request.user
        room_uri = kwargs['uri']
        invite_uri = kwargs['invite_code']
        num = request.data['status']
        
        try: 
            meetup = Meetup.objects.get(uri=room_uri)
        except ObjectDoesNotExist:
            return Response({"error": "Room does not exist"},status=status.HTTP_400_BAD_REQUEST)

        try:
            invite = MeetupInvite.objects.get(meetup=meetup, uri=invite_uri)
        except ObjectDoesNotExist:
            return Response({"error": "Invite does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        if user != invite.receiver:
            return Response({"error": "Not your invite"}, status=status.HTTP_400_BAD_REQUEST)

        invite.status = int(num)
        invite.save()

        message = ""
        if invite.status == 2:
            message = "Successfully accepted meetup invite."
        elif invite.status == 3:
            message = "Rejected meetup invite."
        return Response({"message": message, "invite": MeetupInviteSerializer(invite).data})

class FriendInviteListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get Friend Request Invites
        """
        user = request.user
        received_invs = user.received_friendinvites.filter(status=1).all()
        serializer = FriendInviteSerializer(received_invs, many=True)

        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """
        Send Friend Request 
        """
        user = request.user
        recepient = request.data['email']

        #Check User exists
        try: 
            invitee = User.objects.get(email=recepient)
        except ObjectDoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        #Check if already friends
        friendship = user.is_friend(invitee)
        if friendship:
            return Response({"message": "You are already friends with %s" % recepient})

        invite, created = FriendInvite.objects.get_or_create(sender=user, receiver=invitee)
        serializer = FriendInviteSerializer(invite)

        #Check status of invite
        if created:
            return Response({"message": "Invite sent to " + recepient, "invite": serializer.data})
        else:
            return Response({"message": "Invite to " + recepient + " has been sent.", "invite": serializer.data})
        

class FriendInviteView(APIView):

    def patch(self, request, *args, **kwargs):
        user = request.user
        uri = kwargs['invite_code']
        num = request.data['status']

        try:
            invite = FriendInvite.objects.get(uri=uri)
        except ObjectDoesNotExist:
            return Response({"error": "Invite does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        if user != invite.receiver:
            return Response({"error": "Not your invite"}, status=status.HTTP_400_BAD_REQUEST)
        
        invite.status = int(num)
        invite.save()
        serializer = FriendInviteSerializer(invite)

        message = ""
        if invite.status == 2:
            message = "Successfully accepted friend invite."
        elif invite.status == 3:
            message = "Rejected friend invite."

        return Response({"message": message, "invite": serializer.data})

class CategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response({"categories": serializer.data})

class ChatRoomListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get user chat rooms
        """
        user = request.user
        chat_rooms = user.rooms
        rooms = {}
    
        for room in chat_rooms.all():
            serializer = ChatRoomSerializer(room.room, context={'user': user})
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
        chat_room = get_object_or_404(ChatRoom, uri=uri)
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
        chat_room = get_object_or_404(ChatRoom, uri=uri)

        message = ChatRoomMessage.objects.create(
            sender = user, room = chat_room, message = content
        )
        return Response({
            'status': 'Success', 'uri': uri, 'message': MessageSerializer(message).data, 'user': UserSerializer(user).data 
        })

class NotificationView(APIView):
    permission_classes = []

    def delete(self, request, *args, **kwargs):
        user = request.user
        description = request.data['type']
        if 'id' in request.data:
            id = request.data['id']
            user.notifications.filter(actor_object_id = id, description=description).mark_all_as_read()
        else:
            user.notifications.filter(description=description).mark_all_as_read()
        count = user.notifications.filter(description=description).unread().count()
        return Response({description: count})