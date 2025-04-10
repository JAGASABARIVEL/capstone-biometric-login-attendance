# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    face_encoding = models.TextField(null=True, blank=True)  # Store encoding as CSV string
