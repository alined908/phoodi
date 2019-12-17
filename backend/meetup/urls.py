from django.urls import path
from django.conf.urls import url
from .views import current_user, CreateUserView
from . import views

app_name='meetup'

urlpatterns=[
    path("current_user/", current_user),
    path('users/create', CreateUserView.as_view()),
    path("", views.index, name="index"),
]