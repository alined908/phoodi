from social.models import Notification
from social.serializers import NotificationSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404

class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = NotificationSerializer(user.notifications.unread().order_by('-created_at'), many=True)

        return Response(serializer.data)

@api_view()
@permission_classes([permissions.IsAuthenticated])
def mark_all_as_read(request, *args, **kwargs):
    user = request.user
    user.notifications.mark_all_as_read()

    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view()
@permission_classes([permissions.IsAuthenticated])
def mark_as_read(request, *args, **kwargs):
    user = request.user
    notif_id = kwargs['notification_id']

    try:
        notification = Notification.objects.get(pk=notif_id)
    except Notification.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    notification.mark_as_read()

    return Response(status=status.HTTP_204_NO_CONTENT)
