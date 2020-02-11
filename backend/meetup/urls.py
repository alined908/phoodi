from django.urls import path
from django.conf.urls import url
from .views import current_user, CategoryListView, MeetupEventsListView, MeetupEventsView, MeetupInviteAllView, CreateUserView, ChatRoomView, ChatRoomMessageView, UserFriendsView, MeetupView, MeetupListView, MeetupInviteListView, MeetupInviteView, MeetupMembersView, FriendInviteView, FriendInviteListView
from . import views

app_name='meetup'

urlpatterns=[
    path("current_user/", current_user),
    path('users/', CreateUserView.as_view()),
    path("categories/", views.CategoryListView.as_view()),
    path("meetups/", views.MeetupListView.as_view()),
    path("meetups/invite/", views.MeetupInviteAllView.as_view()),
    path("meetups/<uri>/", views.MeetupView.as_view()),
    path("meetups/<uri>/events/", views.MeetupEventsListView.as_view()),
    path("meetups/<uri>/events/<id>/", views.MeetupEventsView.as_view()),
    path("meetups/<uri>/members/", views.MeetupMembersView.as_view()),
    path("meetups/<uri>/invite/", views.MeetupInviteListView.as_view()),
    path("meetups/<uri>/invite/<invite_code>/", views.MeetupInviteView.as_view()),
    path("chats/", views.ChatRoomListView.as_view()),
    path("chats/<uri>/", views.ChatRoomView.as_view()),
    path("chats/<uri>/messages/", views.ChatRoomMessageView.as_view()),
    path("friends/", views.UserFriendsView.as_view()),
    path("friends/invite/", views.FriendInviteListView.as_view()),
    path("friends/invite/<invite_code>/", views.FriendInviteView.as_view())
]