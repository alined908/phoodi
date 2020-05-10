import django, os

os.environ["DJANGO_SETTINGS_MODULE"] = "backend.settings"
django.setup()
from channels.testing import WebsocketCommunicator
from meetup.consumers import ChatRoomConsumer, UserNotificationConsumer, MeetupConsumer, ChatContactsConsumer
from backend.routing import application
from meetup.serializers import (
    MessageSerializer,
    MeetupEventSerializer,
    MeetupEventOptionSerializer,
    MeetupMemberSerializer,
)
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.test import Client
from django.contrib.auth.hashers import make_password
from meetup.models import (
    ChatRoom,
    User,
    ChatRoomMessage,
    Meetup,
    MeetupEvent,
    MeetupMember,
)
from django.utils.timezone import now
from rest_framework_simplejwt.tokens import RefreshToken
import datetime, json, pytest
from django.core.serializers.json import DjangoJSONEncoder

TEST_CHANNEL_LAYERS = {
    "default": {"BACKEND": "channels.layers.InMemoryChannelLayer",},
}


@database_sync_to_async
def create_room():
    room = ChatRoom.objects.create()
    return room


@database_sync_to_async
def create_user(email):
    user = User.objects.create(
        email=email,
        first_name="First",
        last_name="Name",
        password=make_password("password"),
        is_active=True
    )
    return user


@database_sync_to_async
def create_meetup(user, public):
    meetup = Meetup.objects.create(
        name="meetup-1",
        date=datetime.date.today(),
        location="Berkeley",
        latitude=34.228754,
        longitude=-118.2351192,
        public=public,
        creator=user
    )
    member = MeetupMember.objects.create(user=user, meetup=meetup)
    return meetup, member


@database_sync_to_async
def get_option(event):
    option = event.options.first()
    return option


@database_sync_to_async
def create_event(meetup, member, random=True):
    event = MeetupEvent.objects.create(
        meetup=meetup,
        creator=member,
        title="event",
        distance=10000,
        price="1,2",
        start=now(),
        end=now(),
        random=random,
        entries={},
    )
    return event


@database_sync_to_async
def get_option_serializer(option):
    option_json = MeetupEventOptionSerializer(option)
    return option_json.data


@database_sync_to_async
def get_event_serializer(event):
    event_json = MeetupEventSerializer(event)
    return event_json.data


@database_sync_to_async
def refresh(item):
    item.refresh_from_db()


@database_sync_to_async
def get_event_count(meetup):
    return meetup.events.all().count()


async def get_token(user):
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    return token


