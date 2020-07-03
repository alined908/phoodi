from django.urls import path, include
from django.conf.urls import url
from django.contrib import admin
from rest_framework_simplejwt.views import TokenRefreshView
from meetup.views import MyTokenObtainPairView, GoogleOAuthView, FacebookOAuthView
from rest_framework import permissions
from .views import home

urlpatterns = [
    path("", home, name="home"),
    path("admin/", admin.site.urls),
    path("api/", include("meetup.urls")),
    path("api/", include("social.urls")),
    path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/", include("djoser.urls")),
    path("auth/google/", GoogleOAuthView.as_view(), name="google_auth"),
    path("auth/facebook/", FacebookOAuthView.as_view(), name="facebook_auth"),
    path("search/", include("search.urls")),
]