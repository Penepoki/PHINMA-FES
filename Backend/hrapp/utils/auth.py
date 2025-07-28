import random
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import BasePermission
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.core.cache import cache
from django.core.mail import send_mail
from django.db import IntegrityError
from django.conf import settings
from django.utils.timezone import now
from datetime import timedelta
from hrapp.models import User, Token


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
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        roles = list(user.groups.values_list('name', flat=True))

        # Get faculty_id if available
        faculty_id = None
        if hasattr(user, 'faculty') and user.faculty:
            faculty_id = user.faculty.id

        return {
            'token': token.key,
            'roles': roles,
            'faculty_id': faculty_id,  # <-- Add this line
        }
    else:
        return {'error': 'Invalid credentials'}

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

#ROLE FOR DRF
class IsHR(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='HR').exists()

class IsDean(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='Dean').exists()

class IsProgramHead(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='Program Head').exists()

class ExpiredTokenAuthentication(TokenAuthentication):
    """
    Custom token authentication that checks for token expiry.
    """
    model = Token

    def authenticate_credentials(self, key):
        try:
            token = self.model.objects.select_related('user').get(key=key)
        except self.model.DoesNotExist:
            raise AuthenticationFailed("Invalid Token")

        # Check expiry
        if token.has_expired():
            raise AuthenticationFailed("Token has expired. Please log in again.")

        return (token.user, token)


# Permission check for evaluation access
def user_can_access_evaluation(user, evaluation):
    """Determines if a user has permission to access a specific evaluation.

    Args:
        user: The user requesting access
        evaluation: The evaluation object to check access for

    Returns:
        bool: True if the user can access the evaluation, False otherwise
    """
    # HR, Dean, and Program Head can access all evaluations
    if user.groups.filter(name__in=['HR', 'Dean', 'Program Head']).exists():
        return True

    # The evaluator of the evaluation can access it
    if evaluation.evaluator == user:
        return True

    # If the evaluation has a schedule, check if the user is the instructor
    #if evaluation.schedule and evaluation.schedule.instructor == user:
        #return True

    # Default: no access
    return False