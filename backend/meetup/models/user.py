from django.db import models
from io import BytesIO
from PIL import Image
from django.utils.timezone import now
from django.core.mail import send_mail
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from meetup.helpers import path_and_rename_avatar
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db.models.expressions import RawSQL
from django.core.exceptions import ValidationError
from .friend import Friendship
import sys

class UserManager(BaseUserManager):
    def create_user(
        self,
        email,
        first_name,
        last_name,
        avatar=None,
        is_staff=False,
        is_admin=False,
        password=None,
        **kwargs
    ):
        if not email:
            raise ValueError("Users must have an email address")
        if not password:
            raise ValueError("User must have a password")
        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.first_name = first_name
        user.last_name = last_name
        user.avatar = avatar
        user.staff = is_staff
        user.admin = is_admin
        user.save(using=self._db)
        return user

    def create_staffuser(
        self, email, first_name, last_name, avatar=None, password=None, **kwargs
    ):
        return self.create_user(
            email, first_name, last_name, avatar, True, False, password
        )

    def create_superuser(
        self, email, first_name, last_name, avatar=None, password=None, **kwargs
    ):
        return self.create_user(
            email, first_name, last_name, avatar, True, True, password
        )


class User(AbstractBaseUser):
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=False)
    admin = models.BooleanField(default=False)
    staff = models.BooleanField(default=False)
    confirmed = models.BooleanField(default=False)
    avatar = models.ImageField(blank=True, null=True, upload_to=path_and_rename_avatar)
    created_at = models.DateTimeField(default=now, editable=False)
    review_karma = models.IntegerField(default=0)
    comment_karma = models.IntegerField(default=0)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "avatar"]

    objects = UserManager()

    def __str__(self):
        return self.email

    def clean(self):
        if self.email == "":
            raise ValidationError("Email cannot be blank")
        if self.first_name == "":
            raise ValidationError("First name cannot be blank")
        if self.last_name == "":
            raise ValidationError("Last name cannot be blank")

    def save(self, *args, **kwargs):
        if self.avatar:
            image = Image.open(BytesIO(self.avatar.read()))
            image.thumbnail((200, 200), Image.ANTIALIAS)
            output = BytesIO()
            image.save(output, format="PNG", quality=90)
            output.seek(0)
            self.avatar = InMemoryUploadedFile(
                output,
                "ImageField",
                "%s.png" % self.avatar.name,
                "image/png",
                sys.getsizeof(output),
                None,
            )
        self.full_clean()
        super(User, self).save(*args, **kwargs)

    def get_full_name(self):
        full_name = "%s %s" % (self.first_name, self.last_name)
        return full_name.strip()

    def has_perm(self, perm, obj=None):
        return self.admin

    def has_module_perms(self, app_label):
        return self.admin

    @property
    def is_admin(self):
        return self.admin

    @property
    def is_staff(self):
        return self.staff

    @property
    def avatar_index(self):
        return self.avatar.url if self.avatar else None

    def email_user(self, subject, message, from_email=None, **kwargs):
        send_mail(subject, message, from_email, [self.email], **kwargs)

    def get_friends(self):
        friends = Friendship.objects.raw(
            "SELECT * FROM meetup_friendship WHERE creator_id= %s OR friend_id = %s",
            [self.id, self.id],
        )
        return friends

    def get_friends_by_category(self, category):
        friends = Friendship.objects.filter(
            id__in=RawSQL(
                "(SELECT a.id AS id \
            FROM meetup_friendship AS a \
            INNER JOIN meetup_preference AS b \
            ON a.friend_id=b.user_id \
            AND a.creator_id=%s AND b.category_id=%s) \
            UNION \
            (SELECT a.id AS id \
            FROM meetup_friendship AS a \
            INNER JOIN meetup_preference AS b \
            ON a.creator_id=b.user_id \
            AND a.friend_id=%s AND b.category_id=%s) \
            ",
                [self.id, category.id, self.id, category.id],
            )
        )
        return friends

    def get_friend(self, friend):
        mapping = {"me": self.id, "friend": friend.id}
        friendship = Friendship.objects.raw(
            "SELECT * FROM meetup_friendship WHERE (creator_id = %(me)s AND friend_id = %(friend)s) OR (creator_id = %(friend)s AND friend_id = %(me)s)",
            mapping,
        )
        return friendship

    def is_friend(self, friend):
        friendship = self.get_friend(friend)
        return len(friendship) > 0

    def get_or_create_friend(self, friend):
        friendship = self.is_friend(friend)
        if not friendship:
            return Friendship.objects.create(creator=self, friend=friend)

        friendship = self.get_friend(friend)
        return friendship[0]

    def get_chat_rooms(self):
        from .chat import ChatRoom
        
        rooms = ChatRoom.objects.filter(
            id__in=RawSQL(
                "SELECT member.room_id \
            FROM meetup_chatroommember as member \
            WHERE user_id = %s",
                (self.id,),
            )
        ).order_by("-last_updated")
        return rooms


class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    radius = models.IntegerField(default=25)
    location = models.TextField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    objects = models.Manager()