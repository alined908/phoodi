from django.urls import path
from . import views

app_name = "search"

urlpatterns = [
    path('categories/', views.CategoryDocumentView.as_view()),
    path('restaurants/', views.RestaurantDocumentView.as_view()),
    path('users/', views.UserDocumentView.as_view())
]