import os.path, geocoder, inspect
from uuid import uuid4
from ipware import get_client_ip
from meetup.models import Category
from django.db.models.expressions import RawSQL
from django.utils.deconstruct import deconstructible
from django.core.mail import get_connection, EmailMultiAlternatives

def get_user():
    for frame_record in inspect.stack():
        if frame_record[3] == "get_response":
            request = frame_record[0].f_locals["request"]
            break
        else:
            request = None

    if not request:
        return None

    return request.user

def convert_string_to_category_ids(categories):

    if categories:
        try:
            category_ids = [int(x) for x in categories.split(",")]
        except:
            category = Category.objects.get(api_label=categories)
            category_ids = [category.id]
    else:
        category_ids = []

    return category_ids

def get_user_coordinates(coords, request):
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

    return latitude, longitude, radius

def nearby_public_entities(coords, request, categories, num_results, table):
    
    category_ids = convert_string_to_category_ids(categories)
    latitude, longitude, radius = get_user_coordinates(coords, request)

    if not latitude or not longitude:
        return []

    if table == "restaurant":
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
    elif table == "meetup":
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
            (latitude, longitude, latitude, radius, num_results),
        )

    return distance_query, category_ids


def generate_unique_uri():
    return str(uuid4()).replace("-", "")[:15]

def send_mass_html_mail(
    datatuple, fail_silently=False, user=None, password=None, connection=None
):
    """
    Given a datatuple of (subject, text_content, html_content, from_email,
    recipient_list), sends each message to each recipient list. Returns the
    number of emails sent.

    If from_email is None, the DEFAULT_FROM_EMAIL setting is used.
    If auth_user and auth_password are set, they're used to log in.
    If auth_user is None, the EMAIL_HOST_USER setting is used.
    If auth_password is None, the EMAIL_HOST_PASSWORD setting is used.
    """
    connection = connection or get_connection(
        username=user, password=password, fail_silently=fail_silently
    )
    messages = []
    for subject, text, html, from_email, recipient in datatuple:
        message = EmailMultiAlternatives(subject, text, from_email, recipient)
        message.attach_alternative(html, "text/html")
        messages.append(message)
    return connection.send_messages(messages)


@deconstructible
class PathAndRename(object):
    def __init__(self, sub_path):
        self.path = sub_path

    def __call__(self, instance, filename):
        ext = filename.split(".")[-1]
        # set filename as random string
        filename = "{}.{}".format(uuid4().hex, ext)
        # return the whole path to the file
        return os.path.join(self.path, filename)


path_and_rename_avatar = PathAndRename("avatar")
path_and_rename_category = PathAndRename("category")
path_and_rename_general = PathAndRename('general')
