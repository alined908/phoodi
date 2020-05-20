from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter
from .views import CategoryDocumentView

router = DefaultRouter()

router.register(r'categories', CategoryDocumentView, basename="categorydocument")

urlpatterns = [
    url(r'^', include(router.urls))
]