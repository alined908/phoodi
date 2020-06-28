from django.db import models
from meetup.helpers import generate_unique_uri, send_mass_html_mail, get_user
from django.contrib.postgres.fields import JSONField
from .user import User
from .restaurant import Restaurant, RestaurantCategory
from .category import Category
from .invite import MeetupInvite
from ..helpers import nearby_public_entities
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.template.loader import render_to_string
from django.contrib.postgres.fields import ArrayField
from django.conf import settings
from django.db.models.expressions import RawSQL
from django.utils.dateformat import format
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver
import requests, random, json, datetime, re
from django.db.models import Q
from enum import Enum

BASE_URL = settings.BASE_URL
url = "https://api.yelp.com/v3/businesses/search"
headers = {"Authorization": "Bearer " + settings.YELP_API_KEY}
channel_layer= get_channel_layer()

class Meetup(models.Model):
    uri = models.URLField(default=generate_unique_uri)
    creator = models.ForeignKey(
        User, null=True, related_name="created_meetups", on_delete=models.SET_NULL
    )
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
        super(Meetup, self).save(*args, **kwargs)

    @staticmethod
    def get_private(categories, coords, request, start, end, num_results=25):
        
        distance_query, category_ids = nearby_public_entities(coords, request, categories, num_results, 'meetup')

        member_query = RawSQL(
            "SELECT member.meetup_id as id FROM meetup_meetupmember as member WHERE user_id = %s",
            (request.user.id,),
        )

        if not category_ids:
            meetups = Meetup.objects.filter(
                Q(id__in=distance_query) &
                Q(id__in=member_query) &
                Q(date__range=(start, end))
            ).order_by("date")
        else:
            category_query = RawSQL(
                "SELECT DISTINCT category.meetup_id \
                FROM meetup_meetupcategory as category \
                WHERE category_id = ANY(%s)",
                (category_ids,),
            )

            meetups = Meetup.objects.filter(
                Q(id__in=category_query) &
                Q(id__in=distance_query) &
                Q(id__in=member_query) &
                Q(date__range=(start, end))
            ).order_by("date")

        return meetups

    @staticmethod
    def get_public(categories, coords, request, start, end, num_results=25):

        distance_query, category_ids = nearby_public_entities(coords, request, categories, num_results, 'meetup')
       
        if not category_ids:
            meetups = Meetup.objects.filter(
                public=public, 
                id__in=distance_query, 
                date__range=(start, end)
            ).order_by("date")
            
        else:
            category_query = RawSQL(
                "SELECT DISTINCT category.meetup_id \
                FROM meetup_meetupcategory as category \
                WHERE category_id = ANY(%s)",
                (category_ids,),
            )

            meetups = Meetup.objects.filter(
                Q(public=True) & 
                Q(id__in=category_query) & 
                Q(id__in=distance_query) & 
                Q(date__range=(start, end))
            ).order_by("date")

        return meetups

    def send_email(self):
        subject = self.name + " has been finalized."
        messages = []

        for member in self.members.all():
            user = member.user
            email = user.email
            first_name = user.first_name
            params = {
                "first_name": first_name,
                "meetup_uri": BASE_URL + "meetups/" + self.uri,
            }
            msg_plain = render_to_string("meetup.txt", params)
            msg_html = render_to_string("meetup.html", params)
            message = (subject, msg_plain, msg_html, "team@phoodie.me", [email])
            messages.append(message)

        send_mass_html_mail(messages)

class MeetupMember(models.Model):
    meetup = models.ForeignKey(Meetup, related_name="members", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="meetups", on_delete=models.CASCADE)
    ban = models.BooleanField(default=False)
    admin = models.BooleanField(default=False)
    objects = models.Manager()

    def used_ban(self):
        return self.ban

