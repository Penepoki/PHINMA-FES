import random
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.core.cache import cache
from django.core.mail import send_mail

from hrapp.models import User


def authenticate_user(data):
    username_or_email = data.get('username') or data.get('email')
    password = data.get('password')

    try:
        user_obj = User.objects.get(email=username_or_email)
        username = user_obj.username
    except User.DoesNotExist:
        username = username_or_email

    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        roles = list(user.groups.values_list('name', flat=True))
        print(f"Authenticated user: {user.username}, Email {user.email} , Roles: {roles}")  # <-- Debugging

        return {'token': token.key, 'roles': roles }
    else:
        print("Login attempt with:")
        print("Resolved username for auth:", username)
        print("User found:", user)
    return {'error': 'Invalid credentials'
            }

def generate_otp_code():
    return str(random.randint(100000, 999999))

def send_otp_via_email(user):
    verif_code = generate_otp_code()
    cache.set(f'otp_{user.id}', verif_code, timeout=600) #600= 10mins timeout is seconds

    send_mail(
        subject='OTP Verification',
        message=f'OTP Verification Code: {verif_code} This Code will expire in 10 minutes.',
        from_email='no-reply@saintjude.com',
        recipient_list=[user.email],
    )
    return True

def verify_otp(user, input_code):
    expected_code = cache.get(f'otp_{user.id}')
    return expected_code == input_code