from django.urls import path
from . import views

app_name = "social"

urlpatterns = [
    path('activities/', views.ActivityFeedView.as_view()),
    path('activities/<activity_id>/comments/', views.ActivityCommentView.as_view()),
    path('activities/<activity_id>/likes/', views.ActivityLikeView.as_view()),
    path('follows/', views.FollowListView.as_view()),
    path('follows/<follow_id>/', views.FollowView.as_view()),
    path('groups/', views.GroupListView.as_view()),
    path('groups/<group_id>/', views.GroupView.as_view()),
    path('posts/', views.PostListView.as_view()),
    path('posts/<post_id>/', views.PostView.as_view()),
    path('notifications/', views.NotificationListView.as_view()),
    path('notifications/mark-all-as-read/', views.mark_all_as_read, name='mark_all_as_read'),
    path('notifications/mark-as-read/<notification_id>/', views.mark_as_read, name='mark_as_read')
]