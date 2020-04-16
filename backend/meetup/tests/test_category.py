from meetup.models import Category
from meetup.serializers import CategorySerializer
from rest_framework import status
from rest_framework.test import APIClient
from django.test import TestCase

client = APIClient()

class CategoryViewTest(TestCase):

    def test_GET_category(self):
        response = client.get("/api/categories/")
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        self.assertEqual(response.json()['categories'], serializer.data)