class MeetupEvent(models.Model):
    
    PRICE_CHOICES = [
        (1, '$'),
        (2, '$$'),
        (3, '$$$'),
        (4, '$$$$')
    ]

    SERIALIZED_PRICE_CHOICES = {
        '$': 1,
        '$$': 2,
        '$$$': 3,
        '$$$$': 4
    }

    DESERIALIZED_PRICE_CHOICES = {
        v:k for k,v in SERIALIZED_PRICE_CHOICES.items()
    }

    meetup = models.ForeignKey(Meetup, related_name="events", on_delete=models.CASCADE)
    creator = models.ForeignKey(
        MeetupMember, related_name="created_events", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)
    distance = models.IntegerField()
    price = ArrayField(
        models.IntegerField(choices=PRICE_CHOICES)
    )
    start = models.DateTimeField()
    end = models.DateTimeField(blank=True, null=True)
    chosen = models.IntegerField(blank=True, null=True)
    random = models.BooleanField()
    entries = JSONField()
    _original_location = None
    objects = models.Manager()

    def clean(self):
        if self.title == "":
            raise ValidationError("Name cannot be blank")

    def save(self, *args, **kwargs):
        self.full_clean(["entries"])
        super(MeetupEvent, self).save(*args, **kwargs)

    def convert_entries_to_string(self):
        categories = ""
        for i, key in enumerate(self.entries):
            category = Category.objects.get(api_label=key)
            MeetupCategory.objects.create(
                event=self, category=category, meetup=self.meetup
            )
            if i == len(self.entries) - 1:
                categories += key
            else:
                categories += key + ","
        return categories

    def request_yelp_api(self):
        categories = self.convert_entries_to_string()
        params = {
            "latitude": self.meetup.latitude,
            "longitude": self.meetup.longitude,
            "limit": 30,
            "categories": categories,
            "radius": self.distance,
            "price": self.price,
            "open_at": int(format(self.start, "U")),
        }
        response = requests.get(url=url, params=params, headers=headers)

        options = []
        if "businesses" in response.json():
            options = response.json()["businesses"]

        return options

    # Put restaurant in database along with categories
    def create_option_with_restaurant(self, option):
        identifier = option["id"]
        try:
            restaurant = Restaurant.objects.get(identifier=identifier)
        except Restaurant.DoesNotExist:
            info = {
                "identifier": identifier,
                "name": option["name"],
                "yelp_image": option["image_url"],
                "yelp_url": option["url"],
                "rating": (option["rating"] * 2) - 1,
                "latitude": option["coordinates"]["latitude"],
                "longitude": option["coordinates"]["longitude"],
                "price": self.SERIALIZED_PRICE_CHOICES[option.get("price", "$$")],
                "phone": option.get('display_phone', '818-240-4200'),
                "location": " ".join(option["location"]["display_address"]),
                "categories": json.dumps(option["categories"]),
                "city": option["location"]["city"],
                "country": option["location"]["country"],
                "state": option["location"]["state"],
                "zipcode": option["location"]["zip_code"],
                "address1": option["location"]["address1"],
            }

            restaurant = Restaurant.objects.create(**info)
            
            for category in option["categories"]:
                try:
                    category = Category.objects.get(api_label=category["alias"])
                    RestaurantCategory.objects.create(
                        category=category, restaurant=restaurant
                    )
                except Category.DoesNotExist:
                    pass
                

        option, created = MeetupEventOption.objects.get_or_create(
            event=self, restaurant=restaurant
        )
        return option

    def generate_options(self):
        # Get Options
        options = self.request_yelp_api()
        random.shuffle(options)

        for option in options[:4]:
            self.create_option_with_restaurant(option)

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
    event = models.ForeignKey(
        MeetupEvent, related_name="options", on_delete=models.CASCADE
    )
    option = models.TextField(null=True, blank=True)
    banned = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    restaurant = models.ForeignKey(
        Restaurant, related_name="meetup_options", null=True, on_delete=models.CASCADE
    )
    objects = models.Manager()

    conversion = {1: 1, 2: -1, 3: 0}

    def save(self, *args, **kwargs):
        if self.pk is None:
            self.restaurant.option_count += 1
            self.restaurant.save()
        super(MeetupEventOption, self).save(*args, **kwargs)

    def handle_vote(self, status, member):
        # Check if user has voted already and delete vote
        used_ban = member.used_ban()
        votes = MeetupEventOptionVote.objects.filter(option=self, member=member)

        # Handle if no vote
        if len(votes) == 0:
            # Option is votable
            if not self.banned:
                if (used_ban and status != 3) or not used_ban:
                    MeetupEventOptionVote.objects.create(
                        option=self, member=member, status=status
                    )
                    self.score += self.conversion[status]
                    if not used_ban and status == 3:
                        member.ban = True
                        self.banned = True

        # Handle if voted on already
        elif len(votes) == 1:
            vote = votes[0]
            # Not votable
            if self.banned:
                if vote.status == 3:
                    vote.delete()
                    member.ban = False
                    self.banned = False
                    if status != 3:
                        MeetupEventOptionVote.objects.create(
                            option=self, member=member, status=status
                        )
                        self.score += self.conversion[status]
            # Votable
            else:
                if status != vote.status:
                    if status != 3 or (status == 3 and not used_ban):
                        vote.delete()
                        self.score -= self.conversion[vote.status]
                        MeetupEventOptionVote.objects.create(
                            option=self, member=member, status=status
                        )
                        self.score += self.conversion[status]
                        if status == 3 and not used_ban:
                            member.ban = True
                            self.banned = True
                else:
                    vote.delete()
                    self.score -= self.conversion[vote.status]

        member.save()
        self.save()

