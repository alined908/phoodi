from channels.generic.websocket import AsyncWebsocketConsumer
from .models import User, ChatRoom, ChatRoomMessage, ChatRoomMember
from asgiref.sync import async_to_sync
import json
from channels.db import database_sync_to_async
from meetup.serializers import MessageSerializer

class ChatConsumer(AsyncWebsocketConsumer):

    async def init_chat(self, data):
        print("init chat called")
        email = data['email']
        user = User.objects.get(email = email)
        content = {
            'command' : 'init_chat'
        }
        if not user:
            content['error'] = "Unable to get user with email: " + email
        content['success'] = 'Chat beginning with user: ' + email
        await self.send(text_data=json.dumps(content))

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
        'init_chat' : init_chat,
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
        # Receive message from WebSocket
        json_data = json.loads(text_data)
        await self.commands[json_data['command']](self, json_data)

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        print(message)
        await self.send(text_data=json.dumps(message))