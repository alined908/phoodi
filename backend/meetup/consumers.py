from channels.generic.websocket import AsyncWebsocketConsumer
from channels.exceptions import DenyConnection
from .models import User, ChatRoom, ChatRoomMessage, ChatRoomMember, MeetupEventOptionVote, Meetup, MeetupEvent, MeetupEventOption
from asgiref.sync import async_to_sync
from django.core.exceptions import ObjectDoesNotExist
import json
import random
import time
import requests
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from meetup.serializers import MessageSerializer, MeetupEventSerializer, MeetupEventOptionSerializer, MeetupEventOptionVoteSerializer
url = "https://api.yelp.com/v3/businesses/search"
headers = {'Authorization': "Bearer U46B4ff8l6NAdldViS7IeS8HJriDeE9Cd5YZXTUmrdzvtv57AUQiYJVVbEPFp30nhL9YAW2-LjAAQ1cBapJ4uqiOYES8tz9EjM85R8ki9l-54Z1d_1OOWLeY5tTuXXYx"}

class ChatConsumer(AsyncWebsocketConsumer):

    async def fetch_messages(self, data):
        print("fetch messages called")
        room = ChatRoom.objects.get(uri=data['uri'])
        content = {'command': 'fetch_messages'}
        if not room:
            content['error'] = "Unable to identify chat room"
        messages = reversed(room.messages.order_by('-timestamp')[:50])
        messages_list = []

        for message in messages:
            messages_list.append(MessageSerializer(message).data)
        content['messages'] = messages_list
        print(content)
        await self.send(text_data = json.dumps(content))

    async def new_message(self, data):
        print("new message")
        sender, msg, room = data['from'], data['text'], data['room']
        room_obj = await database_sync_to_async(ChatRoom.objects.get)(uri=room)
        user_obj = await database_sync_to_async(User.objects.get)(pk=sender)
        message = await database_sync_to_async(ChatRoomMessage.objects.create)(room = room_obj, message=msg, sender=user_obj)
        content = {
            'command': 'new_message',
            'message': MessageSerializer(message).data
        }

        await self.channel_layer.group_send(
            self.room_group_name, {
                'type': 'chat_message',
                'message': content
            }
        )

    commands = {
        'fetch_messages' : fetch_messages,
        'new_message' : new_message
    }

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        print("chat consumer receive command")
        # Receive message from WebSocket
        json_data = json.loads(text_data)
        await self.commands[json_data['command']](self, json_data)

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        print(message)
        await self.send(text_data=json.dumps(message))

class UserNotificationConsumer(AsyncWebsocketConsumer):

    #User sends invite to someone 
    
    async def connect(self):
        self.user = self.scope['url_route']['kwargs']['user_id']
        self.user_room_name = "notif_room_for_user_%s" % self.user
        
        await self.channel_layer.group_add(
            self.user_room_name, 
            self.channel_name
        )

    async def disconnect(self):
        await self.channel_layer.group_discard(
            self.user_room_name,
            self.channel_name
        )

    def notification(self, event):
        message = event['message']
        self.send(text_data=json.dumps(message))

