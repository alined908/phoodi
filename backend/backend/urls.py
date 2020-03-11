from django.urls import path, include
from django.contrib import admin
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token, verify_jwt_token
from .views import home

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('meetup.urls')),
    path('api/token-auth/', obtain_jwt_token),  
    path('api/token-refresh/', refresh_jwt_token),
    path('api/token-verify/', verify_jwt_token)
]