class OptionVoteChoice(Enum):
    LIKE = 1
    DISLIKE = 2
    BAN = 3

    @classmethod
    def choices(cls):
        choices = []

        for item in cls:
            choices.append((item.name, item.value))

        return tuple(choices)


class MeetupEventOptionVote(models.Model):
    option = models.ForeignKey(
        MeetupEventOption, related_name="event_votes", on_delete=models.CASCADE
    )
    member = models.ForeignKey(
        MeetupMember, related_name="member_votes", on_delete=models.CASCADE
    )
    status = models.IntegerField(choices=OptionVoteChoice.choices())
    objects = models.Manager()


class MeetupCategory(models.Model):
    meetup = models.ForeignKey(
        Meetup, related_name="meetup_categories", on_delete=models.CASCADE
    )
    event = models.ForeignKey(
        MeetupEvent, related_name="event_categories", on_delete=models.CASCADE
    )
    category = models.ForeignKey(
        Category, related_name="meetup_events", on_delete=models.CASCADE
    )
    objects = models.Manager()


@receiver(pre_save, sender=Meetup)
def set_notification_for_meetup(sender, instance, **kwargs):
    if instance.id:
        previous = Meetup.objects.get(pk=instance.id)
        potential_changes = []

        if previous.location != instance.location:
            potential_changes.append(
                "changed meetup location from %s to %s"
                % (previous.location, instance.location)
            )

        if previous.date != instance.date:
            potential_changes.append(
                "changed meetup date from %s to %s"
                % (str(previous.date), str(instance.date))
            )

        if previous.public != instance.public:
            if instance.public:
                potential_changes.append("changed meetup from private to public")
            else:
                potential_changes.append("changed meetup from public to private")

        if previous.name != instance.name:
            potential_changes.append(
                "changed meetup name from %s to %s" % (previous.name, instance.name)
            )

        instance._meetup_notification = potential_changes

@receiver(post_save, sender=Meetup)
def meetup_post_save(sender, instance, created, **kwargs):
    from ..serializers import MessageSerializer
    from social.models import Activity
    from .chat import ChatRoomMember, ChatRoomMessage, ChatRoom
    
    if created:
        uri, name, creator = instance.uri, instance.name, instance.creator
        # Create Chat Room For Meetup
        room = ChatRoom.objects.create(uri=uri, name=name, meetup=instance)
        ChatRoomMember.objects.create(room=room, user=creator)

        # Create Meetup Chat Message --> Ex. User created Meetup x days ago
        message = "created meetup named %s" % (instance.name)
        ChatRoomMessage.objects.create(
            room=room, sender=creator, is_notif=True, message=message
        )

        if instance.public:
            # Create User Activity --> Ex. User created Meetup x days ago
            Activity.objects.create(
                actor=creator,
                verb="created",
                action_object=instance,
                description="meetup",
            )
    else:
        # Get User Who Completed Action
        user = get_user() or instance.creator
        member = MeetupMember.objects.get(meetup=instance, user=user)
        room = ChatRoom.objects.get(uri=instance.uri)

        # Create Meetup Chat Message --> Member set changes to Meetup x days ago
        for change in instance._meetup_notification:
            msg = ChatRoomMessage.objects.create(
                sender=user, room=room, is_notif=True, message=change
            )

            content = {
                "command": "new_message", 
                "message": MessageSerializer(msg).data
            }

            async_to_sync(channel_layer.group_send)(
                "chat_%s" % instance.uri, 
                {
                    "type": "chat_message", 
                    "message": content
                }
            )


