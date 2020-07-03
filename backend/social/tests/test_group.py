from django.test import TestCase
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.test import APIClient

client = APIClient()

class GroupTest(TestCase):
    pass