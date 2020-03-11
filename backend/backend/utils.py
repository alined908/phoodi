from meetup.serializers import UserSerializer
from rest_framework_jwt.settings import api_settings
import datetime, time

def my_jwt_response_handler(token, user=None, request=None):
    return {
        'token': token,
        'expiration': int(time.mktime((datetime.datetime.utcnow() + api_settings.JWT_EXPIRATION_DELTA).timetuple())),
        'user': UserSerializer(user, context={'request': request}).data
    }