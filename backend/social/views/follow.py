from social.models import Follow, Group
from meetup.models import User, Restaurant
from rest_framework.views import APIView
from social.serializers import FollowSerializer
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist

class FollowListView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, *args, **kwargs):
        user = request.user
        follows = user.follows.all()

        serializer = FollowSerializer(follows, many=True)

        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        user = request.user
        
        try:
            if request.data.get('user'):
                user_id = request.data.get('user')
                followee = User.objects.get(pk=user_id)
            elif request.data.get('group'):
                group_id = request.data.get('group')
                followee = Group.objects.get(pk=group_id)
            elif request.data.get('restaurant'):
                restaurant_id = request.data.get('restaurant')
                followee = Restaurant.objects.get(pk=restaurant_id)
            else:
                followee = None
        except ObjectDoesNotExist:
            return Response({"error": "Followee object does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        if not followee:
            return Response({"error": "Followee object does not exist."}, status=status.HTTP_404_NOT_FOUND)

        try:
            follow = Follow.objects.get(
                follower = user, 
                followee_content_type = followee.get_content_type(),
                followee_object_id = followee.id
            )
            return Response({'message': "Already following."}, status=status.HTTP_200_OK)
        except Follow.DoesNotExist:
            try:
                follow = Follow.objects.create(follower=user, followee=followee)
            except ValidationError as e:
                return Response({"errors": e.messages}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)
            

class FollowView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def delete(self, request, *args, **kwargs):
        follow_id = kwargs['follow_id']

        try:
            follow = Follow.objects.get(pk=follow_id)
        except Follow.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        follow.delete()

        return Response(status=status.HTTP_204_NO_CONTENT) 

