from django.db import models
from notifications.signals import notify
from django.core.mail import send_mail
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager)
from django.core.exceptions import ValidationError
from django.conf import settings
from asgiref.sync import async_to_sync
from uuid import uuid4
import requests
import random
from django.contrib.postgres.fields import JSONField
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework_jwt.settings import api_settings
from channels.layers import get_channel_layer
import json
import os.path
from django.db import transaction
from django.core.mail import EmailMessage

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


def wrapper(instance, filename):
        ext = filename.split('.')[-1]
        filename = '{}.{}'.format(uuid4().hex, ext)
        return os.path.join(path, filename)

def path_and_rename(path):
    return wrapper

# Create your models here.
class User(AbstractBaseUser):
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    active = models.BooleanField(default=True)
    admin = models.BooleanField(default=False)
    staff = models.BooleanField(default=False)
    confirmed = models.BooleanField(default =False)
    avatar = models.ImageField(blank=True, null=True, default= "avatar/blank_profile_pic.png", upload_to=path_and_rename('avatar'))

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    objects = UserManager()

    def __str__(self):
        return self.email

    def get_full_name(self):
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def has_perm(self, perm, obj=None):
        return self.admin

    def has_module_perms(self,app_label):
        return self.admin

    @property
    def is_admin(self):
        return self.admin

    @property
    def is_staff(self):
        return self.staff

    def email_user(self, subject, message, from_email=None, **kwargs):
        send_mail(subject, message, from_email, [self.email], **kwargs)

    def get_friends(self):
        id = self.id
        friends = Friendship.objects.raw('SELECT * FROM meetup_friendship WHERE creator_id= %s OR friend_id = %s', [id, id])
        return friends

    def get_friend(self, friend):
        id = self.id
        mapping = {'me': id, 'friend': friend.id}
        friendship = Friendship.objects.raw('SELECT * FROM meetup_friendship WHERE (creator_id = %(me)s AND friend_id = %(friend)s) OR (creator_id = %(friend)s AND friend_id = %(me)s)', mapping)
        return friendship

    def get_or_create_friend(self, friend):
        friendship = self.get_friend(friend)
        if not friendship:
            return Friendship.objects.create(creator=self, friend=friend)

        return friendship[0]

    def get_token(self):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
        payload = jwt_payload_handler(self)
        token = jwt_encode_handler(payload)
        return token

class Profile(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, default="profile")
    location = models.CharField(max_length=30,blank=True)

class Meetup(models.Model):
    uri = models.URLField(default=generate_unique_uri)
    location = models.TextField()
    name = models.CharField(max_length=255, default="Meetup")
    datetime = models.DateTimeField()
    objects = models.Manager()

    def __str__(self):
        return self.uri

    def send_email(self, message):
        members = self.members.all()
        emails = [member.user.email for member in members]
        subject = self.name + "has been finalized."
        body = ""
        email = EmailMessage(subject, body, to=emails)
        email.send()

@receiver(post_save, sender=Meetup)
def create_chat_room_for_meetup(sender, instance, created, **kwargs):
    if created:
        uri = instance.uri
        name = instance.name
        room = ChatRoom.objects.create(uri=uri, name=name, meetup=instance)

class MeetupMember(models.Model):
    meetup = models.ForeignKey(Meetup, related_name="members", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="meetups", on_delete=models.CASCADE)
    admin = models.BooleanField(default=False)
    objects = models.Manager()

@receiver(post_save, sender=MeetupMember)
def create_chat_room_member(sender, instance, created, **kwargs):
    if created:
        meetup = instance.meetup
        user = instance.user
        room = ChatRoom.objects.get(uri=meetup.uri)
        member = ChatRoomMember.objects.create(room = room, user = user)

class Category(models.Model):
    label = models.CharField(max_length=255)
    api_label = models.CharField(max_length=255)
    objects = models.Manager()

