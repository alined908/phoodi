from backend.settings.base import *

DEBUG = True
ALLOWED_HOSTS = ["phoodie.me"]
DOMAIN = "phoodie.me"
BASE_URL = "https://phoodie.me/"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        'HOST': 'db',
        "PORT": 5432,
        "TEST": {"NAME": "test_meetup_db",},
    }
}

CORS_ORIGIN_WHITELIST = (
    "https://phoodie.me",
    "https://www.phoodie.me",
)

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [('redis', 6379)]
        },
    },
}