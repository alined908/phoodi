from django.db import models
from django.core.mail import send_mail
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager)
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils.timezone import now
from uuid import uuid4
from django.core.exceptions import ObjectDoesNotExist
import requests
import random
from django.contrib.postgres.fields import JSONField
from rest_framework_jwt.settings import api_settings
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
        friends = Friendship.objects.raw('SELECT * FROM meetup_friendship WHERE creator_id= %s OR friend_id = %s', [self.id, self.id])
        return friends

    def get_friend(self, friend):
        mapping = {'me': self.id, 'friend': friend.id}
        friendship = Friendship.objects.raw('SELECT * FROM meetup_friendship WHERE (creator_id = %(me)s AND friend_id = %(friend)s) OR (creator_id = %(friend)s AND friend_id = %(me)s)', mapping)
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
    date = models.DateField()
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

class MeetupMember(models.Model):
    meetup = models.ForeignKey(Meetup, related_name="members", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="meetups", on_delete=models.CASCADE)
    ban = models.BooleanField(default=False)
    admin = models.BooleanField(default=False)
    objects = models.Manager()

    def used_ban(self):
        return self.ban

class Category(models.Model):
    label = models.CharField(max_length=255)
    api_label = models.CharField(max_length=255)
    objects = models.Manager()

class MeetupEvent(models.Model):
    meetup = models.ForeignKey(Meetup, related_name="events", on_delete=models.CASCADE)
    creator = models.ForeignKey(MeetupMember, related_name="created_events", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    distance = models.IntegerField()
    price = models.CharField(max_length=10)
    start = models.DateTimeField()
    end = models.DateTimeField(blank=True, null=True)
    chosen = models.IntegerField(blank=True, null=True) 
    entries = JSONField()
    _original_location = None
    objects = models.Manager()

    def convert_entries_to_string(self):
        categories = ""
        for i, key in enumerate(self.entries): 
            category = Category.objects.get(api_label=key)
            meetupcategory = MeetupCategory.objects.create(event=self, category=category)
            if i == len(self.entries) - 1:
                categories += key
            else:
                categories += key + ", "

        return categories

    def request_yelp_api(self):
        categories = self.convert_entries_to_string()
        params = {"location": self.meetup.location, "limit": 30, "categories": categories, "radius": self.distance, "price": self.price}
        r = requests.get(url=url, params=params, headers=headers)
        options = r.json()['businesses']
        return options

    def generate_options(self):
        options = self.request_yelp_api()
        random.shuffle(options)
        for option in options[:4]:
            MeetupEventOption.objects.create(event=self, option=json.dumps(option))


class MeetupEventOption(models.Model):
    event = models.ForeignKey(MeetupEvent, related_name="options", on_delete=models.CASCADE)
    option = models.TextField()
    banned = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    objects = models.Manager()

    conversion = {1: 1, 2: -1}

    def handle_vote(self, status, member):
        #Check if user has voted already
        prev_status = 0
        used_ban = member.used_ban()

        try: 
            vote = MeetupEventOptionVote.objects.get(option = self, member = member)
            prev_status = vote.status

            #If not banned and vote exists and option is not banned delete score
            if not self.banned and not used_ban:
                print("A")
                self.score -= self.conversion[vote.status] 
                vote.delete()
            
            #If banned and vote exists and user did ban then remove ban
            if self.banned and prev_status == 3:
                print("B")
                vote.delete()
                member.ban = False
                self.banned = False
                
        except ObjectDoesNotExist:
            print("Member has not voted already on the option")

        #If havent voted option yet or change from one option to another
        if status != prev_status:
            print("C")
            # If option is not banned
            if not self.banned:
                print("D")
                # If user already used ban
                if used_ban:
                    if status != 3:
                        MeetupEventOptionVote.objects.create(option=self, member=member, status=status)
                else:
                    MeetupEventOptionVote.objects.create(option=self, member=member, status=status)
                    if status != 3:
                        self.score += self.conversion[status]
                    else:
                        print("h")
                        self.banned = True
                        member.ban = True
        
        member.save()
        self.save()
        
                  
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
    member = models.ForeignKey(MeetupMember, related_name="member_votes", on_delete=models.CASCADE)
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
    created_at = models.DateTimeField(default=now, editable=False)
    objects=models.Manager()

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
    
class ChatRoomMember(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='members', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='rooms', on_delete=models.CASCADE)
    objects = models.Manager()