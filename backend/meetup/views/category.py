from meetup.models import MeetupCategory, Category
from meetup.serializers import (
    CategorySerializer,
    CategoryVerboseSerializer,
    RestaurantSerializer,
)
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

class CategoryListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        specified = request.GET.get("type")

        if specified == "popular":
            categories = Category.get_popular()
        elif specified == "random":
            categories = Category.get_random_many()
        else:
            categories = Category.objects.all()

        serializer = CategorySerializer(categories, many=True)
        return Response({"categories": serializer.data})


class CategoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        api_label = kwargs["api_label"]

        try:
            category = Category.objects.get(api_label=api_label)
            cat_serializer = CategoryVerboseSerializer(
                category, context={"user": request.user}
            )
            return Response(cat_serializer.data)
        except:
            return Response(
                {"error": "Category does not exist"}, status=status.HTTP_400_BAD_REQUEST
            )
