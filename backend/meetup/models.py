from django.db import models
from django.core.mail import send_mail, send_mass_mail, EmailMultiAlternatives
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils.timezone import now
from backend.settings import YELP_API_KEY, BASE_URL, BASE_DEV_URL
from django.utils.dateformat import format
from uuid import uuid4
from django.core.exceptions import ObjectDoesNotExist
import requests, random, json, sys, time, os, geocoder, datetime, re
from django.contrib.postgres.fields import JSONField, ArrayField
from django.db import transaction
from django.db.models import F, Q
from django.db.models.expressions import RawSQL
from .helpers import (
    path_and_rename_avatar,
    path_and_rename_category,
    send_mass_html_mail,
)
from PIL import Image
from io import BytesIO
from ipware import get_client_ip
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.template.loader import render_to_string

url = "https://api.yelp.com/v3/businesses/search"
headers = {"Authorization": "Bearer " + YELP_API_KEY}


def generate_unique_uri():
    return str(uuid4()).replace("-", "")[:15]


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
    created_at = models.DateTimeField(auto_now_add=True)

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
        return super(Meetup, self).save(*args, **kwargs)

    @staticmethod
    def get_private(user, categories, start, end):
        category_ids = [int(x) for x in categories.split(",")] if categories else []

        if not category_ids:
            meetups = Meetup.objects.filter(
                id__in=RawSQL(
                    "SELECT member.meetup_id as id FROM meetup_meetupmember as member WHERE user_id = %s",
                    (user.id,),
                ),
                date__range=(start, end),
            ).order_by("date")
        else:
            meetups = Meetup.objects.filter(
                Q(
                    id__in=RawSQL(
                        "SELECT DISTINCT category.meetup_id \
                FROM meetup_meetupcategory as category \
                WHERE category_id = ANY(%s)",
                        (category_ids,),
                    )
                )
                & Q(
                    id__in=RawSQL(
                        "SELECT member.meetup_id as id \
                    FROM meetup_meetupmember as member \
                    WHERE user_id = %s",
                        (user.id,),
                    )
                )
                & Q(date__range=(start, end))
            ).order_by("date")

        return meetups

    @staticmethod
    def get_public(categories, coords, request, start, end, num_results=25):
        if categories:
            try:
                category_ids = [int(x) for x in categories.split(",")]
            except:
                category = Category.objects.get(api_label=categories)
                category_ids = [category.id]
        else:
            category_ids = []

        if request:
            client_ip, is_routable = get_client_ip(request)

            if client_ip:
                if is_routable:
                    geocode = geocoder.ip(client_ip)
                    location = geocode.latlng
                    lat, lng = location[0], location[1]
                else:
                    lat, lng = None, None

        latitude, longitude, radius = (
            coords[0] or lat,
            coords[1] or lng,
            coords[2] or 25,
        )

        if not latitude or not longitude:
            return []

        distance_query = RawSQL(
            " SELECT id FROM \
                (SELECT *, (3959 * acos(cos(radians(%s)) * cos(radians(latitude)) * \
                                        cos(radians(longitude) - radians(%s)) + \
                                        sin(radians(%s)) * sin(radians(latitude)))) \
                    AS distance \
                    FROM meetup_meetup) \
                AS distances \
                WHERE distance < %s AND date >= %s \
                ORDER BY distance \
                OFFSET 0 \
                LIMIT %s",
            (
                latitude,
                longitude,
                latitude,
                radius,
                datetime.datetime.now().date(),
                num_results,
            ),
        )

        if not category_ids:
            meetups = Meetup.objects.filter(
                public=True, id__in=distance_query, date__range=(start, end)
            ).order_by("date")
        else:
            meetups = Meetup.objects.filter(
                Q(public=True)
                & Q(
                    id__in=RawSQL(
                        "SELECT DISTINCT category.meetup_id \
                FROM meetup_meetupcategory as category \
                WHERE category_id = ANY(%s)",
                        (category_ids,),
                    )
                )
                & Q(id__in=distance_query)
                & Q(date__range=(start, end))
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
    meetup = models.ForeignKey(Meetup, related_name="events", on_delete=models.CASCADE)
    creator = models.ForeignKey(
        MeetupMember, related_name="created_events", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)
    distance = models.IntegerField()
    price = models.CharField(max_length=10)
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
        return super(MeetupEvent, self).save(*args, **kwargs)

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
        except ObjectDoesNotExist:
            info = {
                "identifier": identifier,
                "name": option["name"],
                "yelp_image": option["image_url"],
                "yelp_url": option["url"],
                "rating": (option["rating"] * 2) - 1,
                "latitude": option["coordinates"]["latitude"],
                "longitude": option["coordinates"]["longitude"],
                "price": option.get("price", "$$"),
                "phone": option["display_phone"],
                "location": " ".join(option["location"]["display_address"]),
                "categories": json.dumps(option["categories"]),
                "city": option["location"]["city"],
                "country": option["location"]["country"],
                "state": option["location"]["state"],
                "zipcode": option["location"]["zip_code"],
                "address1": option["location"]["address1"],
            }

            same_name_same_city_restaurants = Restaurant.objects.filter(
                name=info["name"], city=info["city"]
            ).count()
            urlify_name = re.sub(
                "'", "", re.sub(r"[^\w']", "-", re.sub("&", "and", info["name"]))
            ).lower()
            urlify_city = re.sub("'", "", re.sub(r"[^\w']", "-", info["city"])).lower()
            url = "%s-%s" % (urlify_name, urlify_city)

            if same_name_same_city_restaurants > 0:
                url += "-%s" % (same_name_same_city_restaurants + 1)

            info["url"] = url

            restaurant = Restaurant.objects.create(**info)

            for category in option["categories"]:
                try:
                    category = Category.objects.get(api_label=category["alias"])
                    RestaurantCategory.objects.create(
                        category=category, restaurant=restaurant
                    )
                except ObjectDoesNotExist:
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


class Restaurant(models.Model):
    identifier = models.CharField(max_length=100)
    name = models.TextField()
    yelp_image = models.TextField()
    yelp_url = models.TextField()
    url = models.TextField()
    rating = models.FloatField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    price = models.CharField(max_length=10)
    location = models.TextField()
    address1 = models.CharField(max_length=255, null=True, blank=True)
    address2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    zipcode = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    categories = models.TextField()
    review_count = models.IntegerField(default=0)
    option_count = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)
    objects = models.Manager()

    @staticmethod
    def get_nearby(coords, request, categories, num_results=16):
        if categories:
            try:
                category_ids = [int(x) for x in categories.split(",")]
            except:
                category = Category.objects.get(api_label=categories)
                category_ids = [category.id]
        else:
            category_ids = []

        if request:
            client_ip, is_routable = get_client_ip(request)

            if client_ip:
                if is_routable:
                    geocode = geocoder.ip(client_ip)
                    location = geocode.latlng
                    lat, lng = location[0], location[1]
                else:
                    lat, lng = None, None

        latitude, longitude, radius = (
            coords[0] or lat,
            coords[1] or lng,
            coords[2] or 25,
        )

        if not latitude or not longitude:
            return []

        distance_query = RawSQL(
            " SELECT id FROM \
                (SELECT *, (3959 * acos(cos(radians(%s)) * cos(radians(latitude)) * \
                                        cos(radians(longitude) - radians(%s)) + \
                                        sin(radians(%s)) * sin(radians(latitude)))) \
                    AS distance \
                    FROM meetup_restaurant) \
                AS distances \
                WHERE distance < %s \
                ORDER BY distance \
                OFFSET 0 \
                LIMIT %s",
            (latitude, longitude, latitude, radius, num_results),
        )

        if not category_ids:
            restaurants = Restaurant.objects.filter(id__in=distance_query).order_by("-rating")
        else:
            restaurants = Restaurant.objects.filter(
                Q(
                    id__in=RawSQL(
                        "SELECT DISTINCT category.restaurant_id \
                        FROM meetup_restaurantcategory as category \
                        WHERE category_id = ANY(%s)",
                        (category_ids,),
                    )
                )
                & Q(id__in=distance_query)
            ).order_by("-rating")
  
        return restaurants


