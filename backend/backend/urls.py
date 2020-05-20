from django.urls import path, include
from django.contrib import admin
from rest_framework_simplejwt.views import TokenRefreshView
from meetup.views import MyTokenObtainPairView
from .views import home
from search import urls as search_urls

urlpatterns = [
    path("", home, name="home"),
    path("", include("social_django.urls", namespace="social")),
    path("admin/", admin.site.urls),
    path("api/", include("meetup.urls")),
    path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/", include("djoser.urls")),
    path("search/", include(search_urls))
]
