from meetup.models import User, Meetup, MeetupInvite, FriendInvite
from meetup.serializers import MeetupInviteSerializer, FriendInviteSerializer
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db.models.expressions import RawSQL


class MeetupInviteAllView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get all invites for user
        """
        user = request.user
        invites = user.received_meetupinvites.filter(status=1).all()
        return Response(MeetupInviteSerializer(invites, many=True).data)

class MeetupInviteListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get all invites from meetup
        """
        user = request.user
        uri = kwargs['uri']

        try: 
            meetup = Meetup.objects.get(uri=uri)
        except ObjectDoesNotExist:
            return Response({"error": "Room does not exist"},status=status.HTTP_400_BAD_REQUEST)

        invites = meetup.invs.filter(receiver=user)

        return Response(MeetupInviteSerializer(invites, many=True).data)

    def post(self, request, *args, **kwargs):
        """
        Create/Send Invite
        """
        user = request.user
        recepient = request.data['email']
        uri = kwargs['uri']

        try: 
            meetup = Meetup.objects.get(uri=uri)
        except ObjectDoesNotExist:
            return Response({"error": "Room does not exist"},status=status.HTTP_404_NOT_FOUND)

        try: 
            invite = User.objects.get(email=recepient)
        except ObjectDoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)

        invite, created = MeetupInvite.objects.get_or_create(meetup=meetup, sender=user, receiver=invite)

        if created:
            return Response({"message": "Invite for meetup sent to " + recepient})
        else:
            return Response({"message": "Invite already sent out to " + recepient})

class MeetupInviteView(APIView):

    def patch(self, request, *args, **kwargs):
        """
        Change status of invite
        """
        user = request.user
        room_uri = kwargs['uri']
        invite_uri = kwargs['invite_code']
        num = request.data['status']
        
        try: 
            meetup = Meetup.objects.get(uri=room_uri)
        except ObjectDoesNotExist:
            return Response({"error": "Room does not exist"},status=status.HTTP_400_BAD_REQUEST)

        try:
            invite = MeetupInvite.objects.get(meetup=meetup, uri=invite_uri)
        except ObjectDoesNotExist:
            return Response({"error": "Invite does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        if user != invite.receiver:
            return Response({"error": "Not your invite"}, status=status.HTTP_400_BAD_REQUEST)

        invite.status = int(num)
        invite.save()

        message = ""
        if invite.status == 2:
            message = "Successfully accepted meetup invite."
        elif invite.status == 3:
            message = "Rejected meetup invite."
        return Response({"message": message, "invite": MeetupInviteSerializer(invite).data})

class FriendInviteListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Get Friend Request Invites
        """
        user = request.user
        received_invs = user.received_friendinvites.filter(status=1).all()
        serializer = FriendInviteSerializer(received_invs, many=True)

        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """
        Send Friend Request 
        """
        user = request.user
        recepient = request.data['email']

        #Check User exists
        try: 
            invitee = User.objects.get(email=recepient)
        except ObjectDoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        #Check if already friends
        friendship = user.is_friend(invitee)
        if friendship:
            return Response({"message": "You are already friends with %s" % recepient})

        invite, created = FriendInvite.objects.get_or_create(sender=user, receiver=invitee)
        serializer = FriendInviteSerializer(invite)

        #Check status of invite
        if created:
            return Response({"message": "Invite sent to " + recepient, "invite": serializer.data})
        else:
            return Response({"message": "Invite to " + recepient + " has been sent.", "invite": serializer.data})
        

class FriendInviteView(APIView):

    def patch(self, request, *args, **kwargs):
        user = request.user
        uri = kwargs['invite_code']
        num = request.data['status']

        try:
            invite = FriendInvite.objects.get(uri=uri)
        except ObjectDoesNotExist:
            return Response({"error": "Invite does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        if user != invite.receiver:
            return Response({"error": "Not your invite"}, status=status.HTTP_400_BAD_REQUEST)
        
        invite.status = int(num)
        invite.save()
        serializer = FriendInviteSerializer(invite)

        message = ""
        if invite.status == 2:
            message = "Successfully accepted friend invite."
        elif invite.status == 3:
            message = "Rejected friend invite."

        return Response({"message": message, "invite": serializer.data})