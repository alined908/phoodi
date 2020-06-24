from social.models import Post
from social.serializers import PostSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist, ValidationError

class PostListView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get(self, request, *args, **kwargs):
        user = request.user

        posts = Post.objects.filter(poster_user=user)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        user = request.user

        content = request.data.get('content')

        try:
            post = Post.objects.create(poster_user=user, content=content)
        except ValidationError as e:
            return Response({"errors": e.messages}, status=404)

        serializer = PostSerializer(post)

        return Response(serializer.data)

class PostView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def delete(self, request, *args, **kwargs):
        post_id = kwargs['post_id']

        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)
            