from meetup.models import (
    Restaurant,
    RestaurantCategory,
    Review,
    Comment,
    CommentVote,
    ReviewVote,
    Category,
)
from meetup.serializers import (
    RestaurantSerializer,
    ReviewSerializer,
    CommentSerializer,
    ReviewVoteSerializer,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist


class RestaurantListView(APIView):
    permission_clases = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        coords, categories = [
            request.GET.get("latitude"),
            request.GET.get("longitude"),
            request.GET.get("radius"),
        ], request.GET.get("categories", [])
        restaurants = Restaurant.get_nearby(coords, request, categories)
        serializer = RestaurantSerializer(restaurants, many=True)
        return Response(serializer.data)


class RestaurantView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        restaurant = Restaurant.objects.get(url=kwargs["uri"])
        serializer = RestaurantSerializer(restaurant)

        return Response(serializer.data)


class ReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user, restaurant = request.user, Restaurant.objects.get(url=kwargs["uri"])
        serializer = ReviewSerializer(
            restaurant.r_reviews.all().order_by("-vote_score"), many=True, context={"user": user}
        )
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        user, text, rating = request.user, request.data["text"], request.data["rating"]
        restaurant = Restaurant.objects.get(url=kwargs["uri"])

        review = Review.objects.create(
            user=user, text=text, rating=rating, restaurant=restaurant
        )

        serializer = ReviewSerializer(review, context={"user": user})

        return Response(serializer.data)


class CommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user, text = request.user, request.data["text"]
        restaurant = Restaurant.objects.get(url=kwargs["uri"])
        review = Review.objects.get(pk=request.data["review_id"])

        parent_id = request.data.get("parent")
        if parent_id:
            parent = Comment.objects.get(pk=parent_id)
        else:
            parent = None

        comment = Comment.objects.create(
            user=user,
            text=text,
            restaurant=restaurant,
            review=review,
            parent_comment=parent,
        )

        serializer = CommentSerializer(comment)

        return Response(serializer.data)


class VoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user, direction = request.user, request.data["direction"]

        if request.data.get("review"):
            review = Review.objects.get(pk=request.data["review"])
            try:
                vote = ReviewVote.objects.get(user=user, review=review)
                vote.vote = direction
                vote.save()
            except ObjectDoesNotExist:
                vote = ReviewVote.objects.create(
                    user=user, review=review, vote=direction
                )
        else:
            comment = Comment.objects.get(pk=request.data["comment"])
            try:
                vote = CommentVote.objets.get(user=user, comment=comment)
                vote.vote = direction
                vote.save()
            except ObjectDoesNotExist:
                vote = CommentVote.objects.create(
                    user=user, comment=comment, vote=direction
                )

        serializer = ReviewVoteSerializer(vote)
        return Response(serializer.data)
