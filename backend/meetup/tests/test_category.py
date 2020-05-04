from meetup.models import Category, User
from meetup.serializers import CategorySerializer
from rest_framework import status
from rest_framework.test import APIClient
from django.test import TestCase
from django.contrib.auth.hashers import make_password

client = APIClient()


class CategoryViewTest(TestCase):
    fixtures = ("2_categories.json",)

    def setUp(self):
        self.user = User.objects.create(
            email="test@gmail.com",
            password=make_password("password"),
            first_name="Daniel",
            last_name="Lee",
        )
        self.dessert = Category.objects.get(api_label="desserts")
        client.force_authenticate(user=self.user)

    def test_CategoryListView_GET_all(self):
        response = client.get("/api/categories/")
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["categories"], serializer.data)

    def test_CategoryListView_GET_popular(self):
        response = client.get("/api/categories/?type=popular")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_CategoryListView_GET_random(self):
        response = client.get("/api/categories/?type=random")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["categories"]), 26)

    def test_CategoryView_GET_valid(self):
        response = client.get("/api/categories/" + self.dessert.api_label + "/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_CategoryView_GET_invalid(self):
        response = client.get("/api/categories/gibberish/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"error": "Category does not exist"})
