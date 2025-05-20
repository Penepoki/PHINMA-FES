from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from hrapp.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from datetime import timedelta
from hrapp.models import Token  # Import your custom Token model
from django.conf import settings


##DEFAULT ROLE/GROUP FOR NEW USERS IS STUDENT


@receiver(post_save, sender=User)
def assign_default_group(sender, instance, created, **kwargs):
    """Automatically assigns a new user to the 'Student' group."""
    if created:
        default_group, _ = Group.objects.get_or_create(name="Student")
        instance.groups.add(default_group)
        instance.save()

@receiver(post_save, sender=User)
def token_expiry(sender, instance=None, created=False, **kwargs):
    """Automatically assigns a new user to the 'Student' group."""
    if created and not instance.expires_at:
        instance.expires_at = now() + timedelta(seconds=settings.TOKEN_EXPIRY_DURATION)
        instance.save()