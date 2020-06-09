from django.core.management import call_command
from meetup.models import User, Restaurant, Category, RestaurantCategory
from search.documents import CategoryDocument, RestaurantDocument
from django.core.management import call_command
from elasticsearch_dsl import Search, Q
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.hashers import make_password
from django.test import TestCase

client = APIClient()

class UnitTestControl(TestCase):
    
    def rebuild_index(self):
        call_command('search_index', '--rebuild', force=True)

class SearchUnitTest(UnitTestControl):
    fixtures = ("1_users.json","3_restaurants.json",)

    def setUp(self):
        print('hello')
        self.rebuild_index()
        self.user = User.objects.get(pk=1)
        self.pizza_rst = Restaurant.objects.get(pk=1)
        fields = vars(self.pizza_rst)
        fields.pop('_state')
        fields.pop('id')
        fields.pop('url')
        fields['name'] = 'ice cream parlor'
        self.dessert_rst = Restaurant.objects.create(**fields)
        self.category1 = Category.objects.create(api_label="desserts", label="Desserts")
        RestaurantCategory.objects.create(restaurant=self.dessert_rst, category=self.category1)

    def test_restaurant_search_by_name(self):
        s = RestaurantDocument.search()
        q = Q('query_string', query='ice', default_field='name')
        s = s.query(q)
        self.assertEqual(s.count(), 1)
        response = s.execute()
        rst = response[0]
        self.assertEqual(rst.name, self.dessert_rst.name)

    def test_restaurant_search_by_category(self):
        s = RestaurantDocument.search()
        q = Q('nested', path='categories', query=Q('query_string', query="de", default_field='categories.label'))
        s = s.query(q)
        self.assertEqual(s.count(), 1)
        response = s.execute()
        rst = response[0]
        self.assertEqual(rst.name, self.dessert_rst.name)

    def test_restaurant_search_by_category_multiple_words(self):
        italian = Category.objects.create(api_label="italian", label="Italian Food")
        RestaurantCategory.objects.create(restaurant=self.dessert_rst, category=italian)
        s = RestaurantDocument.search()
        q = Q('nested', path='categories', query=Q('query_string', query="italian", default_field='categories.label'))
        s = s.query(q)
        self.assertEqual(s.count(), 1)
        multiple = RestaurantDocument.search()

    def test_category_search(self):
        s = CategoryDocument.search()
        s = s.query("query_string", query='de', default_field="label")
        self.assertEqual(s.count(), 1)
        response = s.execute()
        dessert = response[0]
        self.assertEqual(dessert.label, self.category1.label)
        self.assertEqual(dessert.api_label, self.category1.api_label)

    
