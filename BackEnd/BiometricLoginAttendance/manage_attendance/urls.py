# urls.py
from django.urls import path
from .views import mark

urlpatterns = [
    path('mark', mark),
]
