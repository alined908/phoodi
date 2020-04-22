from meetup.models import Category, User, Meetup, MeetupInvite, MeetupMember, MeetupEvent
from meetup.serializers import MeetupSerializer, MeetupMemberSerializer, MeetupInviteSerializer, MeetupEventSerializer
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist, ValidationError

class MeetupListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
        
    def get(self, request, *args, **kwargs):
        user, categories = request.user, request.GET.get('categories', [])
        coords = [request.GET.get('latitude'), request.GET.get('longitude'), request.GET.get('radius')]

        if request.GET.get('type') == "public":
            meetups = Meetup.get_public(categories, coords, request)
        elif request.GET.get('type') == "private":
            meetups = Meetup.get_private(user, categories)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        meetups_json = {}

        if meetups:
            for meetup in meetups.all():
                serializer = MeetupSerializer(meetup, context={'user': user})
                meetups_json[meetup.uri] = serializer.data

        return Response({"meetups": meetups_json})

    def post(self, request, *args, **kwargs):
        try:
            user, date, name, location = request.user, request.data['date'], request.data['name'], request.data['location']
            public, latitude, longitude = request.data['public'], request.data['latitude'], request.data['longitude']
            meetup = Meetup.objects.create(
                date=date, location=location, name=name, creator=user,
                public=public, latitude=latitude, longitude=longitude
            )
            member = MeetupMember.objects.create(
                user=user, meetup=meetup, admin=True
            )
            return Response({
                'status': 'Success', 
                'meetup': MeetupSerializer(
                    meetup, 
                    context={
                        "user": user
                    }
                ).data, 
                'message': "new meetup created"
            })
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
            start, end, title = request.data['start'], request.data['end'], request.data['title'], 
            distance, price, entries, random = request.data['distance'], request.data['price'], request.data['entries'], request.data['random']
            event = MeetupEvent.objects.create(creator=creator, meetup=meetup, start=start, end=end, title=title, entries=entries, distance=distance, price=price, random=random)
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
            return Response({"error": "Meetup does not exist"},status=status.HTTP_404_NOT_FOUND)

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
            return Response({"error": "Meetup does not exist"},status=status.HTTP_400_BAD_REQUEST)

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
            return Response({"error": "Meetup does not exist"},status=status.HTTP_400_BAD_REQUEST)

        try: 
            user = User.objects.get(email=email)
        except ObjectDoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        try: 
            member = MeetupMember.objects.get(user=user)
        except ObjectDoesNotExist:
            return Response({"error": "Member does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        if member.user == meetup.creator:
            return Response({"error": "Creator cannot leave meetup"}, status=status.HTTP_400_BAD_REQUEST)

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