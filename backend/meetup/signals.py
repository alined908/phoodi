from .models import User, ChatRoom, MeetupCategory, ChatRoomMessage, ChatRoomMember, MeetupMember, MeetupEventOptionVote, Meetup, MeetupEvent, MeetupEventOption, MeetupInvite, FriendInvite, Friendship
from notifications.models import Notification
from channels.layers import get_channel_layer
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from notifications.signals import notify

channel_layer = get_channel_layer()
conversion = {1: 1, 2: -1}

# @receiver(pre_save, sender = Meetup)
# def set_notification_for_meetup(sender, instance, **kwargs):
#     if instance.id is None:
#         instance._meetup_notification = ""

@receiver(post_save, sender = Meetup)
def meetup_post_save(sender, instance, created, **kwargs):
    from .serializers import NotificationSerializer

    if created:

        uri, name, creator = instance.uri, instance.name, instance.creator
        #Create Chat Room For Meetup
        room = ChatRoom.objects.create(uri=uri, name=name, meetup=instance)
        ChatRoomMember.objects.create(room = room, user = creator)

        #Create Meetup Activity --> Ex. User created Meetup x days ago
        notify.send(
            sender = creator, recipient = creator, action_object = instance,
            description="meetup_activity", verb="created"
        )

        #Create User Activity --> Ex. User created Meetup x days ago
        notify.send(
            sender = creator, recipient = creator, action_object = instance,
            description="user_activity", verb="created"
        )

@receiver(post_save, sender=MeetupMember)
def meetup_member_post_save(sender, instance, created, **kwargs):
    from .serializers import MeetupMemberSerializer, NotificationSerializer
    meetup, user = instance.meetup, instance.user
    
    if created and user != meetup.creator:
        room = ChatRoom.objects.get(uri=meetup.uri) 
        ChatRoomMember.objects.create(room = room, user = user)
        serializer = MeetupMemberSerializer(instance)
    
        #Create Meetup Activity --> Ex. Member joined Meetup
        notify.send(
            sender=instance, recipient = user, action_object = meetup,
            description="meetup_activity", verb="joined"
        )

        #Create User Activity --> Ex. User joined Meetup
        notify.send(
            sender=user, recipient= user, action_object = meetup,
            description="user_activity", verb="joined"
        )
        
        #Get Meetup Activity to Send
        notification = Notification.objects.filter(
            action_object_object_id=meetup.id, 
            description="meetup_activity"
        ).first()
    
        #Send Meetup Activity To Meetup Channel
        content = {
            'command': 'new_meetup_activity',
            'message': {
                'meetup': meetup.uri,
                'notification': NotificationSerializer(notification).data
            }
        }

        async_to_sync(channel_layer.group_send)('meetup_%s' % meetup.uri, {
            'type': 'meetup_event',
            'meetup_event': content
        })
     
        #Send New Meetup Member Object to Meetup Channel
        content = {
            'command': 'new_member',
            'message': {
                'meetup': meetup.uri, 
                'member': serializer.data
            }
        }

        async_to_sync(channel_layer.group_send)('meetup_%s' % meetup.uri, {
             'type': 'meetup_event',
             'meetup_event': content
        })
     
@receiver(pre_save, sender = MeetupEvent)
def handle_generate_options_on_meetup_event_field_change(sender, instance, **kwargs):
    if instance.id is None:
        instance._meetup_notification = "created event"
    else:
        previous = MeetupEvent.objects.get(pk=instance.id)
        does_change_warrant_new_options = False
        notification_message = 'set changes on'
        potential_changes = []

        if previous.price != instance.price:
            does_change_warrant_new_options = True
            potential_changes.append('price')

        if previous.distance != instance.distance:
            does_change_warrant_new_options = True
            potential_changes.append('distance')

        if previous.entries != instance.entries:
            does_change_warrant_new_options = True
            previous.event_categories.all().delete()
            potential_changes.append('entries')

        if previous.start != instance.start:
            does_change_warrant_new_options = True
            potential_changes.append('start')

        if previous.end != instance.end:
            potential_changes.append("end")

        if not previous.random and instance.random:
            does_change_warrant_new_options = True
            potential_changes.append("random enabled")

        if previous.random and not instance.random:
            instance.delete_options()
            potential_changes.append("random disabled")

        if does_change_warrant_new_options:
            instance.delete_options()
            instance.generate_options()

        instance._meetup_notification = notification_message + " " + " , ".join(potential_changes)

        if previous.chosen != instance.chosen:
            instance._meetup_notification = "chosen changed"
        