class BaseComment(models.Model):
    text = models.CharField(max_length=1000)
    vote_score = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class Review(BaseComment):
    CHOICES = [(i, i) for i in range(1, 11)]
    user = models.ForeignKey(
        User, related_name="u_reviews", on_delete=models.SET_NULL, null=True
    )
    restaurant = models.ForeignKey(
        Restaurant, related_name="r_reviews", on_delete=models.CASCADE
    )
    rating = models.IntegerField(choices=CHOICES)


class Comment(BaseComment):
    user = models.ForeignKey(
        User, related_name="u_comments", on_delete=models.SET_NULL, null=True
    )
    restaurant = models.ForeignKey(
        Restaurant, related_name="rst_comments", on_delete=models.CASCADE
    )
    review = models.ForeignKey(
        Review, related_name="review_comments", on_delete=models.CASCADE
    )
    parent_comment = models.ForeignKey(
        "self", related_name="children", on_delete=models.SET_NULL, null=True
    )


class BaseVote(models.Model):
    class Vote(models.IntegerChoices):
        DOWN = -1
        UNVOTE = 0
        UP = 1

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vote = models.IntegerField(choices=Vote.choices)

    class Meta:
        abstract = True

class CommentVote(BaseVote):
    comment = models.ForeignKey(
        Comment, related_name="c_votes", on_delete=models.CASCADE
    )

class ReviewVote(BaseVote):
    review = models.ForeignKey(Review, related_name="r_votes", on_delete=models.CASCADE)

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


class MeetupEventOptionVote(models.Model):
    class Vote(models.IntegerChoices):
        LIKE = 1
        DISLIKE = 2
        BAN = 3

    option = models.ForeignKey(
        MeetupEventOption, related_name="event_votes", on_delete=models.CASCADE
    )
    member = models.ForeignKey(
        MeetupMember, related_name="member_votes", on_delete=models.CASCADE
    )
    status = models.IntegerField(choices=Vote.choices)
    objects = models.Manager()


