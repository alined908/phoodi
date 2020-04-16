from channels.testing import WebsocketCommunicator
from meetup.consumers import ChatConsumer, UserNotificationConsumer, MeetupConsumer
from backend.routing import application
from meetup.serializers import MessageSerializer, MeetupEventSerializer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.test import Client
from django.contrib.auth.hashers import make_password
from meetup.models import ChatRoom, User, ChatRoomMessage, Meetup, MeetupMember
from django.utils.timezone import now
import datetime, json, pytest

TEST_CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

@database_sync_to_async
def create_room():
    room = ChatRoom.objects.create()
    return room
    
@database_sync_to_async
def create_user(email, first_name, last_name, password):
    user = User.objects.create(email=email, first_name=first_name, last_name=last_name, password=make_password(password))
    return user

@database_sync_to_async
def get_message(room, user):
    return ChatRoomMessage.objects.get(sender=user, room=room)

@database_sync_to_async
def create_meetup(user):
    meetup = Meetup.objects.create(name="meetup-1", date=datetime.date.today(), location="Berkeley")
    member = MeetupMember.objects.create(user=user, meetup=meetup)
    return meetup, member

@database_sync_to_async
def get_event(meetup):
    pass

async def connect(path):
    communicator = WebsocketCommunicator(application=application, path=path)
    connected, _ = await communicator.connect()
    assert connected is True
    return communicator

@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
class TestWebsockets:

    async def test_chat_consumer_new_message(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        room = await create_room()
        user = await create_user("daniel@gmail.com", "Daniel", "Lee", "password")
        path = "/ws/chat/" + room.uri + "/"
        communicator = await connect(path)

        await communicator.send_json_to({
            "command": 'new_message',
            "from": user.id,
            "text": "Hello",
            "room": room.uri
        })

        response = await communicator.receive_json_from()
        message = await get_message(room, user)
        assert response['command'] == 'new_message'
        assert response['message'] == MessageSerializer(message).data 

        await communicator.disconnect(1000)

    # async def test_meetup_consumer_new_meetup_event(self, settings):
    #     settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
    #     user = await create_user("daniel@gmail.com", "Daniel", "Lee", "password")
    #     meetup, member = await create_meetup(user)
    #     print(meetup.uri)
    #     path="/ws/meetups/" + meetup.uri + "/"
    #     communicator = await connect(path)

    #     await communicator.send_json_to({
    #         "command": 'new_event',
    #         "data": json.loads(json.dumps({"creator": str(member.id),"uri": meetup.uri, "title": "Event", "start": now(), "end": now(), "entries": {}, "distance": "10000", "prices":"1, 2"}, default=str))
    #     })

    #     response = await communicator.receive_json_from()
    #     assert response['command'] == 'new_event'
    #     assert response['message']['meetup'] == meetup.uri

    #     await communicator.disconnect(1000)

    # async def test_meetup_consumer_reload_meetup_event(self, settings):
    #     pass

    # async def test_meetup_consumer_vote_meetup_event(self, settings):
    #     pass

    # async def test_meetup_consumer_decide_event(self, settings):
    #     pass

    # async def test_meetup_consumer_redecide_event(self, settings):
    #     pass

    # async def test_meetup_consumer_delete_event(self, settings):
    #     pass