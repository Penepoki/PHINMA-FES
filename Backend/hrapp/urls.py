from django.urls import path
from . import views  # Ensure this does not cause a circular import
from .views import *

urlpatterns = [
    path('login/', login_view),

    path('signup/', signup_view),

    path('latest-evaluation/', latest_evaluation),

    path('all-evaluation/', get_evaluations),

    path('user-dashboard/', user_view_dashboard, name='user-dashboard'),

    path('user-profile/', user_view_profile),

    path('forgot-password/', forgot_password_view),

    path('verify-otp/', verify_otp_view),
]