async def auth_connect(path):
    client = Client()
    communicator = WebsocketCommunicator(application=application, path=path)
    connected, _ = await communicator.connect()
    assert connected is True
    return communicator


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
class TestWebsockets:
    async def test_authorized_user_can_connect(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user = await create_user("daniel@gmail.com")
        token = await get_token(user)
        path = "/ws/user/" + str(user.id) + "/?token=" + token
        communicator = await auth_connect(path)
        await communicator.disconnect()

    async def test_chat_consumer_new_message(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        room = await create_room()
        user = await create_user("daniel@gmail.com")
        token = await get_token(user)
        path = "/ws/chat/" + room.uri + "/?token=" + token
        communicator = await auth_connect(path)

        await communicator.send_json_to(
            {
                "command": "new_message",
                "from": user.id,
                "text": "Hello",
                "room": room.uri,
            }
        )

        response = await communicator.receive_json_from()
        assert response["command"] == "new_message"
        assert response["message"]["message"] == "Hello"

        await communicator.send_json_to(
            {
                "command": "new_message",
                "from": user.id,
                "text": "Hello2",
                "room": room.uri,
            }
        )
        response = await communicator.receive_json_from()
        assert response["command"] == "new_message"
        assert response["message"]["message"] == "Hello2"

        await communicator.disconnect()

    async def test_user_notifications(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user = await create_user("daniel@gmail.com")
        token = await get_token(user)
        path = "/ws/user/" + str(user.id) + "/?token=" + token
        communicator = await auth_connect(path)

        await communicator.send_json_to(
            {"command": "fetch_notifications", "data": {"user": user.id}}
        )

        response = await communicator.receive_json_from()
        assert response["command"] == "fetch_notifs"
        assert response["message"] == {
            "chat_message": 0,
            "friend_inv": 0,
            "meetup_inv": 0,
            "meetup": 0,
            "friend": 0,
        }

        await communicator.disconnect()

    # async def test_meetup_consumer_reload_meetup_event(self, settings):
    #     settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
    #     user = await create_user("daniel@gmail.com")
    #     token = await get_token(user)
    #     meetup, member = await create_meetup(user, public=True)
    #     event = await create_event(meetup, member)
    #     path = "/ws/meetups/" + meetup.uri + "/?token=" + token
    #     communicator = await auth_connect(path)

    #     await communicator.send_json_to(
    #         {
    #             "command": "reload_event",
    #             "data": {
    #                 "event": event.id, 
    #                 "meetup": meetup.uri
    #             },
    #         }
    #     )

    #     response = await communicator.receive_json_from()
    #     await refresh(event)
    #     event_json = await get_event_serializer(event)
    #     assert response["command"] == "reload_event"
    #     assert response["message"]["meetup"] == meetup.uri
    #     assert response["message"]["event_id"] == event.id
    #     assert response["message"]["event"] == json.loads(json.dumps(event_json))
    #     await communicator.disconnect()

    async def test_meetup_consumer_vote_meetup_event(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user = await create_user("daniel@gmail.com")
        token = await get_token(user)
        meetup, member = await create_meetup(user, public=True)
        event = await create_event(meetup, member)
        option = await get_option(event)
        path = "/ws/meetups/" + meetup.uri + "/?token=" + token
        communicator = await auth_connect(path)

        await communicator.send_json_to(
            {
                "command": "vote_event",
                "data": {
                    "user": user.id,
                    "meetup": meetup.uri,
                    "option": option.id,
                    "status": 1,
                },
            }
        )

        response = await communicator.receive_json_from()
        await refresh(option)
        option_json = await get_option_serializer(option)

        assert response["command"] == "vote_event"
        assert response["message"]["meetup"] == meetup.uri
        assert response["message"]["event_id"] == event.id
        assert response["message"]["option_id"] == option.id
        assert response["message"]["option"] == json.loads(
            json.dumps(option_json[option.id])
        )

        await communicator.disconnect()

    async def test_meetup_consumer_decide_event(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user = await create_user("daniel@gmail.com")
        token = await get_token(user)
        meetup, member = await create_meetup(user, public=True)
        event = await create_event(meetup, member)
        path = "/ws/meetups/" + meetup.uri + "/?token=" + token
        communicator = await auth_connect(path)

        await communicator.send_json_to(
            {
                "command": "decide_event",
                "data": {
                    "meetup": meetup.uri, 
                    "event": event.id, 
                    "random": True
                },
            }
        )

        response = await communicator.receive_json_from()
        await refresh(event)
        event_json = await get_event_serializer(event)
        assert response["command"] == "decide_event"
        assert response["message"]["meetup"] == meetup.uri
        assert response["message"]["event_id"] == event.id
        assert response["message"]["event"] == json.loads(json.dumps(event_json))
        await communicator.disconnect()

    async def test_meetup_consumer_redecide_event(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user = await create_user("daniel@gmail.com")
        token = await get_token(user)
        meetup, member = await create_meetup(user, public=True)
        event = await create_event(meetup, member)
        path = "/ws/meetups/" + meetup.uri + "/?token=" + token
        communicator = await auth_connect(path)

        await communicator.send_json_to(
            {
                "command": "redecide_event",
                "data": {
                    "meetup": meetup.uri, 
                    "event": event.id,
                },
            }
        )

        response = await communicator.receive_json_from()
        await refresh(event)
        event_json = await get_event_serializer(event)
        assert response["command"] == "redecide_event"
        assert response["message"]["meetup"] == meetup.uri
        assert response["message"]["event_id"] == event.id
        assert response["message"]["event"] == json.loads(json.dumps(event_json))
        await communicator.disconnect()

    async def test_meetup_consumer_delete_event(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user = await create_user("daniel@gmail.com")
        token = await get_token(user)
        meetup, member = await create_meetup(user, public=True)
        event = await create_event(meetup, member)
        path = "/ws/meetups/" + meetup.uri + "/?token=" + token
        communicator = await auth_connect(path)

        await communicator.send_json_to(
            {"command": "delete_event", "data": {"uri": meetup.uri, "event": event.id,}}
        )

        response = await communicator.receive_json_from()
        await refresh(meetup)
        num_events = await get_event_count(meetup)
        assert num_events == 0
        assert response["command"] == "delete_event"
        assert response["message"]["meetup"] == meetup.uri
        assert response["message"]["event_id"] == event.id
        await communicator.disconnect()

    async def test_meetup_consumer_new_option(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user = await create_user("daniel@gmail.com")
        token = await get_token(user)
        meetup, member = await create_meetup(user, public=True)
        event = await create_event(meetup, member, random=False)
        path = "/ws/meetups/" + meetup.uri + "/?token=" + token
        communicator = await auth_connect(path)

        await communicator.send_json_to(
            {
                "command": "new_option",
                "data": {
                    "meetup": meetup.uri,
                    "event": event.id,
                    "option": {
                        "id": 123,
                        "name": "Name",
                        "image_url": "something",
                        "url": "something",
                        "rating": 4,
                        "coordinates": {
                            "latitude": 34.228754,
                            "longitude": -118.2351192
                        },
                        "price": "$$",
                        "display_phone": "something",
                        "categories": {},
                        "location": {
                            "city": "something",
                            "country": "something",
                            "state": "something",
                            "zip_code": "something",
                            "address1": "something",
                            "display_address": "something"
                        }
                    },
                },
            }
        )

        response = await communicator.receive_json_from()
        await refresh(event)
        option = await get_option(event)
        option_json = await get_option_serializer(option)
        assert response["command"] == "new_option"
        assert response["message"]["meetup"] == meetup.uri
        assert response["message"]["event_id"] == event.id
        assert response["message"]["option"] == json.loads(json.dumps(option_json))
        await communicator.disconnect()
