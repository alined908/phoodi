from django.urls import path
from django.conf.urls import url
from .views import current_user, CreateUserView, ChatRoomView, ChatRoomMessageView, UserFriendsView, MeetUpView
from . import views

app_name='meetup'

urlpatterns=[
    path("current_user/", current_user),
    path("meetups/", views.MeetUpView.as_view()),
    path("meetups/<uri>/", views.MeetUpView.as_view()),
    path('users/', CreateUserView.as_view()),
    path("chats/", views.ChatRoomView.as_view()),
    path("chats/<uri>/", views.ChatRoomView.as_view()),
    path("chats/<uri>/messages/", views.ChatRoomMessageView.as_view()),
    path("friends/", views.UserFriendsView.as_view()),
]