@receiver(post_save, sender = MeetupEvent)
def handle_notif_on_meetup_event_create(sender, instance, created, **kwargs):
    from .serializers import MeetupEventSerializer, NotificationSerializer
    meetup = instance.meetup
    
    if created:
        # If random is set then generate options, otherwise No Options Needed.
        if instance.random:
            instance.generate_options()
        else:
            instance.convert_entries_to_string()

        #Create User Activity --> Ex. User created Event 
        notify.send(
            sender=instance.creator.user, recipient=instance.creator.user, verb="created event", 
            description="user_activity", action_object=instance, target=meetup
        )

        #Send User Notification To All Members of Meetup If Event Created
        for member in meetup.members.all():
            if member != instance.creator:
                user = member.user
                notify.send(
                    sender=instance.creator, recipient=user, 
                    description="meetup", action_object=instance, target = meetup,
                    verb=instance._meetup_notification
                )
                unread_meetup_notifs = user.notifications.filter(description="meetup").unread()  
                count = unread_meetup_notifs.count()  
                content = {
                    'command': 'fetch_notifs',
                    'message': {
                        "meetup": count
                    }
                }
                async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % user.id, {
                    'type': 'notifications',
                    'message': content
                })

    # Create Meetup Activity --> Member did something to Something on Meetup
    if instance._meetup_notification != "chosen changed":
        notify.send(
            sender = instance.creator, recipient=instance.creator.user, description="meetup_activity", 
            action_object = instance, target = meetup, verb=instance._meetup_notification
        )

        # Send Meetup Activity to Meetup Channel
        notif = Notification.objects.filter(action_object_object_id = instance.id, description="meetup_activity").first()

        content = {
            'command': 'new_meetup_activity',
            'message': {
                'meetup': meetup.uri,
                'notification': NotificationSerializer(notif).data
            }
        }

        async_to_sync(channel_layer.group_send)('meetup_%s' % meetup.uri, {
            'type': 'meetup_event',
            'meetup_event': content
        })

    # Send New Event Object To Meetup Channel
    content = {
        'command': 'new_event',
        'message': {
            'meetup': meetup.uri, 
            'event': {
                instance.id: MeetupEventSerializer(instance).data
            }
        }
    }

    async_to_sync(channel_layer.group_send)('meetup_%s' % meetup.uri, {
        'type': 'meetup_event',
        'meetup_event': content
    })

@receiver(post_save, sender = MeetupInvite)
def create_notif_meetup_inv(sender, instance, created, **kwargs):
    if created:
        notify.send(
            sender=instance.sender, recipient=instance.receiver, 
            description="meetup_inv", action_object = instance, 
            verb="%s sent meetup invite to %s" % (instance.sender.email,  instance.receiver.email)
        )
    else: 
        notif = instance.receiver.notifications.filter(
            action_object_object_id = instance.id, description="meetup_inv"
        )
        notif.mark_all_as_read()
    
    unread_inv_notifs =  instance.receiver.notifications.filter(description="meetup_inv").unread()  
    count = unread_inv_notifs.count()  
    content = {
        'command': 'fetch_notifs',
        'message': {
            "meetup_inv": count
        }
    }
    async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % instance.receiver.id, {
        'type': 'notifications',
        'message': content
    })

@receiver(post_save, sender=FriendInvite)
def create_notif_friend_inv(sender, instance, created, **kwargs):
    if created:
        notify.send(
            sender=instance.sender, recipient=instance.receiver, 
            description="friend_inv", action_object = instance, 
            verb="%s sent friend invite to %s" % (instance.sender.email,  instance.receiver.email)
        )
    else: 
        notif = instance.receiver.notifications.filter(
            action_object_object_id=instance.id, description="friend_inv"
        )
        notif.mark_all_as_read()

    unread_inv_notifs =  instance.receiver.notifications.filter(description="friend_inv").unread() 
    count = unread_inv_notifs.count()
    content = {
        'command': 'fetch_notifs',
        'message': {
            "friend_inv": count
        }
    }
    async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % instance.receiver.id, {
        'type': 'notifications',
        'message': content
    })

@receiver(post_save, sender=Friendship)
def create_chat_room_for_friendship(sender, instance, created, **kwargs):
    if created:
        #Create Chat Room for Friends
        room = ChatRoom.objects.create(friendship=instance)
        ChatRoomMember.objects.create(room = room, user = instance.creator)
        ChatRoomMember.objects.create(room = room, user = instance.friend)
        
        params_friend = {"sender": instance.friend, "recipient": instance.friend, "action_object": instance.creator, "verb": "became friends with"}
        params_creator = {"sender": instance.creator, "recipient": instance.creator, "action_object": instance.friend, "verb": "became friends with"}
        #Create User Notification
        notify.send(description="friend", **params_friend)
        notify.send(description="friend", **params_creator)
        
        #Create User Activity --> Ex. User became friends with User x days ago
        notify.send(description="user_activity", **params_friend)
        notify.send(description="user_activity", **params_creator)
        
        #Get Amount of Unread Friend Notifs
        unread_friend_notifs_for_creator =  instance.creator.notifications.filter(description="friend").unread().count()
        unread_friend_notifs_for_friend = instance.friend.notifications.filter(description="friend").unread().count()
        
        #Send Friend Notifs Amount To User
        content = {
            'command': 'fetch_notifs',
            'message': {
                "friend": unread_friend_notifs_for_creator
            }
        }
        async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % instance.creator.id, {
            'type': 'notifications',
            'message': content
        })

        #Send Friend Notifs Amount To User
        content = {
            'command': 'fetch_notifs',
            'message': {
                "friend": unread_friend_notifs_for_friend
            }
        }

        async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % instance.friend.id, {
            'type': 'notifications',
            'message': content
        })

@receiver(post_save, sender=ChatRoomMessage)
def create_notif_chat_message(sender, instance, created, **kwargs):
    if created:
        for member in instance.room.members.all():
            if member.user != instance.sender:
                notify.send(
                    sender=instance.sender, recipient=member.user, 
                    description="chat_message", action_object=instance.room, 
                    verb="%s sent chat message to %s" % (instance.sender.email,  member.user.email)
                )
                unread_chat_notifs =  member.user.notifications.filter(description="chat_message").unread()  
                count = unread_chat_notifs.count()  
                content = {
                    'command': 'fetch_notifs',
                    'message': {
                        "chat_message": count
                    }
                }
                async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % member.user.id, {
                    'type': 'notifications',
                    'message': content
                })