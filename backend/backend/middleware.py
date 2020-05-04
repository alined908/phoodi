from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from channels.auth import AuthMiddlewareStack
from rest_framework_simplejwt.tokens import AccessToken
from channels.db import database_sync_to_async
import jwt, time

User = get_user_model()


@database_sync_to_async
def close_connections():
    close_old_connections()


@database_sync_to_async
def get_user(token):
    try:
        decoded = jwt.decode(token[0], verify=False)
        if decoded["exp"] < time.time():
            return AnonymousUser()
        return User.objects.get(id=decoded["user_id"])
    except User.DoesNotExist:
        return AnonymousUser()


class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return TokenAuthMiddlewareInstance(scope, self)


class TokenAuthMiddlewareInstance:
    def __init__(self, scope, middleware):
        self.middleware = middleware
        self.scope = dict(scope)
        self.inner = self.middleware.inner

    async def __call__(self, receive, send):
        await close_connections()
        query_string = parse_qs(self.scope["query_string"].decode())
        token = query_string.get("token")
        if not token:
            self.scope["user"] = AnonymousUser()
            return self.inner(self.scope)
        user = await get_user(token)
        self.scope["user"] = user
        inner = self.inner(self.scope)
        return await inner(receive, send)


TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))
