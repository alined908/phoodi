from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path, path
from meetup.consumers import ChatConsumer, MeetupConsumer, UserNotificationConsumer
from .middleware import TokenAuthMiddlewareStack

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', ChatConsumer),
    re_path(r'ws/meetups/(?P<room_name>\w+)/$', MeetupConsumer),
    path(r'ws/user/<int:user_id>/', UserNotificationConsumer),
]

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket':  TokenAuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})