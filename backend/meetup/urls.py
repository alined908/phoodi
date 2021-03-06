from django.urls import path
from . import views

app_name = "meetup"

urlpatterns = [
    path("users/", views.UserListView.as_view()),
    path("users/settings/", views.UserSettingsView.as_view()),
    path("users/<id>/", views.UserView.as_view()),
    path("users/<id>/friends/", views.UserFriendsView.as_view()),
    path("users/<id>/preferences/", views.UserPreferenceListView.as_view()),
    path("users/<id>/preferences/<category_id>/", views.UserPreferenceView.as_view()),
    path("categories/", views.CategoryListView.as_view()),
    path("categories/<api_label>/", views.CategoryView.as_view()),
    path("restaurants/", views.RestaurantListView.as_view()),
    path("restaurants/<uri>/", views.RestaurantView.as_view()),
    path("restaurants/<uri>/reviews/", views.ReviewListView.as_view()),
    path("restaurants/<uri>/reviews/<review_id>/", views.ReviewView.as_view()),
    path("reviews/<review_id>/comments/", views.CommentListView().as_view()),
    path("reviews/<review_id>/comments/<comment_id>/", views.CommentView().as_view()),
    path("vote/", views.VoteView().as_view()),
    path("meetups/", views.MeetupListView.as_view()),
    path("meetups/invite/", views.MeetupInviteAllView.as_view()),
    path("meetups/<uri>/", views.MeetupView.as_view()),
    path("meetups/<uri>/email/", views.MeetupEmailView.as_view()),
    path("meetups/<uri>/events/", views.MeetupEventsListView.as_view()),
    path("meetups/<uri>/events/<id>/", views.MeetupEventsView.as_view()),
    path("meetups/<uri>/members/", views.MeetupMembersView.as_view()),
    path("meetups/<uri>/invite/", views.MeetupInviteListView.as_view()),
    path("meetups/<uri>/invite/<invite_code>/", views.MeetupInviteView.as_view()),
    path("friends/invite/", views.FriendInviteListView.as_view()),
    path("friends/invite/<invite_code>/", views.FriendInviteView.as_view()),
    path("chats/", views.ChatRoomListView.as_view()),
    path("chats/<uri>/", views.ChatRoomView.as_view()),
    path("chats/<uri>/messages/", views.ChatRoomMessageView.as_view()),
]
