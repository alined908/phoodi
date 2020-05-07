from meetup.models import *
from notifications.models import Notification
from channels.layers import get_channel_layer
from django.db.models.signals import post_save, pre_save, pre_delete
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from notifications.signals import notify
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
import inspect

channel_layer = get_channel_layer()
conversion = {1: 1, 2: -1}


def get_user():
    for frame_record in inspect.stack():
        if frame_record[3] == "get_response":
            request = frame_record[0].f_locals["request"]
            break
        else:
            request = None

    return request.user


@receiver(pre_save, sender=Meetup)
def set_notification_for_meetup(sender, instance, **kwargs):
    if instance.id:
        print(instance.id)
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
    from .serializers import MessageSerializer

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

        # Create User Activity --> Ex. User created Meetup x days ago
        notify.send(
            sender=creator,
            recipient=creator,
            action_object=instance,
            description="user_activity",
            verb="created",
        )
    else:
        # Get User Who Completed Action
        user = get_user()
        member = MeetupMember.objects.get(meetup=instance, user=user)
        room = ChatRoom.objects.get(uri=instance.uri)

        # Create Meetup Chat Message --> Member set changes to Meetup x days ago
        for change in instance._meetup_notification:
            msg = ChatRoomMessage.objects.create(
                sender=user, room=room, is_notif=True, message=change
            )

            content = {"command": "new_message", "message": MessageSerializer(msg).data}

            async_to_sync(channel_layer.group_send)(
                "chat_%s" % instance.uri, {"type": "chat_message", "message": content}
            )


@receiver(post_save, sender=MeetupMember)
def meetup_member_post_save(sender, instance, created, **kwargs):
    from .serializers import MeetupMemberSerializer, MessageSerializer

    meetup, user = instance.meetup, instance.user
    serializer = MeetupMemberSerializer(instance)

    if created and user != meetup.creator:
        room = ChatRoom.objects.get(uri=meetup.uri)
        ChatRoomMember.objects.create(room=room, user=user)

        # Create Meetup Activity --> Ex. Member joined Meetup
        message = "joined the meetup."
        msg = ChatRoomMessage.objects.create(
            sender=user, room=room, is_notif=True, message=message
        )

        # Create User Activity --> Ex. User joined Meetup
        notify.send(
            sender=user,
            recipient=user,
            action_object=meetup,
            description="user_activity",
            verb="joined",
        )

        # Send Meetup Activity To Meetup Channel
        content = {"command": "new_message", "message": MessageSerializer(msg).data}

        async_to_sync(channel_layer.group_send)(
            "chat_%s" % meetup.uri, {"type": "chat_message", "message": content}
        )

    # Send New/Updated Meetup Member Object to Meetup Channel
    content = {
        "command": "new_member",
        "message": {"meetup": meetup.uri, "member": serializer.data},
    }

    async_to_sync(channel_layer.group_send)(
        "meetup_%s" % meetup.uri, {"type": "meetup_event", "meetup_event": content}
    )