@receiver(post_save, sender=MeetupMember)
def meetup_member_post_save(sender, instance, created, **kwargs):
    from ..serializers import MeetupMemberSerializer, MessageSerializer
    from social.models import Activity
    from .chat import ChatRoomMember, ChatRoomMessage, ChatRoom

    meetup, user = instance.meetup, instance.user
    serializer = MeetupMemberSerializer(instance)

    if created and user != meetup.creator:
        room = ChatRoom.objects.get(uri=meetup.uri)
        ChatRoomMember.objects.create(room=room, user=user)

        if meetup.public:
            # Create User Activity --> Ex. User joined Meetup
            Activity.objects.create(
                actor = user,
                action_object = meetup,
                description="meetup",
                verb="joined"
            )

        # Create Meetup Activity --> Ex. Member joined Meetup
        message = "joined the meetup."
        msg = ChatRoomMessage.objects.create(
            sender=user, room=room, is_notif=True, message=message
        )

        # Send Meetup Activity To Meetup Channel
        content = {
            "command": "new_message", 
            "message": MessageSerializer(msg).data
        }

        async_to_sync(channel_layer.group_send)(
            "chat_%s" % meetup.uri, 
            {
                "type": "chat_message", 
                "message": content
            }
        )

    # Send New/Updated Meetup Member Object to Meetup Channel
    content = {
        "command": "new_member",
        "message": {
            "meetup": meetup.uri, 
            "member": serializer.data
        }
    }

    async_to_sync(channel_layer.group_send)(
        "meetup_%s" % meetup.uri, 
        {
            "type": "meetup_event", 
            "meetup_event": content
        }
    )


@receiver(pre_delete, sender=MeetupMember)
def handle_delete_member(sender, instance, **kwargs):
    from ..serializers import MeetupMemberSerializer, MessageSerializer
    from .chat import ChatRoom, ChatRoomMessage

    meetup = instance.meetup
    user = get_user()
  
    # Delete existing MeetupInvite
    try:
        invite = MeetupInvite.objects.get(meetup=meetup, receiver=instance.user)
        invite.delete()
    except MeetupInvite.DoesNotExist:
        pass

    # Send New Members List to Meetup Channel
    members = MeetupMember.objects.filter(meetup=meetup).exclude(pk=instance.id)

    mapping = {}

    for member in members.all():
        mapping.update(MeetupMemberSerializer(member).data)

    content = {
        "command": "delete_member",
        "message": {
            "meetup": meetup.uri, 
            "members": mapping
        }
    }

    async_to_sync(channel_layer.group_send)(
        "meetup_%s" % meetup.uri, 
        {
            "type": "meetup_event", 
            "meetup_event": content
        }
    )

    # Create Meetup Activity --> Ex.User Left Meetup or Member Kicked Member
    if user == instance.user:
        message = "left the meetup."
    else:
        member = MeetupMember.objects.get(user=user, meetup=meetup)
        message = "removed %s %s from the meetup." % (
            instance.user.first_name,
            instance.user.last_name,
        )

    room = ChatRoom.objects.get(uri=meetup.uri)
    msg = ChatRoomMessage.objects.create(
        sender=user, message=message, room=room, is_notif=True
    )
    
    #Send Meetup Activity To Meetup Channel
    content = {
        "command": "new_message", 
        "message": MessageSerializer(msg).data
    }

    async_to_sync(channel_layer.group_send)(
        "chat_%s" % meetup.uri, 
        {
            "type": "chat_message",
            "message": content
        }
    )

