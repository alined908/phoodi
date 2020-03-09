from channels.generic.websocket import AsyncWebsocketConsumer
from channels.exceptions import DenyConnection
from .models import User, ChatRoom, ChatRoomMessage, MeetupMember,ChatRoomMember, MeetupEventOptionVote, Meetup, MeetupEvent, MeetupEventOption
from django.core.exceptions import ObjectDoesNotExist
import json, random, time, requests
from urllib.parse import parse_qs
from asgiref.sync import sync_to_async, async_to_sync
from .serializers import CustomJWTSerializer
from channels.db import database_sync_to_async
from meetup.serializers import MessageSerializer, MeetupEventSerializer, MeetupMemberSerializer, MeetupEventOptionSerializer, MeetupEventOptionVoteSerializer
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

        if self.scope['user'].id:
            pass
        else:
            try:
                token = parse_qs(self.scope["query_string"].decode("utf8"))["token"][0]
                print(token)
                data = {'token': token}
                valid_data = CustomJWTSerializer().validate(data)
                print(valid_data)
                user = valid_data['user']
                print("hello")
                print(user)
            except:
                print("errorrrr")
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
        # Receive message from WebSocket
        print("ChatConsumer received message from websocket")
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
        await self.channel_layer.group_add(self.user_room_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.user_room_name,self.channel_name)

    @sync_to_async 
    def fetch_chat_notifs(self, user):
        user_obj = User.objects.get(pk=user)
        chat_notifs = user_obj.notifications.filter(description="chat_message").unread().count()
        return chat_notifs

    @sync_to_async
    def fetch_inv_notifs(self, user):
        user_obj = User.objects.get(pk=user)
        friend_inv_notifs = user_obj.notifications.filter(description="friend_invite").unread().count()
        meetup_inv_notifs = user_obj.notifications.filter(description="meetup_invite").unread().count()
        return friend_inv_notifs, meetup_inv_notifs

    @sync_to_async
    def fetch_meetup_notifs(self, user):
        user_obj = User.objects.get(pk=user)
        meetup_notifs = user_obj.notifications.filter(description="meetup").unread().count()
        return meetup_notifs

    @sync_to_async
    def fetch_friend_notifs(self, user):
        user_obj = User.objects.get(pk=user)
        friend_notifs = user_obj.notifications.filter(description="friend").unread().count()
        return friend_notifs

    async def fetch_notifications(self, command):
        data = command['data']
        user = data['user']
        chat_notifs = await self.fetch_chat_notifs(user)
        friend_inv_notifs, meetup_inv_notifs = await self.fetch_inv_notifs(user)
        meetup_notifs = await self.fetch_meetup_notifs(user)
        friend_notifs = await self.fetch_friend_notifs(user)
        content = {
            'command': 'fetch_notifs',
            'message': {
                            "chat_message": chat_notifs, 
                            "friend_inv": friend_inv_notifs, 
                            "meetup_inv": meetup_inv_notifs,
                            "meetup": meetup_notifs,
                            "friend": friend_notifs
                        }
        }

        await self.channel_layer.group_send(
            self.user_room_name, {
                'type': 'notifications',
                'message': content
            }
        )

    commands = {
        'fetch_notifications': fetch_notifications,
    }

    async def receive(self, text_data):
        print("chat consumer receive")
        if not self.scope['user']:
            self.close()
        else:
            json_data = json.loads(text_data)
            await self.commands[json_data['command']](self, json_data)


    async def notifications(self, event):
        print("notification consumer")
        message = event['message']
        print(event)
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
            print("INVALID")
            raise DenyConnection("Invalid Meetup URI")

        await self.accept()

    @sync_to_async
    def get_event_serializer(self, event):
        event.generate_options()
        return MeetupEventSerializer(event).data

    async def new_event(self, command):
        data = command['data']
        print("new event function called")
        meetup, title, location, start, end, entries, prices, distance = data['uri'], data['title'], data['location'], data['start'], data['end'], data['entries'], data['prices'], data['distance']
        meetup_obj = await database_sync_to_async(Meetup.objects.get)(uri=meetup)
        event = await database_sync_to_async(MeetupEvent.objects.create)(meetup = meetup_obj, title=title, location=location, start=start, end=end, entries=entries, distance=distance, price=prices)
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
        for option in event.options.all():
            votes = option.event_votes
            for vote in votes.all():
                if vote.status == 3:
                    vote.member.ban = False
                    vote.member.save()
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
    def handle_vote_event(self, option, status, user, meetup):
        option = MeetupEventOption.objects.get(id = option)
        event = option.event.id
        meetup = Meetup.objects.get(uri=meetup)
        member = MeetupMember.objects.get(meetup=meetup, user=user)
        option.handle_vote(status, member)
        event_serializer = MeetupEventOptionSerializer(option)
        member_serializer = MeetupMemberSerializer(member)
        print(member_serializer.data)
        return event_serializer.data, event, member_serializer.data

    async def vote_event(self, command):
        data = command['data']
        user, option, status, meetup = data['user'], data['option'], data['status'], data['meetup']
        option_json, event, member = await self.handle_vote_event(option, status, user, meetup)

        content = {
            'command': 'vote_event',
            'message': {"meetup": meetup, "event": event, "option_id": option, "option": option_json[option], "member": member}
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
        event = MeetupEvent.objects.get(pk=event)
        event.handle_decide(randomBool)
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
        for option in event.options.all():
            votes = option.event_votes
            for vote in votes.all():
                if vote.status == 3:
                    vote.member.ban = False
                    vote.member.save()
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