class MeetupConsumer(AsyncWebsocketConsumer):
    #Events, Votes 

    async def connect(self):
        self.meetup_name = self.scope['url_route']['kwargs']['room_name']
        self.meetup_group_name = 'meetup_%s' % self.meetup_name

        await self.channel_layer.group_add(
            self.meetup_group_name,
            self.channel_name
        )

        try:
            self.meetup =  await database_sync_to_async(Meetup.objects.get)(uri=self.meetup_name)
        except ObjectDoesNotExist:
            raise DenyConnection("Invalid Meetup URI")

        await self.accept()

    @sync_to_async
    def get_event_serializer(self, event):
        event.generate_options()
        return MeetupEventSerializer(event).data

    async def new_event(self, command):
        data = command['data']
        print("new event function called")
        meetup, title, location, start, end, entries = data['uri'], data['title'], data['location'], data['start'], data['end'], data['entries']
        meetup_obj = await database_sync_to_async(Meetup.objects.get)(uri=meetup)
        event = await database_sync_to_async(MeetupEvent.objects.create)(meetup = meetup_obj, title=title, location=location, start=start, end=end, entries=entries)
        serializer = await self.get_event_serializer(event)


        content = {
            'command': 'new_event',
            'message': {'meetup': data['uri'], 'event': {event.id: serializer}}
        }

        await self.channel_layer.group_send(
            self.meetup_group_name, {
                'type': 'meetup_event',
                'meetup_event': content
            }
        )
    @sync_to_async
    def handle_event_reload(self, event):
        event.options.all().delete()

    async def reload_event(self, command):
        data = command['data']
        event_id, meetup = data['event'], data['meetup']
        event = await database_sync_to_async(MeetupEvent.objects.get)(pk=event_id)
        await self.handle_event_reload(event)
        serializer = await self.get_event_serializer(event)

        content = {
            'command': 'reload_event',
            'message': {'meetup': meetup, 'event_id': event_id, 'event': serializer}
        }

        await self.channel_layer.group_send(
            self.meetup_group_name, {
                'type': 'meetup_event',
                'meetup_event': content
            }
        )
    
    @sync_to_async
    def handle_vote_event(self, option, status, user):
        conversion = {1: 1, 2: -1, 3:0}
        option = MeetupEventOption.objects.get(pk = option)
        event = option.event.id
        user = User.objects.get(pk=user)
        past_status = 0

        try: 
            obj = MeetupEventOptionVote.objects.get(option = option, user = user)
            past_status = obj.status
            obj.delete()
            option.score -= conversion[past_status]
        except ObjectDoesNotExist:
            pass

        if past_status != status:
            MeetupEventOptionVote.objects.create(option=option, user=user, status=status)
            option.score += conversion[status]
        
        option.save()
        serializer = MeetupEventOptionSerializer(option)
        return serializer.data, event

    async def vote_event(self, command):
        data = command['data']
        user, option, status, meetup = data['user'], data['option'], data['status'], data['meetup']
        option_json, event = await self.handle_vote_event(option, status, user)

        content = {
            'command': 'vote_event',
            'message': {"meetup": meetup, "event": event, "option_id": option, "option": option_json[option]}
        }

        await self.channel_layer.group_send(
            self.meetup_group_name, {
                'type': 'meetup_event',
                'meetup_event': content
            }
        )        

    async def fetch_events(self, data):
        pass

    @sync_to_async
    def decide_event_helper(self, event, randomBool):
        """
        Randomly choose or select highest count
        If score tie: 
        1. select one with higher num likes
        2. Lower number of dislikes
        3. Random selection)
        """
        event = MeetupEvent.objects.get(pk=event)
        options = event.options.all()
        
        if randomBool:
            chosen = random.choice(options)
        else: 
            highest = []
            maxScore = 0

            for option in options:
                if option.score > maxScore:
                    maxScore = option.score
                    highest = [option]
                elif option.score == maxScore:
                    highest.append(option)


            chosen = random.choice(highest)

        event.chosen = chosen.id
        event.save()

        return event.id, MeetupEventSerializer(event).data

    async def decide_event(self, command):
        data = command['data']
        meetup, event, random = data['meetup'] , data['event'], data['random']
        event_id, event = await self.decide_event_helper(event, random)

        content = {
            'command': 'decide_event',
            'message': {"meetup": meetup, "event_id": event_id, "event": event}
        }

        await self.channel_layer.group_send(
            self.meetup_group_name, {
                'type': 'meetup_event',
                'meetup_event': content
            }
        )

    @sync_to_async
    def redecide_helper(self, event):
        event = MeetupEvent.objects.get(pk=event)
        event.chosen = None
        event.save()
        return event.id, MeetupEventSerializer(event).data

    async def redecide_event(self, command):
        data = command['data']
        meetup, event = data['meetup'], data['event']
        event_id, event = await self.redecide_helper(event)

        content = {
                'command': 'redecide_event',
                'message': {"meetup": meetup, "event_id": event_id, "event": event}
            }

        await self.channel_layer.group_send(
            self.meetup_group_name, {
                'type': 'meetup_event',
                'meetup_event': content
            }
        )

    @sync_to_async
    def delete_helper(self, event_id):
        event = MeetupEvent.objects.get(pk=event_id)
        event.delete()

    async def delete_event(self, command):
        data = command['data']
        meetup, event_id = data['uri'], data['event']
        await self.delete_helper(event_id)

        content = {
                'command': 'delete_event',
                'message': {"uri": meetup, "event": event_id}
            }

        await self.channel_layer.group_send(
            self.meetup_group_name, {
                'type': 'meetup_event',
                'meetup_event': content
            }
        )


    commands = {
        'fetch_events': fetch_events,
        'new_event': new_event, #check
        'reload_event': reload_event, #check
        'delete_event': delete_event, #check
        'vote_event': vote_event, #check
        'decide_event': decide_event, #check
        'redecide_event': redecide_event #check
    }

    async def receive(self, text_data):
        json_data = json.loads(text_data)
        print("Meetup Consumer: " + json_data['command'])
        await self.commands[json_data['command']](self, json_data)

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.meetup_group_name,
            self.channel_name
        )

    async def meetup_event(self, event):
        print("Meetup Consumer: Meetup Event Object sent")
        meetup_event = event['meetup_event']
        await self.send(text_data=json.dumps(meetup_event))
