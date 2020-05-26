from django.db import models
from meetup.helpers import generate_unique_uri, send_mass_html_mail
from django.contrib.postgres.fields import JSONField
from .user import User
from .restaurant import Restaurant, RestaurantCategory
from .category import Category
from ipware import get_client_ip
from django.template.loader import render_to_string
from django.conf import settings
from django.db.models.expressions import RawSQL
from django.utils.dateformat import format
from django.core.exceptions import ObjectDoesNotExist, ValidationError
import requests, random, json, geocoder, datetime, re
from django.db.models import Q

BASE_URL = settings.BASE_URL
url = "https://api.yelp.com/v3/businesses/search"
headers = {"Authorization": "Bearer " + settings.YELP_API_KEY}

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
                WHERE distance < %s \
                ORDER BY distance \
                OFFSET 0 \
                LIMIT %s",
            (
                latitude,
                longitude,
                latitude,
                radius,
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
