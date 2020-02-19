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

        categories = ""
        
        for i, key in enumerate(event.entries): 
            if i == len(event.entries) - 1:
                categories += key
            else:
                categories += key + ", "

        params = {"location": event.location , "limit": 30, "categories": categories}
        r = requests.get(url=url, params=params, headers=headers)
        options = r.json()['businesses']
        random.shuffle(options)
        
        for option in options[:4]:
            MeetupEventOption.objects.create(event=event, option=json.dumps(option))

    async def reload_event(self, command):
        data = command['data']
        event_id, meetup = data['event'], data['meetup']
        event = await database_sync_to_async(MeetupEvent.objects.get)(pk=event_id)
        await self.handle_event_reload(event)
        serializer = await self.get_event_serializer(event)

        content = {
            'command': 'reload_event',
            'message': {'meetup': data['meetup'], 'event': {event.id: serializer}}
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

    async def delete_event(self, data):
        pass
        

    async def fetch_events(self, data):
        pass

    @sync_to_async
    def decide_event_helper(self, event, random):
        event = MeetupEvent.objects.get(pk=event)
        options = event.options.all()
        
        """
        Randomly choose or select highest count
        If score tie: 
        1. select one with higher num likes
        2. Lower number of dislikes
        3. Random selection)
        """
        if random:
            chosen = random.choice(options)
        else: 
            for option in options:
                pass
                
        return chosen

    async def decide_event(self, data):
        data = command['data']
        meetup, event, random = data['meetup'] , data['event'], data['random']

        chosen = await decide_event_helper(event, random)

        await self.channel_layer.group_send(
            self.meetup_group_name, {
                'type': 'meetup_event',
                'meetup_event': content
            }
        )

    
    commands = {
        'fetch_events': fetch_events,
        'new_event': new_event,
        'reload_event': reload_event,
        'delete_event': delete_event,
        'vote_event': vote_event,
        'decide_event': decide_event
    }

    async def receive(self, text_data):
        print("meetup consumer received command")
        json_data = json.loads(text_data)
        await self.commands[json_data['command']](self, json_data)

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.meetup_group_name,
            self.channel_name
        )

    async def meetup_event(self, event):
        print("meetup_event function ")
        meetup_event = event['meetup_event']
        await self.send(text_data=json.dumps(meetup_event))