@receiver(pre_delete, sender=MeetupMember)
def handle_delete_member(sender, instance, **kwargs):
    from .serializers import MeetupMemberSerializer, MessageSerializer

    meetup = instance.meetup
    user = get_user()
    print(user)

    # Delete existing MeetupInvite
    try:
        invite = MeetupInvite.objects.get(meetup=meetup, receiver=instance.user)
        invite.delete()
    except ObjectDoesNotExist:
        pass

    # Send New Members List to Meetup Channel
    members = MeetupMember.objects.filter(meetup=meetup).exclude(pk=instance.id)
    mapping = {}
    for member in members.all():
        mapping.update(MeetupMemberSerializer(member).data)

    content = {
        "command": "delete_member",
        "message": {"meetup": meetup.uri, "members": mapping},
    }

    async_to_sync(channel_layer.group_send)(
        "meetup_%s" % meetup.uri, {"type": "meetup_event", "meetup_event": content}
    )

    # Create User Activity --> Ex. User Left Meetuo
    # Create Meetup Activity --> Ex.User Left Meetup or Member Kicked Member
    if user == instance.user:
        notify.send(
            sender=user,
            recipient=user,
            action_object=meetup,
            description="user_activity",
            verb="left",
        )
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

    # Send Meetup Activity To Meetup Channel
    content = {"command": "new_message", "message": MessageSerializer(msg).data}

    async_to_sync(channel_layer.group_send)(
        "chat_%s" % meetup.uri, {"type": "chat_message", "message": content}
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
    from .serializers import (
        MeetupEventSerializer,
        NotificationSerializer,
        MessageSerializer,
    )

    meetup = instance.meetup
    if created:
        # If random is set then generate options, otherwise No Options Needed.
        if instance.random:
            instance.generate_options()
        else:
            instance.convert_entries_to_string()

        # Create User Activity --> Ex. User created Event
        notify.send(
            sender=instance.creator.user,
            recipient=instance.creator.user,
            verb="created event",
            description="user_activity",
            action_object=instance,
            target=meetup,
        )

        # Send User Notification To All Members of Meetup If Event Created
        for member in meetup.members.all():
            if member != instance.creator:
                user = member.user
                notify.send(
                    sender=instance.creator,
                    recipient=user,
                    description="meetup",
                    action_object=instance,
                    target=meetup,
                    verb=instance._meetup_notification,
                )
                unread_meetup_notifs = user.notifications.filter(
                    description="meetup"
                ).unread()
                count = unread_meetup_notifs.count()
                content = {"command": "fetch_notifs", "message": {"meetup": count}}
                async_to_sync(channel_layer.group_send)(
                    "notif_room_for_user_%d" % user.id,
                    {"type": "notifications", "message": content},
                )

    # Create Meetup Chat Message --> Member did something to Something on Meetup
    if instance._meetup_notification != "chosen changed":
        user = get_user()
        room = ChatRoom.objects.get(uri=meetup.uri)

        for change in instance._meetup_notification:
            msg = ChatRoomMessage.objects.create(
                sender=user, room=room, is_notif=True, message=change
            )

            content = {"command": "new_message", "message": MessageSerializer(msg).data}

            async_to_sync(channel_layer.group_send)(
                "chat_%s" % meetup.uri, {"type": "chat_message", "message": content}
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
        "meetup_%s" % meetup.uri, {"type": "meetup_event", "meetup_event": content}
    )


@receiver(post_save, sender=MeetupEventOption)
def post_save_meetup_option(sender, instance, created, **kwargs):
    if created:
        restaurant = instance.restaurant
        restaurant.option_count += 1
        restaurant.save()


@receiver(post_save, sender=Review)
def post_save_review(sender, instance, created, **kwargs):
    if created:
        restaurant = instance.restaurant
        restaurant.rating = (
            (restaurant.rating * restaurant.review_count) + float(instance.rating)
        ) / (restaurant.review_count + 1)
        restaurant.review_count += 1
        restaurant.save()


@receiver(post_save, sender=Comment)
def post_save_comment(sender, instance, created, **kwargs):
    if created:
        restaurant = instance.restaurant
        restaurant.comment_count += 1
        restaurant.save()


@receiver(pre_save, sender=ReviewVote)
def pre_save_review_vote(sender, instance, **kwargs):
    if instance.id:
        previous = ReviewVote.objects.get(pk=instance.id)
        instance._old_vote = previous.vote


@receiver(pre_save, sender=CommentVote)
def pre_save_comment_vote(sender, instance, **kwargs):
    if instance.id:
        previous = CommentVote.objects.get(pk=instance.id)
        instance._old_vote = previous.vote


@receiver(post_save, sender=ReviewVote)
def post_save_review_vote(sender, instance, created, **kwargs):
    review = instance.review

    if not created:
        review.vote_score -= instance._old_vote

    review.vote_score += instance.vote
    review.save()


@receiver(post_save, sender=CommentVote)
def post_save_comment_vote(sender, instance, created, **kwargs):
    comment = instance.comment

    if not created:
        comment.vote_score -= instance._old_vote

    comment.vote_score += instance.vote
    comment.save()


@receiver(post_save, sender=MeetupInvite)
def create_notif_meetup_inv(sender, instance, created, **kwargs):
    if created:
        notify.send(
            sender=instance.sender,
            recipient=instance.receiver,
            description="meetup_inv",
            action_object=instance,
            verb="%s sent meetup invite to %s"
            % (instance.sender.email, instance.receiver.email),
        )
    else:
        notif = instance.receiver.notifications.filter(
            action_object_object_id=instance.id, description="meetup_inv"
        )
        notif.mark_all_as_read()

    unread_inv_notifs = instance.receiver.notifications.filter(
        description="meetup_inv"
    ).unread()
    count = unread_inv_notifs.count()
    content = {"command": "fetch_notifs", "message": {"meetup_inv": count}}
    async_to_sync(channel_layer.group_send)(
        "notif_room_for_user_%d" % instance.receiver.id,
        {"type": "notifications", "message": content},
    )


@receiver(post_save, sender=FriendInvite)
def create_notif_friend_inv(sender, instance, created, **kwargs):
    if created:
        notify.send(
            sender=instance.sender,
            recipient=instance.receiver,
            description="friend_inv",
            action_object=instance,
            verb="%s sent friend invite to %s"
            % (instance.sender.email, instance.receiver.email),
        )
    else:
        notif = instance.receiver.notifications.filter(
            action_object_object_id=instance.id, description="friend_inv"
        )
        notif.mark_all_as_read()

    unread_inv_notifs = instance.receiver.notifications.filter(
        description="friend_inv"
    ).unread()
    count = unread_inv_notifs.count()
    content = {"command": "fetch_notifs", "message": {"friend_inv": count}}
    async_to_sync(channel_layer.group_send)(
        "notif_room_for_user_%d" % instance.receiver.id,
        {"type": "notifications", "message": content},
    )


@receiver(post_save, sender=Friendship)
def create_chat_room_for_friendship(sender, instance, created, **kwargs):
    if created:
        # Create Chat Room for Friends
        room = ChatRoom.objects.create(friendship=instance)
        ChatRoomMember.objects.create(room=room, user=instance.creator)
        ChatRoomMember.objects.create(room=room, user=instance.friend)

        params_friend = {
            "sender": instance.friend,
            "recipient": instance.friend,
            "action_object": instance.creator,
            "verb": "became friends with",
        }
        params_creator = {
            "sender": instance.creator,
            "recipient": instance.creator,
            "action_object": instance.friend,
            "verb": "became friends with",
        }
        # Create User Notification
        notify.send(description="friend", **params_friend)
        notify.send(description="friend", **params_creator)

        # Create User Activity --> Ex. User became friends with User x days ago
        notify.send(description="user_activity", **params_friend)
        notify.send(description="user_activity", **params_creator)

        # Get Amount of Unread Friend Notifs
        unread_friend_notifs_for_creator = (
            instance.creator.notifications.filter(description="friend").unread().count()
        )
        unread_friend_notifs_for_friend = (
            instance.friend.notifications.filter(description="friend").unread().count()
        )

        # Send Friend Notifs Amount To User
        content = {
            "command": "fetch_notifs",
            "message": {"friend": unread_friend_notifs_for_creator},
        }
        async_to_sync(channel_layer.group_send)(
            "notif_room_for_user_%d" % instance.creator.id,
            {"type": "notifications", "message": content},
        )

        # Send Friend Notifs Amount To User
        content = {
            "command": "fetch_notifs",
            "message": {"friend": unread_friend_notifs_for_friend},
        }

        async_to_sync(channel_layer.group_send)(
            "notif_room_for_user_%d" % instance.friend.id,
            {"type": "notifications", "message": content},
        )


@receiver(post_save, sender=ChatRoom)
def post_save_chat_room(sender, instance, created, **kwargs):
    from .serializers import ChatRoomSerializer

    for member in instance.members.all():
        serializer = ChatRoomSerializer(instance, context={"user": member.user})

        content = {
            "command": "update_room",
            "message": {"room": {instance.uri: serializer.data}},
        }

        async_to_sync(channel_layer.group_send)(
            "chat_contacts_for_user_%d" % member.user.id,
            {"type": "chat_rooms", "message": content},
        )


@receiver(post_save, sender=ChatRoomMessage)
def create_notif_chat_message(sender, instance, created, **kwargs):
    if created:
        room = instance.room
        room.last_updated = timezone.now()
        room.save()

        for member in instance.room.members.all():
            if member.user != instance.sender:
                notify.send(
                    sender=instance.sender,
                    recipient=member.user,
                    description="chat_message",
                    action_object=instance.room,
                    verb="%s sent chat message to %s"
                    % (instance.sender.email, member.user.email),
                )
                unread_chat_notifs = member.user.notifications.filter(
                    description="chat_message"
                ).unread()
                count = unread_chat_notifs.count()
                content = {
                    "command": "fetch_notifs",
                    "message": {"chat_message": count},
                }
                async_to_sync(channel_layer.group_send)(
                    "notif_room_for_user_%d" % member.user.id,
                    {"type": "notifications", "message": content},
                )
