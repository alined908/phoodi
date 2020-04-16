from meetup.models import Category, User, Meetup, MeetupInvite, MeetupMember, MeetupEvent
from meetup.serializers import MeetupSerializer, MeetupMemberSerializer, MeetupInviteSerializer, MeetupEventSerializer
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db.models.expressions import RawSQL
from django.db.models import Q
from ipware import get_client_ip
import geocoder, datetime

class MeetupListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def format_meetups(self, user, categories):
        if categories:
            category_ids = [int(x) for x in categories.split(',')]
        else:
            category_ids = []

        if not category_ids:
            meetups = Meetup.objects.filter(id__in=RawSQL(
                'SELECT member.meetup_id as id FROM meetup_meetupmember as member WHERE user_id = %s' , (user.id,)
            )).order_by("date")
        else:
            meetups = Meetup.objects.filter(Q(id__in=RawSQL(
                'SELECT DISTINCT category.meetup_id \
                FROM meetup_meetupcategory as category \
                WHERE category_id = ANY(%s)' , (category_ids,))) 
                & 
                Q(id__in=RawSQL(
                    'SELECT member.meetup_id as id \
                    FROM meetup_meetupmember as member \
                    WHERE user_id = %s' , (user.id,)
                ))).order_by("date")

        meetups_json = {}
        for meetup in meetups.all():
            serializer = MeetupSerializer(meetup, context={'user': user})
            meetups_json[meetup.uri] = serializer.data
        return meetups_json

    def format_public_meetups(self, user, categories, coords, request, num_results=25):
        if categories:
            try:
                category_ids = [int(x) for x in categories.split(',')]
            except:
                category = Category.objects.get(api_label=categories)
                category_ids = [category.id]
        else:
            category_ids = []

        client_ip, is_routable = get_client_ip(request)
        
        if client_ip:
            if is_routable:
                geocode = geocoder.ip(client_ip)
                location = geocode.latlng
                lat, lng = location[0], location[1]
            else:
                lat, lng = None, None

        latitude, longitude, radius = coords[0] or lat, coords[1] or lng, coords[2] or 25

        if not latitude or not longitude:
            return {}

        distance_query = RawSQL(
            ' SELECT id FROM \
                (SELECT *, (3959 * acos(cos(radians(%s)) * cos(radians(latitude)) * \
                                        cos(radians(longitude) - radians(%s)) + \
                                        sin(radians(%s)) * sin(radians(latitude)))) \
                    AS distance \
                    FROM meetup_meetup) \
                AS distances \
                WHERE distance < %s AND date >= %s \
                ORDER BY distance \
                OFFSET 0 \
                LIMIT %s' , (latitude, longitude, latitude, radius, datetime.datetime.now().date(), num_results)
        )

        if not category_ids:
            meetups = Meetup.objects.filter(public=True, id__in=distance_query).order_by("date")
        else:
            meetups = Meetup.objects.filter(Q(public=True) & Q(id__in=RawSQL(
                'SELECT DISTINCT category.meetup_id \
                FROM meetup_meetupcategory as category \
                WHERE category_id = ANY(%s)' , (category_ids,)))
                &
                Q(id__in=distance_query)).order_by("date")

        meetups_json = {}
        for meetup in meetups.all():
            serializer = MeetupSerializer(meetup)
            meetups_json[meetup.uri] = serializer.data

        return meetups_json
        
    def get(self, request, *args, **kwargs):
        user = request.user
        if request.GET.get('type') == "public":
            coords = [request.GET.get('latitude'), request.GET.get('longitude'), request.GET.get('radius')]
            meetups = self.format_public_meetups(user, request.GET.get('categories'), coords, request)
        elif request.GET.get('type') == "private":
            meetups = self.format_meetups(user, request.GET.get('categories'))
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        return Response ({"meetups": meetups})

    def post(self, request, *args, **kwargs):
        try:
            user, date, name, location = request.user, request.data['date'], request.data['name'], request.data['location']
            public, latitude, longitude = request.data['public'], request.data['latitude'], request.data['longitude']
            meetup = Meetup.objects.create(date=date, location=location, name=name, public=public, latitude=latitude, longitude=longitude)
            meetup.members.create(user=user, meetup=meetup, admin=True)
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
            start, end, title, distance, price, entries, random = request.data['start'], request.data['end'], request.data['title'], request.data['distance'], request.data['price'], request.data['entries'], request.data['random']
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