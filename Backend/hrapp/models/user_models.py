from datetime import timedelta
from rest_framework.authtoken.models import Token as DefaultToken
from django.conf import settings
from django.utils.timezone import now
from django.db import models
from django.contrib.auth.models import AbstractUser, Permission
from django.contrib.auth.base_user import BaseUserManager
from .custom_manager import *
# Custom User Model

# Custom Managers
class ActiveManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

class UserManager(BaseUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)  # Example: Only active users

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    email = models.EmailField(unique=True)
    supervisor = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)
    is_deleted = models.BooleanField(default=False)

    #ByteISO or Image (Profile PICTURE!!!)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)


    def restore(self):
        """Restore a soft-deleted user."""
        self.is_deleted = False
        self.save()
    objects = UserManager()  # Custom manager   # Only active users
    all_objects = models.Manager()  # this to get all users (including deleted)
    active_objects = ActiveManager()
    soft_deleted_objects = SoftDeleteManager()

    def __str__(self):
        return self.email

    @property
    def role(self):
        """Return the first group name as the role."""
        return self.groups.first().name if self.groups.exists() else None

    class Meta:
        permissions = [
            #Add Custom Permissions Here

        ]

    def get_full_name(user):
        return f"{user.first_name} {user.last_name}".strip()

    @property
    def full_name(self):
        """A shorter way to access the full name."""
        return self.get_full_name()


#TOKEN
class Token(DefaultToken):
    expires_at = models.DateTimeField(null=True, blank=True)
    def has_expired(self):
        if self.expires_at:
            return now()> self.expires_at
        return False

    def regenerate_expiry(self, duration=settings.TOKEN_EXPIRY_DURATION):
        self.expires_at = now() + timedelta(seconds=duration)
        self.save()

    def save(self, *args, **kwargs):
        if self.expires_at is None:
            self.expires_at = now() + timedelta(seconds=settings.TOKEN_EXPIRY_DURATION)
        super().save(*args, **kwargs)