@receiver(pre_save, sender=MeetupEvent)
def handle_generate_options_on_meetup_event_field_change(sender, instance, **kwargs):
    if instance.id is None:
        instance._meetup_notification = ["created an event named %s" % (instance.title)]
    else:
        previous = MeetupEvent.objects.get(pk=instance.id)
        does_change_warrant_new_options = False
        potential_changes = []

        if previous.title != instance.title:
            potential_changes.append(
                "changed name of event from %s to %s" % (previous.title, instance.title)
            )

        if previous.price != instance.price:
            does_change_warrant_new_options = True
            potential_changes.append(
                "changed price of event %s from %s to %s"
                % (instance.title, previous.price, instance.price)
            )

        if previous.distance != instance.distance:
            does_change_warrant_new_options = True
            potential_changes.append(
                "changed distance of event %s from %d to %d"
                % (instance.title, previous.distance, instance.distance)
            )

        if previous.entries != instance.entries:
            does_change_warrant_new_options = True
            previous_entries = ",".join(previous.entries.keys())
            instance_entries = ",".join(instance.entries.keys())
            previous.event_categories.all().delete()
            potential_changes.append(
                "changed categories of event %s from %s to %s"
                % (instance.title, previous_entries, instance_entries)
            )

        if previous.start != instance.start:
            potential_changes.append(
                "changed start time of event %s" % (instance.title)
            )

        if previous.end != instance.end:
            potential_changes.append("changed end time of event %s" % (instance.title))

        if not previous.random and instance.random:
            does_change_warrant_new_options = True
            potential_changes.append(
                "changed event %s to give random choices" % (instance.title)
            )

        if previous.random and not instance.random:
            instance.delete_options()
            potential_changes.append(
                "changed event %s to not give random choices" % (instance.title)
            )

        if does_change_warrant_new_options:
            instance.delete_options()
            instance.generate_options()

        instance._meetup_notification = potential_changes

        if previous.chosen != instance.chosen:
            instance._meetup_notification = "chosen changed"


@receiver(post_save, sender=MeetupEvent)
def handle_notif_on_meetup_event_create(sender, instance, created, **kwargs):
    from ..serializers import (
        MeetupEventSerializer,
        MessageSerializer
    )
    from .chat import ChatRoomMessage, ChatRoom
    from social.models import Notification
    from social.serializers import NotificationSerializer
    from social.models import Activity

    meetup = instance.meetup

    if created:
        # If random is set then generate options, otherwise No Options Needed.
        if instance.random:
            instance.generate_options()
        else:
            instance.convert_entries_to_string()

        if meetup.public:

            # Create User Activity --> Ex. User created Event
            Activity.objects.create(
                actor = instance.creator.user,
                action_object = instance,
                target = meetup,
                description="meetup",
                verb="created event"
            )

            # Send User Notification To All Members of Meetup If Event Created
            for member in meetup.members.all():
                if member != instance.creator:
                    user = member.user

                    notification = Notification.objects.create(
                        recipient = user,
                        actor = instance.creator,
                        description="meetup",
                        verb=instance._meetup_notification[0],
                        target=meetup,
                        action_object=instance
                    )

                    content = {
                        "command": "create_notif", 
                        "message": NotificationSerializer(notification).data
                    }

                    async_to_sync(channel_layer.group_send)(
                        "notif_room_for_user_%d" % user.id,
                        {
                            "type": "notifications", 
                            "message": content
                        }
                    )

    # Create Meetup Chat Message --> Member did something to Something on Meetup
    if instance._meetup_notification != "chosen changed":
        user = get_user() or instance.creator.user
        room = ChatRoom.objects.get(uri=meetup.uri)

        for change in instance._meetup_notification:
            msg = ChatRoomMessage.objects.create(
                sender=user, room=room, is_notif=True, message=change
            )

            content = {
                "command": "new_message", 
                "message": MessageSerializer(msg).data
            }

            async_to_sync(channel_layer.group_send)(
                "chat_%s" % meetup.uri, 
                {
                    "type": "chat_message", 
                    "message": content
                }
            )

    # Send New Event Object To Meetup Channel
    content = {
        "command": "new_event",
        "message": {
            "meetup": meetup.uri,
            "event": {instance.id: MeetupEventSerializer(instance).data},
        },
    }

    async_to_sync(channel_layer.group_send)(
        "meetup_%s" % meetup.uri, 
        {
            "type": "meetup_event", 
            "meetup_event": content
        }
    )