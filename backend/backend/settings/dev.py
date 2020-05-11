from backend.settings.base import *

DEBUG = True
ALLOWED_HOSTS = []
DOMAIN = "localhost:8003"
BASE_URL = "http://localhost:8003/"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        "HOST": "localhost",
        "PORT": 5432,
        "TEST": {"NAME": "test_meetup_db",},
    }
}

CORS_ORIGIN_WHITELIST = (
    "http://localhost:8003",
    "http://localhost",
)

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)]
        },
    },
}