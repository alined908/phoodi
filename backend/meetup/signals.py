from .models import User, ChatRoom, MeetupCategory, ChatRoomMessage, ChatRoomMember, MeetupMember, MeetupEventOptionVote, Meetup, MeetupEvent, MeetupEventOption, MeetupInvite, FriendInvite, Friendship
from channels.layers import get_channel_layer
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from notifications.signals import notify

channel_layer = get_channel_layer()
conversion = {1: 1, 2: -1}

@receiver(post_save, sender=Meetup)
def create_chat_room_for_meetup(sender, instance, created, **kwargs):
    if created:
        uri = instance.uri
        name = instance.name
        ChatRoom.objects.create(uri=uri, name=name, meetup=instance)

@receiver(post_save, sender=MeetupMember)
def create_chat_room_member_and_update_meetup_with_member(sender, instance, created, **kwargs):
    from .serializers import MeetupMemberSerializer
    meetup = instance.meetup
    user = instance.user
    if created:
        room = ChatRoom.objects.get(uri=meetup.uri) 
        ChatRoomMember.objects.create(room = room, user = user)
        serializer = MeetupMemberSerializer(instance)
        content = {
            'command': 'new_member',
            'message': {'meetup': meetup.uri, 'member': serializer.data}
        }
        async_to_sync(channel_layer.group_send)('meetup_%s' % meetup.uri, {
             'type': 'meetup_event',
             'meetup_event': content
        })

@receiver(pre_save, sender = MeetupEvent)
def handle_generate_options_on_meetup_event_field_change(sender, instance, **kwargs):
    if instance.id is None:
        pass
    else:
        previous = MeetupEvent.objects.get(pk=instance.id)
        if previous.price != instance.price or previous.distance != instance.distance or previous.entries != instance.entries or previous.start != instance.start or (not previous.random and instance.random):
            if previous.entries != instance.entries:
                previous.event_categories.all().delete()
            instance.delete_options()
            instance.generate_options()
        

@receiver(post_save, sender = MeetupEvent)
def handle_notif_on_meetup_event_create(sender, instance, created, **kwargs):
    from .serializers import MeetupEventSerializer
    meetup = instance.meetup
    
    if created:
        if instance.random:
            instance.generate_options()
        else:
            instance.convert_entries_to_string()
        #Handle Notif Update
        for member in meetup.members.all():
            if member != instance.creator:
                user = member.user
                notify.send(sender=meetup, recipient=user, description="meetup", actor_object_id=instance.id, verb="%s created new event for %s" % (instance.creator, meetup.name))
                unread_meetup_notifs =  user.notifications.filter(description="meetup").unread()  
                count = unread_meetup_notifs.count()  
                content = {
                    'command': 'fetch_notifs',
                    'message': {"meetup": count}
                }
                async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % user.id, {
                    'type': 'notifications',
                    'message': content
                })

    #Handle Event Update
    content = {
        'command': 'new_event',
        'message': {'meetup': meetup.uri, 'event': {instance.id: MeetupEventSerializer(instance).data}}
    }
    async_to_sync(channel_layer.group_send)('meetup_%s' % meetup.uri, {'type': 'meetup_event','meetup_event': content})

@receiver(post_save, sender = MeetupInvite)
def create_notif_meetup_inv(sender, instance, created, **kwargs):
    if created:
        notify.send(sender=instance.sender, recipient=instance.receiver, description="meetup_inv", actor_object_id = instance.id, verb="%s sent meetup invite to %s" % (instance.sender.email,  instance.receiver.email))
    else: 
        notif = instance.receiver.notifications.filter(actor_object_id = instance.id, description="meetup_inv", verb="%s sent meetup invite to %s" % (instance.sender.email,  instance.receiver.email))
        notif.mark_all_as_read()
    
    unread_inv_notifs =  instance.receiver.notifications.filter(description="meetup_inv").unread()  
    count = unread_inv_notifs.count()  
    content = {
        'command': 'fetch_notifs',
        'message': {"meetup_inv": count}
    }
    async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % instance.receiver.id, {
        'type': 'notifications',
        'message': content
    })

@receiver(post_save, sender=FriendInvite)
def create_notif_friend_inv(sender, instance, created, **kwargs):
    if created:
        notify.send(sender=instance.sender, recipient=instance.receiver, description="friend_inv", actor_object_id = instance.id, verb="%s sent friend invite to %s" % (instance.sender.email,  instance.receiver.email))
    else: 
        notif = instance.receiver.notifications.filter(actor_object_id=instance.sender.id, description="friend_inv",  verb="%s sent friend invite to %s" % (instance.sender.email,  instance.receiver.email))
        notif.mark_all_as_read()

    unread_inv_notifs =  instance.receiver.notifications.filter(description="friend_inv").unread() 
    count = unread_inv_notifs.count()
    content = {
        'command': 'fetch_notifs',
        'message': {"friend_inv": count}
    }
    async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % instance.receiver.id, {
        'type': 'notifications',
        'message': content
    })

@receiver(post_save, sender=Friendship)
def create_chat_room_for_friendship(sender, instance, created, **kwargs):
    if created:
        room = ChatRoom.objects.create(friendship=instance)
        ChatRoomMember.objects.create(room = room, user = instance.creator)
        ChatRoomMember.objects.create(room = room, user = instance.friend)

        notify.send(sender=instance.creator, recipient=instance.friend, description="friend", actor_object_id = instance.id, verb="You are now friends with %s" % instance.creator)
        notify.send(sender=instance.friend, recipient=instance.creator, description="friend", actor_object_id = instance.id, verb="You are now friends with %s" % instance.friend)
        unread_friend_notifs_for_creator =  instance.creator.notifications.filter(description="friend").unread().count()
        unread_friend_notifs_for_friend = instance.friend.notifications.filter(description="friend").unread().count()
        content = {
            'command': 'fetch_notifs',
            'message': {"friend": unread_friend_notifs_for_creator}
        }
        async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % instance.creator.id, {
            'type': 'notifications',
            'message': content
        })
        content = {
            'command': 'fetch_notifs',
            'message': {"friend": unread_friend_notifs_for_friend}
        }
        async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % instance.friend.id, {
            'type': 'notifications',
            'message': content
        })

@receiver(post_save, sender=ChatRoomMessage)
def create_notif_chat_message(sender, instance, created, **kwargs):
    print("create_notif_chat_message receiver")
    if created:
        for member in instance.room.members.all():
            if member.user != instance.sender:
                notify.send(sender=instance.room, recipient=member.user, description="chat_message", actor_object_id=instance.room.id, verb="%s sent chat notif to %s" % (instance.sender.email,  member.user.email))
                unread_chat_notifs =  member.user.notifications.filter(description="chat_message").unread()  
                count = unread_chat_notifs.count()  
                content = {
                    'command': 'fetch_notifs',
                    'message': {"chat_message": count}
                }
                async_to_sync(channel_layer.group_send)("notif_room_for_user_%d" % member.user.id, {
                    'type': 'notifications',
                    'message': content
                })