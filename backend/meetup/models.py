from django.db import models
from django.core.mail import send_mail
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager)
from django.core.exceptions import ValidationError
from django.conf import settings
from uuid import uuid4
import requests
import json

url = "https://api.yelp.com/v3/businesses/search"
headers = {'Authorization': "Bearer U46B4ff8l6NAdldViS7IeS8HJriDeE9Cd5YZXTUmrdzvtv57AUQiYJVVbEPFp30nhL9YAW2-LjAAQ1cBapJ4uqiOYES8tz9EjM85R8ki9l-54Z1d_1OOWLeY5tTuXXYx"}

def generate_unique_uri():
    return str(uuid4()).replace('-', '')[:15]

class UserManager(BaseUserManager):
    def create_user(self, email, first_name, is_staff=False, is_admin=False, password=None, **kwargs):
        if not email:
            raise ValueError("Users must have an email address")
        if not password:
            raise ValueError("User must have a password")
        user = self.model(email = self.normalize_email(email))
        user.set_password(password)
        user.first_name = first_name
        user.staff = is_staff
        user.admin = is_admin
        user.save(using=self._db)
        return user
    
    def create_staffuser(self, email, password, first_name):
        user = self.create_user(
            email, password=password, first_name=first_name
        )
        user.staff = True
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password, first_name):
        user = self.create_user(
            email, password=password, first_name=first_name
        )
        user.staff = True
        user.admin = True
        user.save(using=self._db)
        return user

# Create your models here.
class User(AbstractBaseUser):
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    active = models.BooleanField(default=True)
    admin = models.BooleanField(default=False)
    staff = models.BooleanField(default=False)
    confirmed = models.BooleanField(default =False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    objects = UserManager()

    def __str__(self):
        return self.email

    def get_full_name(self):
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        return self.first_name

    def has_perm(self, perm, obj=None):
        return self.admin

    def has_module_perms(self,app_label):
        return self.admin
    
    def get_id(self):
        return self.id

    @property
    def is_admin(self):
        return self.admin

    @property
    def is_staff(self):
        return self.staff

    def email_user(self, subject, message, from_email=None, **kwargs):
        send_mail(subject, message, from_email, [self.email], **kwargs)

    def get_friends(self):
        id = self.get_id()
        friends = Friendship.objects.raw('SELECT * FROM meetup_friendship WHERE creator_id= %s OR friend_id = %s', [id, id])
        return friends

    def get_friend(self, friend):
        id = self.get_id()
        mapping = {'me': id, 'friend': friend.id}
        friendship = Friendship.objects.raw('SELECT * FROM meetup_friendship WHERE (creator_id = %(me)s AND friend_id = %(friend)s) OR (creator_id = %(friend)s AND friend_id = %(me)s)', mapping)
        return friendship

    def get_or_create_friend(self, friend):
        friendship = self.get_friend(friend)
        if not friendship:
            return Friendship.objects.create(creator=self, friend=friend)

        return friendship[0]

class Profile(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, default="profile")
    location = models.CharField(max_length=30,blank=True)

class Meetup(models.Model):
    uri = models.URLField(default=generate_unique_uri)
    name = models.CharField(max_length=255, default="Meetup")
    datetime = models.DateTimeField()
    options = models.TextField()
    chosen = models.TextField(blank=True)
    location = models.TextField()

    _original_location = None
    objects = models.Manager()

    def __str__(self):
        return self.uri

    def __init__(self, *args, **kwargs):
        super(Meetup, self).__init__(*args, **kwargs)

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        if self.location != self._original_location:
            params = {"location": self.location}
            r = requests.get(url=url, params=params, headers=headers)
            self.options = json.dumps(r.json())
            print("Save new location and generate options")
        super(Meetup, self).save(force_insert, force_update, *args, **kwargs)
        self._original_location = self.location

class MeetupMember(models.Model):
    meetup = models.ForeignKey(Meetup, related_name="members", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="meetups", on_delete=models.CASCADE)
    objects = models.Manager()

class Invite(models.Model):
    class InviteStatus(models.IntegerChoices):
        OPEN = 1
        ACCEPTED = 2
        REJECTED = 3

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="sent_%(class)ss", on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="received_%(class)ss", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.IntegerField(choices=InviteStatus.choices, default=InviteStatus.OPEN)
    uri = models.URLField(default=generate_unique_uri)

    class Meta:
        abstract = True

class MeetupInvite(Invite):
    meetup = models.ForeignKey(Meetup, related_name="invs", on_delete=models.CASCADE)
    objects = models.Manager()

    def __init__(self, *args, **kwargs):
        super(MeetupInvite, self).__init__(*args, **kwargs)

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        print("save")
        if self.status != Invite.InviteStatus.OPEN:
            if self.status == Invite.InviteStatus.ACCEPTED:
                MeetupMember.objects.get_or_create(meetup=self.meetup, user=self.receiver)
        super(MeetupInvite, self).save(force_insert, force_update, *args, **kwargs)

class FriendInvite(Invite):
    objects = models.Manager()

    def __init__(self, *args, **kwargs):
        super(FriendInvite, self).__init__(*args, **kwargs)

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        if self.status != Invite.InviteStatus.OPEN:
            if self.status == Invite.InviteStatus.ACCEPTED:
                Friendship.objects.get_or_create(creator=self.sender, friend=self.receiver)
        super(FriendInvite, self).save(force_insert, force_update, *args, **kwargs)

class Preference(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="preferences")
    label = models.TextField()

class Friendship(models.Model):
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="friend_creators", on_delete=models.CASCADE)
    friend = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="friends", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    objects=models.Manager()

    def clean(self):
        if self.creator == self.friend:
            raise ValidationError("cannot be friends with yourself")

class ChatRoom(models.Model):
    name = models.CharField(max_length=200)
    uri = models.URLField(default=generate_unique_uri)
    timestamp = models.DateTimeField(auto_now_add=True)
    objects=models.Manager()

    def __str__(self):
        return self.uri

class ChatRoomMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    message = models.TextField()
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="sent_msgs", on_delete=models.SET_NULL, null=True)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="received_msgs", on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    objects=models.Manager()

    def __str__(self):
        return self.message

    class Meta:
        ordering = ('timestamp',)
    
class ChatRoomMember(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='members', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='rooms', on_delete=models.CASCADE)
    objects = models.Manager()



   

