from django.db import models
from django.core.mail import send_mail
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager)
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils.timezone import now
from backend.settings import YELP_API_KEY
from django.utils.dateformat import format
from uuid import uuid4
from django.core.exceptions import ObjectDoesNotExist
import requests, random, json, sys, time, os
from django.contrib.postgres.fields import JSONField, ArrayField
from rest_framework_jwt.settings import api_settings
from django.db import transaction
from django.db.models import F
from django.db.models.expressions import RawSQL
from .helpers import path_and_rename_avatar, path_and_rename_category
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile

url = "https://api.yelp.com/v3/businesses/search"
headers = {'Authorization': "Bearer " + YELP_API_KEY}

def generate_unique_uri():
    return str(uuid4()).replace('-', '')[:15]

class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, avatar, is_staff=False, is_admin=False, password=None, **kwargs):
        if not email:
            raise ValueError("Users must have an email address")
        if not password:
            raise ValueError("User must have a password")
        user = self.model(email = self.normalize_email(email))
        user.set_password(password)
        user.first_name = first_name
        user.last_name = last_name
        user.avatar = avatar
        user.staff = is_staff
        user.admin = is_admin
        user.save(using=self._db)
        return user
    
    def create_staffuser(self, email, first_name, last_name, avatar, password=None, **kwargs):
        return self.create_user(email, first_name, last_name, avatar, True, False, password)
        
    def create_superuser(self, email, first_name, last_name, avatar, password=None, **kwargs):
        return self.create_user(email, first_name, last_name, avatar, True, True, password)