class RestaurantPreference(models.Model):
    user = models.ForeignKey(
        User, related_name="preferred_restaurants", on_delete=models.CASCADE
    )
    restaurant = models.ForeignKey(
        Restaurant, related_name="likes", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=255)
    ranking = models.PositiveSmallIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    def reorder_preferences(self, new_rank):
        old_rank = self.ranking
        if old_rank == new_rank:
            pass
        elif old_rank < new_rank:
            RestaurantPreference.objects.filter(
                user=self.user, ranking__lte=new_rank, ranking__gte=old_rank
            ).update(ranking=F("ranking") - 1)
        else:
            RestaurantPreference.objects.filter(
                user=self.user, ranking__lte=old_rank, ranking__gte=new_rank
            ).update(ranking=F("ranking") + 1)
        self.ranking = new_rank
        self.save()

    def reorder_preferences_delete(self):
        RestaurantPreference.objects.filter(
            user=self.user, ranking__gt=self.ranking
        ).update(ranking=F("ranking") - 1)


class Invite(models.Model):
    class InviteStatus(models.IntegerChoices):
        OPEN = 1
        ACCEPTED = 2
        REJECTED = 3

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sent_%(class)ss",
        on_delete=models.CASCADE,
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="received_%(class)ss",
        on_delete=models.CASCADE,
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.IntegerField(
        choices=InviteStatus.choices, default=InviteStatus.OPEN
    )
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
                MeetupMember.objects.get_or_create(
                    meetup=self.meetup, user=self.receiver
                )
        super(MeetupInvite, self).save(force_insert, force_update, *args, **kwargs)


class FriendInvite(Invite):
    objects = models.Manager()

    def __init__(self, *args, **kwargs):
        super(FriendInvite, self).__init__(*args, **kwargs)

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        if self.status != Invite.InviteStatus.OPEN:
            if self.status == Invite.InviteStatus.ACCEPTED:
                Friendship.objects.get_or_create(
                    creator=self.sender, friend=self.receiver
                )
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
            image.save(output, format="PNG", quality=100)
            output.seek(0)
            self.image = InMemoryUploadedFile(
                output,
                "ImageField",
                "%s.png" % self.image.name,
                "image/png",
                sys.getsizeof(output),
                None,
            )
        self.full_clean()
        super(Category, self).save(*args, **kwargs)

    @staticmethod
    def get_popular():
        categories = Category.objects.filter(
            id__in=RawSQL(
                "SELECT p.id FROM (SELECT pref.category_id as id, COUNT(*) as num\
                FROM meetup_preference as pref \
                GROUP BY pref.category_id \
                ORDER BY COUNT(*) DESC) as p\
                LIMIT 11",
                params=(),
            )
        )
        return categories

    @staticmethod
    def get_random_many():
        categories = Category.objects.filter(
            id__in=RawSQL(
                "SELECT id \
                FROM meetup_category \
                ORDER BY random() \
                LIMIT 26",
                params=(),
            )
        )
        return categories

class RestaurantCategory(models.Model):
    restaurant = models.ForeignKey(
        Restaurant, related_name="r_categories", on_delete=models.CASCADE
    )
    category = models.ForeignKey(
        Category, related_name="c_restaurants", on_delete=models.CASCADE
    )
    objects = models.Manager()


class Preference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="preferences")
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    ranking = models.PositiveSmallIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    def reorder_preferences(self, new_rank):
        old_rank = self.ranking
        if old_rank == new_rank:
            pass
        elif old_rank < new_rank:
            Preference.objects.filter(
                user=self.user, ranking__lte=new_rank, ranking__gte=old_rank
            ).update(ranking=F("ranking") - 1)
        else:
            Preference.objects.filter(
                user=self.user, ranking__lte=old_rank, ranking__gte=new_rank
            ).update(ranking=F("ranking") + 1)
        self.ranking = new_rank
        self.save()

    def reorder_preferences_delete(self):
        Preference.objects.filter(user=self.user, ranking__gt=self.ranking).update(
            ranking=F("ranking") - 1
        )


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


class Friendship(models.Model):
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="friend_creators",
        on_delete=models.CASCADE,
    )
    friend = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="friends", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(default=now, editable=False)
    objects = models.Manager()


class ChatRoom(models.Model):
    friendship = models.ForeignKey(
        Friendship, null=True, blank=True, on_delete=models.CASCADE
    )
    meetup = models.ForeignKey(Meetup, null=True, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, null=True, blank=True)
    uri = models.URLField(default=generate_unique_uri)
    timestamp = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    def __str__(self):
        return self.uri


class ChatRoomMessage(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sent_msgs",
        on_delete=models.SET_NULL,
        null=True,
    )
    room = models.ForeignKey(
        ChatRoom, on_delete=models.CASCADE, related_name="messages"
    )
    is_notif = models.BooleanField(default=False)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    objects = models.Manager()

    def __str__(self):
        return self.message

    class Meta:
        ordering = ("timestamp",)


class ChatRoomMember(models.Model):
    room = models.ForeignKey(ChatRoom, related_name="members", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="rooms", on_delete=models.CASCADE)
    objects = models.Manager()
