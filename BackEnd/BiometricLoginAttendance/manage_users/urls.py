# urls.py
from django.urls import path
from .views import login, register
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('register', register),
    path('login', login),
    path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh', TokenRefreshView.as_view(), name='token_refresh'),
]