# Create your models here.
class User(AbstractBaseUser):
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    admin = models.BooleanField(default=False)
    staff = models.BooleanField(default=False)
    confirmed = models.BooleanField(default =False)
    avatar = models.ImageField(blank=True, null=True, upload_to=path_and_rename_avatar)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

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
            image.save(output, format='PNG', quality=90)
            output.seek(0)
            self.avatar = InMemoryUploadedFile(output, 'ImageField', "%s.png" %self.avatar.name, 'image/png', sys.getsizeof(output), None)
        self.full_clean()
        super(User, self).save(*args, **kwargs)

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

    def get_friends_by_category(self, category):
        friends = Friendship.objects.filter(id__in=RawSQL(
            '(SELECT a.id AS id \
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
            ', [self.id, category.id, self.id, category.id]))
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

class UserSettings(models.Model):
    user = models.ForeignKey(User, related_name="settings", on_delete=models.CASCADE)
    radius = models.IntegerField(default=10)
    location = models.TextField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    objects = models.Manager()

class Meetup(models.Model):
    uri = models.URLField(default=generate_unique_uri)
    location = models.TextField()
    longitude = models.FloatField()
    latitude = models.FloatField()
    name = models.CharField(max_length=255, default="Meetup")
    date = models.DateField()
    public = models.BooleanField()
    objects = models.Manager()

    def __str__(self):
        return self.uri

    def clean(self):
        if self.name == "":
            raise ValidationError("Name cannot be blank")
        if self.location == "":
            raise ValidationError("Location cannot be blank")

    def save(self, *args, **kwargs):
        self.full_clean(["uri"])
        return super(Meetup, self).save(*args, **kwargs)

    def send_email(self):
        members = self.members.all()
        emails = [member.user.email for member in members]
        subject = self.name + " has been finalized."
        body = '<a href="http://localhost:3000/meetups/' + self.uri +'">Meetup</a>'
        send_mail(subject, body, "meetup022897@gmail.com",emails)

class MeetupMember(models.Model):
    meetup = models.ForeignKey(Meetup, related_name="members", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="meetups", on_delete=models.CASCADE)
    ban = models.BooleanField(default=False)
    admin = models.BooleanField(default=False)
    objects = models.Manager()

    def used_ban(self):
        return self.ban

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

    def clean(self):
        if self.title == "":
            raise ValidationError("Name cannot be blank")

    def save(self, *args, **kwargs):
        self.full_clean(["entries"])
        return super(MeetupEvent, self).save(*args, **kwargs)

    def convert_entries_to_string(self):
        categories = ""
        for i, key in enumerate(self.entries): 
            category = Category.objects.get(api_label=key)
            MeetupCategory.objects.create(event=self, category=category, meetup=self.meetup)
            if i == len(self.entries) - 1:
                categories += key
            else:
                categories += key + ","
        return categories

    def request_yelp_api(self):
        categories = self.convert_entries_to_string()
        params = {
            "location": self.meetup.location, 
            "limit": 30, 
            "categories": categories, 
            "radius": self.distance, 
            "price": self.price, 
            "open_at": int(format(self.start, 'U'))
        }
        print(params["open_at"])
        response = requests.get(url=url, params=params, headers=headers)
        options = response.json()['businesses']
        return options

    def generate_options(self):
        options = self.request_yelp_api()
        random.shuffle(options)
        for option in options[:4]:
            MeetupEventOption.objects.create(event=self, option=json.dumps(option))

    def delete_options(self):
        options = self.options.all()
        return options.delete()

    def handle_decide(self, randomBool):
        """
        Randomly choose or select highest count
        If score tie: 
        1. select one with higher num likes
        2. Lower number of dislikes
        3. Random selection)
        """
        options = self.options.all()
        
        if randomBool:
            options = options.exclude(banned=True)
            chosen = random.choice(options)
        else: 
            highest = []
            maxScore = float("-inf")

            for option in options:
                if option.banned:
                    continue
                if option.score > maxScore:
                    maxScore = option.score
                    highest = [option]
                elif option.score == maxScore:
                    highest.append(option)

            chosen = random.choice(highest)

        self.chosen = chosen.id
        self.save()

class MeetupEventOption(models.Model):
    event = models.ForeignKey(MeetupEvent, related_name="options", on_delete=models.CASCADE)
    option = models.TextField()
    banned = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    objects = models.Manager()

    conversion = {1: 1, 2: -1, 3: 0}

    def handle_vote(self, status, member):
        #Check if user has voted already and delete vote 
        used_ban = member.used_ban()
        votes =  MeetupEventOptionVote.objects.filter(option = self, member = member)
        
        #Handle if no vote
        if len(votes) == 0:
            #Option is votable
            if not self.banned:
                if (used_ban and status != 3) or not used_ban:
                    MeetupEventOptionVote.objects.create(option=self, member=member, status=status)
                    self.score += self.conversion[status]
                    if not used_ban and status == 3:
                        member.ban = True
                        self.banned = True

        #Handle if voted on already
        elif len(votes) == 1:
            vote = votes[0]
            #Not votable
            if self.banned:
                if vote.status == 3:
                    vote.delete()
                    member.ban = False
                    self.banned = False
                    if status != 3:
                        MeetupEventOptionVote.objects.create(option=self, member=member, status=status)
                        self.score += self.conversion[status]
            #Votable 
            else:
                if status != vote.status:
                    if status != 3 or (status == 3 and not used_ban):
                        vote.delete()
                        self.score -= self.conversion[vote.status]
                        MeetupEventOptionVote.objects.create(option=self, member=member, status=status)
                        self.score += self.conversion[status]
                        if status == 3 and not used_ban:
                            member.ban = True
                            self.banned = True
                else:
                    vote.delete()
                    self.score -= self.conversion[vote.status]

        member.save()
        self.save()

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
        
class Category(models.Model):
    label = models.CharField(max_length=255)
    api_label = models.CharField(max_length=255)
    image = models.ImageField(blank=True, null=True, upload_to="category")
    objects = models.Manager()

    def save(self, *args, **kwargs):
        if self.image:
            image = Image.open(BytesIO(self.image.read()))
            image.thumbnail((100, 100), Image.ANTIALIAS)
            output = BytesIO()
            image.save(output, format='PNG', quality=100)
            output.seek(0)
            self.image = InMemoryUploadedFile(output, 'ImageField', "%s.png" %self.image.name, 'image/png', sys.getsizeof(output), None)
        self.full_clean()
        super(Category, self).save(*args, **kwargs)

class Preference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="preferences")
    category = models.ForeignKey(Category, on_delete = models.CASCADE)
    name = models.CharField(max_length=255)
    ranking = models.PositiveSmallIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    def reorder_preferences(self, new_rank):
        old_rank = self.ranking
        if old_rank == new_rank:
            pass
        elif old_rank < new_rank:
            Preference.objects.filter(user=self.user, ranking__lte=new_rank, ranking__gte=old_rank).update(ranking=F('ranking') - 1)
        else:
            Preference.objects.filter(user=self.user, ranking__lte=old_rank, ranking__gte=new_rank).update(ranking=F('ranking') + 1)
        self.ranking = new_rank
        self.save()

    def reorder_preferences_delete(self):
        Preference.objects.filter(user=self.user, ranking__gt=self.ranking).update(ranking=F('ranking') - 1)

class MeetupCategory(models.Model):
    meetup = models.ForeignKey(Meetup, related_name="meetup_categories", on_delete=models.CASCADE)
    event = models.ForeignKey(MeetupEvent, related_name="event_categories", on_delete=models.CASCADE)
    category = models.ForeignKey(Category, related_name="meetup_events", on_delete=models.CASCADE)
    objects = models.Manager()

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