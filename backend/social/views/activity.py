from social.models import Activity, ActivityComment, ActivityLike
from social.serializers import ActivitySerializer, ActivityCommentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist, ValidationError

class ActivityFeedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = ActivitySerializer(user.activities(), many=True, context={"user": user})

        return Response(serializer.data)

class ActivityCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_activity(self, pk):
        obj = get_object_or_404(Activity, pk=pk)
        return obj

    def post(self, request, *args, **kwargs):
        activity_id = kwargs['activity_id']
        activity = self.get_activity(activity_id)

        user = request.user
        text = request.data.get('text')
        parent_id = request.data.get('parent')

        if parent_id:
            try:
                parent = ActivityComment.objects.get(pk=parent_id)
            except ActivityComment.DoesNotExist:
                return Response({"error": "Parent comment does not exist."}, status=404)
        else:
            parent = None
        try:
            comment = ActivityComment.objects.create(
                user=user,
                text=text,
                activity=activity,
                parent=parent,
            )
        except ValidationError as e:
            return Response({"errors": e.messages}, status=404)
        
        serializer = ActivityCommentSerializer(comment)
        return Response(serializer.data)
    
    def delete(self, request, *args, **kwargs):
        activity_id = kwargs['activity_id']
        activity = self.get_activity(activity_id)
        activity.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

class ActivityLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_activity(self, pk):
        obj = get_object_or_404(Activity, pk=pk)
        return obj

    def post(self, request, *args, **kwargs):
        activity_id = kwargs['activity_id']
        activity = self.get_activity(activity_id)

        user = request.user
        value = request.data.get('value')

        try:
            like = ActivityLike.objects.get(
                user = user, 
                activity=activity
            )
            like.status = value
            like.save()
        except ActivityLike.DoesNotExist:
            try:
                vote = ActivityLike.objects.create(
                    user = user, 
                    activity=activity
                )
            except ValidationError as e:
                return Response({"errors": e.messages}, status=404)

        return Response(status=status.HTTP_204_NO_CONTENT)