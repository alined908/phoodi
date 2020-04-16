from meetup.models import MeetupCategory, Category
from meetup.serializers import CategorySerializer, CategoryVerboseSerializer
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db.models.expressions import RawSQL

class CategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        if request.GET.get('popular', False):
            categories = Category.objects.filter(id__in=RawSQL(
                'SELECT p.id FROM (SELECT pref.category_id as id, COUNT(*) as num\
                FROM meetup_preference as pref \
                GROUP BY pref.category_id \
                ORDER BY COUNT(*) DESC) as p\
                LIMIT 16', params=()))
        elif request.GET.get('random', False):
            categories = Category.objects.filter(id__in=RawSQL(
                'SELECT id \
                FROM meetup_category \
                ORDER BY random() \
                LIMIT 26', params=()))
        else:
            categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response({"categories": serializer.data})

class CategoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        api_label = kwargs['api_label']
        category = Category.objects.get(api_label=api_label)
        serializer = CategoryVerboseSerializer(category, context={"user": request.user})
        return Response(serializer.data)