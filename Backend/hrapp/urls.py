from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter

course_router = DefaultRouter()
course_router.register(r'courses', CourseViewSet, basename='course')
course_router.register(r'course-professors',
                CourseProfessorViewSet, basename='course-professor')
urlpatterns = [
    path('', include(course_router.urls)),

    path('login/', login_view),

    path('signup/', signup_view),

    path('latest-evaluation/', get_latest_evaluation),


    path('user-dashboard/', user_view_dashboard, name='user-dashboard'),

    path('user-profile/', user_view_profile),

    path('forgot-password/', forgot_password_view),

    path('verify-otp/', verify_otp_view),

    path('set-new-password/', set_new_password_view),

]