class MeetupEvent(models.Model):
    meetup = models.ForeignKey(Meetup, related_name="events", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    location = models.TextField()
    start = models.DateTimeField(blank=True, null=True)
    end = models.DateTimeField(blank=True, null=True)
    chosen = models.IntegerField(blank=True, null=True) 
    entries = JSONField()
    _original_location = None
    objects = models.Manager()

    def generate_options(self):
        categories = ""

        for i, key in enumerate(self.entries): 
            category = Category.objects.get(api_label=key)
            meetupcategory = MeetupCategory.objects.create(event=self, category=category)
            if i == len(self.entries) - 1:
                categories += key
            else:
                categories += key + ", "

        params = {"location": self.location, "limit": 30, "categories": categories}
        r = requests.get(url=url, params=params, headers=headers)
        options = r.json()['businesses']
        random.shuffle(options)
        
        for option in options[:4]:
            MeetupEventOption.objects.create(event=self, option=json.dumps(option))

class MeetupEventOption(models.Model):
    event = models.ForeignKey(MeetupEvent, related_name="options", on_delete=models.CASCADE)
    option = models.TextField()
    score = models.IntegerField(default=0)
    objects = models.Manager()

class MeetupCategory(models.Model):
    event = models.ForeignKey(MeetupEvent, related_name="categories", on_delete=models.CASCADE)
    category = models.ForeignKey(Category, related_name="meetup_events", on_delete=models.CASCADE)
    objects = models.Manager()

class MeetupEventOptionVote(models.Model):
    class Vote(models.IntegerChoices):
        LIKE = 1
        DISLIKE = 2
        BAN = 3

    option = models.ForeignKey(MeetupEventOption, related_name="event_votes", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="user_votes", on_delete=models.CASCADE)
    status = models.IntegerField(choices=Vote.choices)
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

@receiver(post_save, sender = MeetupInvite)
def create_notif_meetup_inv(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        notify.send(sender=instance.sender, recipient=instance.receiver, description="invite", action_object=instance, verb="%s sent meetup invite to %s" % (instance.sender.email,  instance.receiver.email))
        unread_inv_notifs =  instance.receiver.notifications.filter(description="invite").unread()  
        count = unread_inv_notifs.count()  
        content = {
            'command': 'fetch_notifs',
            'message': {"invite": count}
        }
        async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % instance.receiver.id, {
            'type': 'notifications',
            'message': content
        })

class FriendInvite(Invite):
    objects = models.Manager()

    def __init__(self, *args, **kwargs):
        super(FriendInvite, self).__init__(*args, **kwargs)

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        if self.status != Invite.InviteStatus.OPEN:
            if self.status == Invite.InviteStatus.ACCEPTED:
                Friendship.objects.get_or_create(creator=self.sender, friend=self.receiver)
        super(FriendInvite, self).save(force_insert, force_update, *args, **kwargs)

@receiver(post_save, sender=FriendInvite)
def create_notif_friend_inv(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        notify.send(sender=instance.sender, recipient=instance.receiver, description="invite", action_object=instance, verb="%s sent friend invite to %s" % (instance.sender.email,  instance.receiver.email))
        unread_inv_notifs =  instance.receiver.notifications.filter(description="invite").unread()  
        count = unread_inv_notifs.count()  
        content = {
            'command': 'fetch_notifs',
            'message': {"invite": count}
        }
        async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % instance.receiver.id, {
            'type': 'notifications',
            'message': content
        })
        
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

@receiver(post_save, sender=Friendship)
def create_chat_room_for_friendship(sender, instance, created, **kwargs):
    if created:
        room = ChatRoom.objects.create(friendship=instance)
        ChatRoomMember.objects.create(room = room, user = instance.creator)
        ChatRoomMember.objects.create(room = room, user = instance.friend)

class ChatRoom(models.Model):
    friendship = models.ForeignKey(Friendship, null=True, blank=True, on_delete=models.CASCADE)
    meetup = models.ForeignKey(Meetup, null=True, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, null=True, blank=True)
    uri = models.URLField(default=generate_unique_uri)
    timestamp = models.DateTimeField(auto_now_add=True)
    objects=models.Manager()

    def __str__(self):
        return self.uri

class ChatRoomMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    message = models.TextField()
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="sent_msgs", on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    objects=models.Manager()

    def __str__(self):
        return self.message

    class Meta:
        ordering = ('timestamp',)


@receiver(post_save, sender=ChatRoomMessage)
def create_notif_chat_message(sender, instance, created, **kwargs):
    print("create_notif_chat_message receiver")
    if created:
        channel_layer = get_channel_layer()
        for member in instance.room.members.all():
            if member.user != instance.sender:
                notify.send(sender=instance.sender, recipient=member.user, description="message", action_object=instance, verb="%s sent chat notif to %s" % (instance.sender.email,  member.user.email))
                unread_chat_notifs =  member.user.notifications.filter(description="message").unread()  
                count = unread_chat_notifs.count()  
                content = {
                    'command': 'fetch_notifs',
                    'message': {"chat": count}
                }
                async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % member.user.id, {
                    'type': 'notifications',
                    'message': content
                })
    
class ChatRoomMember(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='members', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='rooms', on_delete=models.CASCADE)
    objects = models.Manager()



   

